import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { Difficulty, GameLevels, Config, getDifficultyLevelNumber } from "../constants";
import UIPanel from "../ui-elements/core/ui-panel";
import Button from "../ui-elements/core/button";
import StorageManager from "../../../core/storage-manager";
import { createThaiText } from "../../../util/thai-text.js";
import { EventBus } from "../../../core/EventBus.js";

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
  }

  create(data) {
    this.sceneData = { ...data };
    this.level = data.level || 1;
    this.allScore = 0;
    this.postcardsPlayed = 0;
    this.isGameEnded = false;
    this.isPlaying = false;
    this.lastChosenIndex = -1;

    this.gameStartedAt = new Date();
    this.gameEndedAt = new Date();

    this.buttonPool = {
      Pool: [],
      CorrectPool: [],
      WrongPool: [],
    };

    this.choosePostcard();
    this.chooseQuestion();
    this.intializeGamePage();

    this.gameplayUI = new GameplayUI(this, 0, 0);

    // Initial HUD State
    const maxPostcards = Config.MaxPostcards[this.level] || 3;
    EventBus.emit("minigame:score", { score: this.allScore });
    EventBus.emit("minigame:level", { 
        level: `${this.level === 1 ? 'EASY' : this.level === 2 ? 'NORMAL' : 'HARD'} - โปสการ์ดใบที่ ${this.postcardsPlayed + 1}/${maxPostcards}` 
    });

    this.countdownTimer = this.time.addEvent({
      delay: Config.QuizTimeLimitMs,
      callback: () => {
        this.onGameOver();
      },
    });
  }

  update(time, delta) {
    if (this.gameplayUI) {
        this.gameplayUI.update(time, delta);
    }

    if (this.isPlaying && !this.isGameEnded) {
      const timeLeft = Math.trunc(this.countdownTimer.getRemainingSeconds() + 1);
      EventBus.emit("minigame:tick", { timeLeft, maxTime: Config.QuizTimeLimitMs / 1000 });
    }
  }

  choosePostcard() {
    let options = [];
    switch (this.level) {
      case 1: options = GameLevels[Difficulty.EASY]; break;
      case 2: options = GameLevels[Difficulty.NORMAL]; break;
      case 3: options = GameLevels[Difficulty.HARD]; break;
      default: options = GameLevels[Difficulty.EASY];
    }

    const totalOptions = options.length;
    let newIndex;

    do {
        newIndex = Math.trunc(Math.random() * totalOptions);
    } while (newIndex === this.lastChosenIndex && totalOptions > 1);

    this.lastChosenIndex = newIndex;
    this.currentPostcard = options[newIndex];
    this.postcardText = this.currentPostcard.Postcard;
    this.currentQuestionList = [...this.currentPostcard.Questions];
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
          strokeEnable: true,
          overlayEnable: false,
        },
      );
    }

    if (this.questionText == null) {
      this.questionText = createThaiText(
          this,
          0,
          0,
          this.currentQuestionText,
          {
              fontSize: "52px",
              fontStyle: "bold",
              color: "#1e1b18"
          },
          { origin: 0.5, wrapWidth: 800 }
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
            labelOffset: { x: -180, y: -45 },
            onClick: () => {
              if (choice.isCorrect) {
                  this.onCorrectAnswer();
              } else {
                  this.onWrongAnswer();
              }
            },
          }
        );

        const iconContainer = this.add.container(-320, 0);
        const iconBackdrop = this.add.rectangle(0, 0, 120, 120, 0xffffff, 0.1).setOrigin(0.5);
        iconBackdrop.setStrokeStyle(4, 0x356859);
        
        const choiceIcon = this.add.text(0, 0, choice.Sprite, { fontSize: '84px' }).setOrigin(0.5);

        iconContainer.add([iconBackdrop, choiceIcon]);
        button.container.add([iconContainer]);

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
  }

  onCorrectAnswer() {
    this.allScore += Config.ScorePerCorrect;
    EventBus.emit("minigame:score", { score: this.allScore });
    this.displayNextQuestion();
  }

  onWrongAnswer() {
    this.displayNextQuestion();
  }

  displayNextQuestion() {
    const index = this.currentQuestionList.indexOf(this.currentQuestion);
    if (index > -1) {
      this.currentQuestionList.splice(index, 1);
    }

    if (this.currentQuestionList.length === 0) {
      this.postcardsPlayed++;
      const maxPostcards = Config.MaxPostcards[this.level] || 3;
      
      if (this.postcardsPlayed < maxPostcards) {
          this.reinitializeGame();
      } else {
          this.onGameOver();
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

    const maxPostcards = Config.MaxPostcards[this.level] || 3;
    EventBus.emit("minigame:level", { 
        level: `${this.level === 1 ? 'EASY' : this.level === 2 ? 'NORMAL' : 'HARD'} - โปสการ์ดใบที่ ${this.postcardsPlayed + 1}/${maxPostcards}` 
    });

    this.gameplayUI.postcard.reinitializedPanel();
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
    this.gameplayUI.showGameOverPanel(this.allScore);
    
    EventBus.emit('minigame:game-over', { 
        score: this.allScore,
        level: getDifficultyLevelNumber(this.level)
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
