import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { Difficulty, GameLevelsByTopic, Config, getDifficultyLevelNumber } from "../constants";
import UIPanel from "../ui-elements/core/ui-panel";
import Button from "../ui-elements/core/button";
import StorageManager from "../../../core/storage-manager";
import { createThaiText } from "../../../util/thai-text.js";
import { EventBus } from "../../../core/EventBus.js";
import DebugMenu from "./DebugMenu";
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";
import { ReplayEvent } from "../../../core/replay-event.js";
import { ReplayLogBuffer } from "../../../core/replay-log-buffer.js";
import game_db from "/src/util/minigame-db-util.js";
import SessionStorageManager from "../../../core/session-storage-manager.js";
import { GameOverSetting } from "../constants.js";

const GAME_ID = "MEM001";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
    this.allScore = 0;
    this.postcardsPlayed = 0;
    this.isGameEnded = false;
  }

  preload() {
    this.load.image("button-idle", "assets/button_rectangle_depth_flat.png");
    this.load.image("button-press", "assets/button_rectangle_flat.png");
    this.load.image('background', 'assets/postcard-reader/etc/BG.png');
  }

  create(data) {
    // Add background
    this.background = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-10);

    //Initialize Logging
    if (this.replayLogger == null) {
      this.replayLogger = new ReplayLogBuffer();
    }
    else {
      this.replayLogger.clearEvents();
    }

    this.correctAnswer = 0;
    this.wrongAnswer = 0;

    this.sceneData = { ...data };
    this.level = Number(SessionStorageManager.get("selected_game_level")) || data.level || 1;
    this.allScore = 0;
    this.postcardsPlayed = 0;
    this.isGameEnded = false;
    this.isPlaying = false;
    this.lastChosenIndex = -1;
    this.isTimeUp = false;
    this.questionPanel = null;
    this.questionText = null;

    this.gameStartedAt = new Date();
    this.gameEndedAt = new Date();

    this.buttonPool = {
      Pool: [],
      CorrectPool: [],
      WrongPool: [],
    };

    const topics = Object.keys(GameLevelsByTopic);
    this.currentTopic = topics[Math.floor(Math.random() * topics.length)];

    this.choosePostcard();
    this.chooseQuestion();
    this.intializeGamePage();
    this.replayLogger.addTimestampEvent(ReplayEvent.PostcardReader.POSTCARD_SHOWN);

    this.gameplayUI = new GameplayUI(this, 0, 0);

    // Initial HUD State
    EventBus.emit("minigame:show-hud");
    EventBus.emit("minigame:show-timer");
    EventBus.emit("minigame:score", { score: this.allScore });
    EventBus.emit("minigame:level", {
      level: `${this.level === 1 ? 'EASY' : this.level === 2 ? 'NORMAL' : 'HARD'} - โปสการ์ดใบที่ ${this.postcardsPlayed + 1}`
    });

    this.countdownTimer = this.time.addEvent({
      delay: Config.QuizTimeLimitMs,
      callback: () => {
        this.isTimeUp = true;
      },
    });

    // Debug menu
    this.debugMenu = new DebugMenu(this);
  }

  update(time, delta) {
    if (this.gameplayUI) {
      this.gameplayUI.update(time, delta);
    }

    if (!this.isGameEnded && this.countdownTimer) {
      let timeLeft = Math.trunc(this.countdownTimer.getRemainingSeconds() + 1);
      if (this.isTimeUp) timeLeft = 0;
      EventBus.emit("minigame:tick", { timeLeft, maxTime: Config.QuizTimeLimitMs / 1000, updateProgress: false });
    }
  }

  choosePostcard() {
    let difficultyKey = "easy";
    switch (this.level) {
      case 1: difficultyKey = "easy"; break;
      case 2: difficultyKey = "medium"; break;
      case 3: difficultyKey = "hard"; break;
      default: difficultyKey = "easy";
    }

    let options = GameLevelsByTopic[this.currentTopic][difficultyKey];
    let newIndex = this.postcardsPlayed % options.length;

    this.currentPostcard = options[newIndex];
    this.postcardText = this.currentPostcard.text || this.currentPostcard.Postcard;
    this.currentQuestionList = [...(this.currentPostcard.questions || this.currentPostcard.Questions)];
  }

  chooseQuestion() {
    if (this.currentPostcard != null && this.currentQuestionList.length > 0) {
      this.choosenQuestionIndex = Math.trunc(Math.random() * this.currentQuestionList.length);
      this.currentQuestion = this.currentQuestionList[this.choosenQuestionIndex];
      this.currentQuestionText = this.currentQuestion.Question;
    }
  }

  intializeGamePage() {
    if (this.questionPanel == null) {
      this.questionPanel = new UIPanel(
        this,
        this.scale.width / 2,
        this.scale.height / 5 + 50,
        {
          size: { x: 900, y: 350 },
          strokeEnable: false,
          overlayEnable: false,
        },
      );
      this.questionPanel.panelBg.setVisible(false);
    }

    if (this.questionText == null) {
      this.questionText = createThaiText(
        this,
        0,
        0,
        this.currentQuestionText,
        {
          fontSize: "96px",
          fontStyle: "bold",
          color: "#743D14",
          stroke: "#FFFFFF",
          strokeThickness: 10
        },
        { origin: 0.5, wrapWidth: 1200 }
      );
      this.questionPanel.addElements(this.questionText);
    } else {
      this.questionText.setText(this.currentQuestionText);
    }

    if (!this.isPlaying) {
      this.questionPanel.forceHide();
    }

    this.initialzeAnswers();
  }

  initialzeAnswers() {
    const shuffledAnswers = this.shuffleArray([...this.currentQuestion.Choice]);

    for (let i = 0; i < shuffledAnswers.length; i++) {
      const choice = shuffledAnswers[i];
      const button = new Button(
        this,
        this.scale.width / 2,
        this.scale.height / 3 + 200 + 250 * i,
        {
          width: 850,
          height: 220,
          labelText: choice.ChoiceText,
          useThaiText: true,
          labelOffset: { x: 0, y: 0 },
          color: 0xFDF5E0,
          hoverColor: 0xF5E6B8,
          clickColor: 0xE8D5A5,
          onClick: () => {
            if (choice.isCorrect) {
              this.onCorrectAnswer(button);
            } else {
              this.onWrongAnswer(button);
            }
          },
        }
      );

      this.buttonPool.Pool.push(button);
      if (choice.isCorrect) this.buttonPool.CorrectPool.push(button);
      else this.buttonPool.WrongPool.push(button);

      if (!this.isPlaying) {
        button.forceHide();
      }
    }
  }

  showGame() {
    this.isPlaying = true;
    this.questionPanel.forceShow();
    for (const button of this.buttonPool.Pool) {
      button.forceShow();
    }
    this.replayLogger.addTimestampEvent(ReplayEvent.PostcardReader.QUESTION_SHOWN);

    // Hide timer during quiz
    EventBus.emit("minigame:hide-timer");
  }

  onCorrectAnswer(selectedButton) {
    this.allScore += Config.ScorePerCorrect;
    this.correctAnswer++;
    this.replayLogger.addAnswerEvent(
      ReplayEvent.PostcardReader.CHOICE_SELECTED,
      selectedButton?.labelText ?? null,
      true,
    );
    EventBus.emit('audio:play', 'postcard-reader:correct');
    EventBus.emit("minigame:score", { score: this.allScore });

    // Trigger the premium DOM effect
    showLevelCompleteEffect();

    // Disable all buttons to prevent multiple clicks during transition
    for (const button of this.buttonPool.Pool) {
      if (button.uiBackground) button.uiBackground.disableInteractive();
    }

    this.time.delayedCall(1500, () => {
      this.displayNextQuestion();
    });
  }

  onWrongAnswer(selectedButton) {
    if (selectedButton) {
      // Change color to red and override default colors so pointer events don't revert it
      selectedButton.defaultColor = 0xd32f2f;
      selectedButton.hoverColor = 0xd32f2f;
      selectedButton.clickColor = 0xd32f2f;
      selectedButton.drawBg(0xd32f2f);
    }
    this.wrongAnswer++;
    this.replayLogger.addAnswerEvent(
      ReplayEvent.PostcardReader.CHOICE_SELECTED,
      selectedButton?.labelText ?? null,
      false,
    );
    EventBus.emit('audio:play', 'postcard-reader:wrong');

    // Disable all buttons to prevent multiple clicks during transition
    for (const button of this.buttonPool.Pool) {
      if (button.uiBackground) button.uiBackground.disableInteractive();
    }

    const isLastQuestion = this.currentQuestionList.length <= 1;
    if (this.isTimeUp && isLastQuestion) {
      this.onGameOver();
    } else {
      this.time.delayedCall(1500, () => {
        this.displayNextQuestion();
      });
    }
  }

  displayNextQuestion() {
    const index = this.currentQuestionList.indexOf(this.currentQuestion);
    if (index > -1) {
      this.currentQuestionList.splice(index, 1);
    }

    if (this.currentQuestionList.length === 0) {
      this.postcardsPlayed++;
      if (this.isTimeUp) {
        this.onGameOver();
      } else {
        this.reinitializeGame();
      }
      return;
    }

    this.chooseQuestion();
    for (const button of this.buttonPool.Pool) {
      button.destroy();
    }
    this.buttonPool.Pool = [];
    this.buttonPool.CorrectPool = [];
    this.buttonPool.WrongPool = [];

    this.intializeGamePage();
  }

  reinitializeGame() {
    this.isPlaying = false;
    for (const button of this.buttonPool.Pool) {
      button.destroy();
    }

    this.buttonPool = {
      Pool: [],
      CorrectPool: [],
      WrongPool: [],
    };

    this.choosePostcard();
    this.chooseQuestion();
    this.intializeGamePage();
    this.questionPanel.forceHide();

    EventBus.emit("minigame:level", {
      level: `${this.level === 1 ? 'EASY' : this.level === 2 ? 'NORMAL' : 'HARD'} - โปสการ์ดใบที่ ${this.postcardsPlayed + 1}`
    });

    EventBus.emit("minigame:show-timer");

    this.gameplayUI.postcard.reinitializedPanel();
    this.replayLogger.addTimestampEvent(ReplayEvent.PostcardReader.POSTCARD_SHOWN);
  }

  onGameOver() {
    if (this.isGameEnded) return;
    this.isGameEnded = true;
    this.isPlaying = false;

    const storedHighScore = StorageManager.get(`highscore-${GAME_ID}`, 0);
    if (this.allScore > storedHighScore) {
      StorageManager.save(`highscore-${GAME_ID}`, this.allScore);
      this.gameplayUI.setGameOverHighscore(this.allScore);
    }

    this.gameEndedAt = new Date();

    //Save game data to database
    game_db.pushGameData(this.allScore, this.level, this.gameStartedAt, this.gameEndedAt).then(() => {
      console.log("Game data saved to database.");
    }).catch((error) => {
      console.error("Failed to save game data:", error);
    });

    this.replayLogger.addTimestampEvent(ReplayEvent.PostcardReader.ROUND_COMPLETED);
    this.replayLogger.pushToDatabase();
    // this.gameplayUI.showGameOverPanel(this.allScore);

    // Disable DOM-based gameover panel for now
    EventBus.emit('audio:play', 'postcard-reader:endgame');
    EventBus.emit('minigame:game-over', {
      score: this.allScore,
      level: getDifficultyLevelNumber(this.level),
      panelBorderColor: GameOverSetting.panelBorderColor,
      panelHeaderColor: GameOverSetting.panelHeaderColor,
      resultImage: 'assets/common/result/result_postcard_reader.png',
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  createButton(x, y, sizeX, sizeY, text, onClick) {
    const bg = this.add.rectangle(x, y, sizeX, sizeY, 0x356859, 1).setInteractive({ useHandCursor: true });
    bg.setScale(1.5);
    const label = createThaiText(this, x, y, text, { fontSize: "32px", fontStyle: "bold", color: "#ffffff" }, { origin: 0.5 });
    label.setScale(1.5);

    bg.on("pointerdown", onClick);
    bg.on("pointerover", () => bg.setFillStyle(0x4a8c7a));
    bg.on("pointerout", () => bg.setFillStyle(0x356859));

    return [bg, label];
  }
}
