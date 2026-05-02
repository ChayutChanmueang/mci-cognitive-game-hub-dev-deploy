import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { GameLevels } from "../constants";
import UIPanel from "../ui-elements/core/ui-panel";
import Button from "../ui-elements/core/button";
import StorageManager from "../../../core/storage-manager";
import db from "../../../core/database.js";
import { createThaiText } from "../../../util/thai-text.js";
import { EventBus } from "../../../core/EventBus.js";

const GAME_ID = "MEM001";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
  }

  preload() {
    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI",
    );

    this.load.image("button-idle", "assets/button_rectangle_depth_flat.png");
    this.load.image("button-press", "assets/button_rectangle_flat.png");
  }

  create(data) {
    this.gameplayUI = null;

    this.questionPanel = null;
    this.questionText = null;

    this.isGameOver = false;

    // this.easyBtn = this.createButton(this.scale.width/2 ,(this.scale.height/2) - 100, "RETURN", () => {
    //         this.scene.start('main-menu-scene',{ conveyerNums: 1 })
    //     });
    // this.titleText = this.add.text(this.scale.width/2,this.scale.height/2 - 250,"GAMEPLAY",{
    //         fontSize: '96px', fontStyle: 'bold'
    //     }).setOrigin(0.5);
    // this.titleText.setDepth(100);

    this.gameStartedAt = new Date();
    this.gameEndedAt = new Date();

    this.level = data.level || 1;

    console.log(this.level);

    this.score = 0;
    EventBus.emit("minigame:score", { score: this.score });
    this.isPlaying = false;

    this.buttonPool = {
      Pool: [],
      CorrectPool: [],
      WrongPool: [],
    };

    if (this.lastChosenIndex == null) {
      this.lastChosenIndex = -1;
    }

    this.choosePostcard();
    this.chooseQuestion();

    this.intializeGamePage();

    this.gameplayUI = new GameplayUI(this, 0, 0);

    this.countdownTimer = this.time.addEvent({
      delay: 190000, // 3 min + 10 sec buffer for the first question
      callback: () => {
        this.onGameOver();
      },
    });
  }
  update(time, delta) {
    this.gameplayUI.update(time, delta);
    if (this.isPlaying && !this.isGameOver) {
      const timeLeft = Math.trunc(this.countdownTimer.getRemainingSeconds() + 1);
      EventBus.emit("minigame:tick", { timeLeft, maxTime: 190 });
    }
  }
  choosePostcard() {
    var _totalOptions = 0;
    switch (this.level){
      case 1:
        _totalOptions = GameLevels.Easy.length;
        break;
      case 2:
        _totalOptions = GameLevels.Normal.length;
        break;
      case 3:
        _totalOptions = GameLevels.Hard.length;
        break;
    }
    var _newIndex;

      do {
        _newIndex = Math.trunc(Math.random() * _totalOptions);
      } while (_newIndex === this.lastChosenIndex && _totalOptions > 1);

      this.lastChosenIndex = _newIndex;
      this.choosenTextIndex = _newIndex;

      switch (this.level){
      case 1:
        this.currentPostcard = GameLevels.Easy[this.choosenTextIndex];
        break;
      case 2:
        this.currentPostcard = GameLevels.Normal[this.choosenTextIndex];
        break;
      case 3:
        this.currentPostcard = GameLevels.Hard[this.choosenTextIndex];
        break;
    }
      this.postcardText = this.currentPostcard.Postcard;
      this.currentQuestionList = [...this.currentPostcard.Questions];
  }
  chooseQuestion() {
    if (this.currentPostcard != null) {
      console.log(this.currentQuestionList);
      this.choosenQuestionIndex = Math.trunc(
        Math.random() * this.currentQuestionList.length,
      );
      console.log(this.choosenQuestionIndex);
      console.log(this.currentQuestionList[this.choosenQuestionIndex]);
      this.currentQuestion =
        this.currentQuestionList[this.choosenQuestionIndex];
      console.log(this.currentQuestion);
      console.log(this.currentQuestion.Question);
      this.currentQuestionText = this.currentQuestion.Question;
    }
  }
  intializeGamePage() {
    if (this.questionPanel == null) {
      this.questionPanel = new UIPanel(
        this,
        this.scale.width / 2,
        this.scale.height / 5,
        {
          size: { x: 800, y: 300 },
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
                              fontSize: "48px",
                              fontStyle: "bold",
                              color: "#1e1b18"
                          },
                          { origin: 0.5, wrapWidth: 700 });
      // this.add
      //   .text(0, 0, this.currentQuestionText, {
      //     fontSize: "48px",
      //     color: "#ffffff",
      //     fontStyle: "bold",
      //   })
      //   .setOrigin(0.5);

      this.questionPanel.addElements(this.questionText);
    } else {
      this.questionText.setText(this.currentQuestionText);
    }

    if (this.gameplayUI == null) {
      this.questionPanel.forceHide();
    }

    this.initialzeAnswers();
  }
  initialzeAnswers() {
    const _shuffledAnswers = this.shuffleArray(this.currentQuestion.Choice);

    const _answerAmount = _shuffledAnswers.length;
    console.log(_answerAmount);

    this.currentAnswer = 0;

    while (_answerAmount > this.currentAnswer) {
      console.log(this.currentAnswer);
      if (_shuffledAnswers[this.currentAnswer].isCorrect) {
        const _button = new Button(
          this,
          this.scale.width / 2,
          this.scale.height / 3 + 150 + 235 * this.currentAnswer,
          {
            width: 800,
            height: 200,
            labelText: _shuffledAnswers[this.currentAnswer].ChoiceText,
            useThaiText: true,
            labelOffset: {x: - 225, y: -48},
            onClick: () => {
              this.onCorrectAnswer();
            },
          },
        );

        const _iconContainer = this.add.container(-300,0);

        const _iconBackdrop = this.add.rectangle(0, 0, 100, 100, 0x00aa00, 1).setOrigin(0.5);
        _iconBackdrop.setStrokeStyle(4,0xffffff);
        const _choiceIcon = this.add.text(
            0,
            0,
            _shuffledAnswers[this.currentAnswer].Sprite,
            {fontSize:'72px'}
        ).setOrigin(0.5);

        _iconContainer.add([_iconBackdrop,_choiceIcon]);
        _button.container.add([_iconContainer]);

        this.buttonPool.CorrectPool.push(_button);
        this.buttonPool.Pool.push(_button);

        if (this.gameplayUI == null) {
          _button.forceHide();
        }
      } else {
        const _button = new Button(
          this,
          this.scale.width / 2,
          this.scale.height / 3 + 150 + 235 * this.currentAnswer,
          {
            width: 800,
            height: 200,
            labelText: _shuffledAnswers[this.currentAnswer].ChoiceText,
            clickColor: 0x550000,
            useThaiText: true,
            labelOffset: {x: - 225, y: -48},
            //labelOrigin: 0,
            onClick: () => {
              this.onWrongAnswer();
            },
          },
        );

        const _iconContainer = this.add.container(-300,0);

        const _iconBackdrop = this.add.rectangle(0, 0, 100, 100, 0x00aa00, 1).setOrigin(0.5);
        _iconBackdrop.setStrokeStyle(4,0xffffff);
        const _choiceIcon = this.add.text(
            0,
            0,
            _shuffledAnswers[this.currentAnswer].Sprite,
            {fontSize:'72px'}
        ).setOrigin(0.5);

        _iconContainer.add([_iconBackdrop,_choiceIcon]);
        _button.container.add([_iconContainer]);
        
        this.buttonPool.WrongPool.push(_button);
        this.buttonPool.Pool.push(_button);

        if (this.gameplayUI == null) {
          _button.forceHide();
        }
      }
      this.currentAnswer++;
    }
  }
  showGame() {
    this.isPlaying = true;
    this.questionPanel.forceShow();
    for (const _button of this.buttonPool.Pool) {
      _button.forceShow();
    }
  }
  onCorrectAnswer() {
    console.log("correct");
    this.score += 15;
    EventBus.emit("minigame:score", { score: this.score });
    this.displayNextQuestion();
  }
  onWrongAnswer() {
    console.log("incorrect");
    this.displayNextQuestion();
  }
  displayNextQuestion() {
    const index = this.currentQuestionList.indexOf(this.currentQuestion);

    if (index > -1) {
      this.currentQuestionList.splice(index, 1);
    }

    if (this.currentQuestionList.length == 0) {
      // this.questionPanel = null;
      // this.questionText = null;
      // this.scene.restart();
      this.reinitializeGame();
      return;
    }

    this.chooseQuestion();

    for (const _button of this.buttonPool.Pool) {
      _button.destroy();
    }

    this.intializeGamePage();
  }
  reinitializeGame() {
    this.isPlaying = false;
    for (const _button of this.buttonPool.Pool) {
      _button.destroy();
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

    this.gameplayUI.postcard.reinitializedPanel();
  }
  onGameOver() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    //this.scene.pause();
    this.physics.pause();

    const storedHighScore = StorageManager.get("highscore-MEM001", 0);
    const endedAt = new Date();

    if (this.score > storedHighScore) {
      StorageManager.save("highscore-MEM001", this.score);
      this.gameplayUI.setGameOverHighscore(this.score);
    }

    this.gameEndedAt = new Date();

    this.gameplayUI.showGameOverPanel(this.score);
    //console.log("Highscore: " + StorageManager.get('highscore'));
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements array[i] and array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  createButton(x, y, sizeX, sizeY, text, onClick) {
    const bg = this.add
      .rectangle(x, y, sizeX, sizeY, 0x00aa00, 1)
      .setInteractive({ useHandCursor: true });
    bg.setScale(1.5);
    const label = this.add
      .text(x, y, text, {
        fontSize: "28px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    label.setScale(1.5);

    bg.on("pointerdown", onClick);

    bg.on("pointerover", () => bg.setFillStyle(0x00ff00));
    bg.on("pointerout", () => bg.setFillStyle(0x00aa00));

    return [bg, label];
  }
}
