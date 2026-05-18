import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui.js";
import RandomQuiz from "../components/scripts/random-quiz.js";
import {LevelMap, Config, QuizUI_Setting} from "../constants.js";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";
import Quiz from "../entity/script/quiz.js";
import QuizGameData from "../data/scripts/quiz-game-data.js";
import { EventBus } from "../../../core/EventBus.js";
import ReplayLogBuffer from "../../../core/replay-log-buffer.js";
import {ContextCluesReplayEvent, GlobalReplayEvent} from "../../../core/replay-event.js";
import game_db from "/src/util/minigame-db-util.js";
import SessionStorageManager from "../../../core/session-storage-manager.js";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
    this.levelMap = "";
    this.quizData = [];
    this.round = 0;
    this.allScore = 0;
    this.timeLeftSeconds = 180;
    this.timeLimitSeconds = 180;
    this.countdownTimer = null;
    this.isGameEnded = false;
  }

  preload() {
    this.load.image('button-idle','assets/button_rectangle_depth_flat.png')
    this.load.image('button-press','assets/button_rectangle_flat.png')
    this.load.image('context-clues-bg','assets/bg.png')
  }

  init(data = {}) {
    this.level = data.level ?? Number(SessionStorageManager.get("selected_game_level"));
    this.levelMap = LevelMap[this.level];
    this.randomQuiz = new RandomQuiz(this.levelMap);
    this.allScore = 0;
    this.round = 0;
    this.quizData = [];
    this.timeLimitSeconds = data.timeLimitSeconds ?? Config.TimeLimitSeconds;
    this.timeLeftSeconds = this.timeLimitSeconds;
    this.countdownTimer = null;
    this.isGameEnded = false;
  }

  create(data = {}) {
    this.createSceneBackdrop();
    this.quizBoxSize = this.resolveQuizBoxSize();
    this.gameplayUI = new GameplayUI(this, 0, 0);
    this.replayLog = new ReplayLogBuffer();
    this.gameplayUI.setLevel(this.levelMap, this.level, 1, Config.MaxRound[this.levelMap]);
    this.syncTimerUI();

    // Initial state to HUD
    EventBus.emit('minigame:score', { score: this.allScore });
    EventBus.emit('minigame:level', { level: `ด่าน 1/${Config.MaxRound[this.levelMap]}` });

    // Create First Quiz
    this.getNewQuiz();
    this.gameStartedAt = new Date();
    this.gameEndedAt = new Date();
    this.startCountdownTimer();

    this.gameplayUI.setDepth(100);
  }

  startCountdownTimer() {
      this.countdownTimer?.remove(false);
      this.countdownTimer = this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
              if (this.isGameEnded) {
                  return;
              }

              this.timeLeftSeconds = Math.max(0, this.timeLeftSeconds - 1);
              this.syncTimerUI();

              if (this.timeLeftSeconds <= 0) {
                  this.endGame("failure");
              }
          }
      });
  }

  syncTimerUI() {
      const timeLeft = Math.max(0, Math.ceil(this.timeLeftSeconds));

      this.gameplayUI?.setTimeLeft(timeLeft);
      EventBus.emit('minigame:tick', {
          timeLeft,
          maxTime: this.timeLimitSeconds,
      });
  }

  resolveQuizBoxSize() {
      const levelBoxSize = QuizUI_Setting.quizBoxSize?.[this.levelMap];
      const boxSize = Array.isArray(levelBoxSize) ? levelBoxSize[0] : levelBoxSize;

      return {
          width: boxSize?.width ?? 700,
          height: boxSize?.height ?? 650,
      };
  }

  getNewQuiz(){
      const quizData = this.randomQuiz.getQuiz();

      if (quizData == null) {
          return null;
      }

      const id = quizData.id;
      const textParts = quizData.textParts;
      const options = this.randomQuiz.shuffle(quizData.options);
      const answers = quizData.correctAnswers;
      const qData = new QuizGameData();
      this.quizData.push(qData)

      if (this.quizGame != null){
          this.quizGame.destroy();
      }

      this.quizGame = new Quiz(this, 0, 0, id, textParts, answers, options, qData, QuizUI_Setting.setting, this.quizBoxSize);
      this.quizGame.onAnswerCorrect = (answer) => {
          if (this.isGameEnded) {
              return;
          }

          this.round++;
          const maxRound = Config.MaxRound[this.levelMap];
          const nextRoundDisplay = Math.min(this.round + 1, maxRound);

          this.increaseScore(Config.IncreaseScore[this.levelMap]);
          this.replayLog.addEvent(GlobalReplayEvent.ROUND_COMPLETED, {
              answer: answer,
              value: true
          });
          this.gameplayUI.setLevel(this.levelMap, this.level, nextRoundDisplay, maxRound);
          
          EventBus.emit('minigame:score', { score: this.allScore });
          EventBus.emit('minigame:level', { level: `ด่าน ${nextRoundDisplay}/${maxRound}` });

          if (this.round < maxRound) {
              console.log(`All Score: (${this.allScore})`);

              this.time.delayedCall(500, () => {
                  if (this.isGameEnded) {
                      return;
                  }

                  this.gameplayUI.showNextQuizPanel(() => {
                      if (this.isGameEnded) {
                          return;
                      }

                      // Create New Quiz
                      this.getNewQuiz();
                  })
              });
          }else{
              this.endGame("success");
          }
      }
      this.quizGame.onAnswerIncorrect = (answer) => {
          if (this.isGameEnded) {
              return;
          }

          this.decreaseScore(Config.DecreaseScore[this.levelMap]);

          this.replayLog.addEvent(GlobalReplayEvent.ROUND_COMPLETED, {
              answer: answer,
              value: false
          });
      }
      this.gameplayUI.setScore(this.allScore);
      this.quizGame.onCreateQuiz();

      return this.quizGame;
  }

    endGame(resultStatus = "success") {
        if (this.isGameEnded) {
            return;
        }

        this.isGameEnded = true;
        this.countdownTimer?.remove(false);
        this.countdownTimer = null;
        this.gameEndedAt = new Date();
        this.syncTimerUI();
        this.gameplayUI.setScore(this.allScore);
        this.gameplayUI.showGameOverPanel(this.allScore, resultStatus);
        EventBus.emit('minigame:game-over', {
            score: this.allScore,
            level: this.level,
            resultStatus
        });

        //Save game data to database
        game_db.pushGameData(this.allScore, this.level, this.gameStartedAt, this.gameEndedAt).then(() => {
            console.log("Game data saved to database.");
        }).catch((error) => {
            console.error("Failed to save game data:", error);
        });

        this.replayLog.pushToDatabase().then(r => {console.log("Push data to database.");})

        //Write debug here!
        console.log("[ContextClues ReplayLog]", this.replayLog.getEvents());
    }

    createSceneBackdrop() {
        const { width, height } = this.scale;

        const background = this.add.image(width / 2, height / 2, 'context-clues-bg');
        background.setDisplaySize(width, height);
        background.setTint(0xf36baa);
        background.setAlpha(0.26);
        background.setDepth(-20);

        const overlay = this.add.graphics();
        overlay.fillStyle(0xf45ca1, 0.86);
        overlay.fillRect(0, 0, width, height);
        overlay.fillStyle(0xff9ccc, 0.26);
        overlay.fillRect(0, 0, width, 240);
        overlay.fillStyle(0xd83d73, 0.36);
        overlay.fillRect(0, height - 520, width, 520);
        overlay.lineStyle(4, 0x9d375c, 0.3);
        overlay.lineBetween(0, height - 520, width, height - 520);
        overlay.setDepth(-19);
    }

    drawRoundedPanel(x, y, width, height, {
        fillColor,
        fillAlpha = 1,
        strokeColor = 0xffffff,
        strokeAlpha = 1,
        strokeWidth = 4,
        radius = 18,
        origin = [0.5, 0.5],
        depth = 0,
    }) {
        const panel = this.add.graphics({ x, y });
        const drawX = -width * (origin[0] ?? 0.5);
        const drawY = -height * (origin[1] ?? 0.5);

        panel.fillStyle(fillColor, fillAlpha);
        panel.lineStyle(strokeWidth, strokeColor, strokeAlpha);
        panel.fillRoundedRect(drawX, drawY, width, height, radius);
        panel.strokeRoundedRect(drawX, drawY, width, height, radius);
        panel.setDepth(depth);

        return panel;
    }

    increaseScore(score){
        this.allScore += score;
    }

    decreaseScore(score){
        this.allScore -= score;

        const scorePenaltyText = createThaiText(
            this,
            this.scale.width / 2,
            this.scale.height / 2 - 250,
            `-${score}`,
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: "#ff4d4d"
            },
            { origin: 0.5 }
        );
        scorePenaltyText.setDepth(200);

        this.tweens.add({
            targets: scorePenaltyText,
            y: scorePenaltyText.y - 40,
            alpha: 0,
            duration: 700,
            ease: "Sine.easeOut",
            onComplete: () => {
                scorePenaltyText.destroy();
            }
        });
    }

  createButton(x,y,text,onClick){
        const bg = this.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = createThaiText(this, x, y, text, ThaiTextPresets.buttonLabel, { origin: 0.5 });
        label.setScale(1.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}
