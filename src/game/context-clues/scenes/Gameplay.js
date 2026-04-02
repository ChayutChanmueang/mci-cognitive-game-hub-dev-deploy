import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import RandomQuiz from "../components/scripts/random-quiz.js";
import {LevelMap} from "../constants.js";
import { createThaiText, ThaiTextPresets } from "../utils/thai-text";
import Quiz from "../entity/script/quiz.js";
import ProgressBar from "../utils/progress-bar.js";
import QuizGameData from "../data/scripts/quiz-game-data.js";

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

    this.load.image('button-idle','assets/button_rectangle_depth_flat.png')
    this.load.image('button-press','assets/button_rectangle_flat.png')
  }

  init(data) {
    this.level = data.level;
    this.levelMap = LevelMap[this.level];
    this.quizData = [];
    this.progressBarRefs = [];
    this.round = 0;
  }

  create(data) {
    let quizData = RandomQuiz.getQuiz(this.levelMap);
    let textParts = quizData.textParts; //= this.scale.width * 0.8;
    let answers = quizData.options;
    let quiz;

    this.easyBtn = this.createButton(this.scale.width / 2 - 175, (this.scale.height) - 350, "Return", () => {
      this.scene.start('main-menu-scene',{ conveyerNums: 1 })
    });
      this.easyBtn = this.createButton(this.scale.width / 2 + 175, (this.scale.height) - 350, "Next", () => {
          if (this.round < 10) {
              this.progressBarRefs[this.round].animateTo(1, 500)
              this.round++;
          }

          quiz.destroy();
          quizData = RandomQuiz.getQuiz(this.levelMap);
          textParts = quizData.textParts;
          answers = quizData.options;
          const qData = new QuizGameData();
          this.quizData.push(qData)
          quiz = new Quiz(this, 0, 0, textParts, answers, qData, 1);
          this.quizGame = quiz;
      });

      let dotProgressBars = [];
      for (let i = 0; i < 10; i++) {
          const bar = new ProgressBar(this, 0, 0, {
              width: 50,
              height: 10
          });

          bar.setValue(0);
          //bar.animateTo(1, 5000)

          this.progressBarRefs.push(bar);
          dotProgressBars.push(bar.getContainer());
      }

      Phaser.Actions.GridAlign(dotProgressBars, {
          width: 10,
          cellWidth: 60,
          cellHeight: 5,
          x: this.scale.width / 2 - 275,
          y: 200,
          position: Phaser.Display.Align.TOP_LEFT
      });

    const qData = new QuizGameData();
    this.quizData.push(qData)
    quiz = new Quiz(this, 0, 0, textParts, answers, qData, 1);
    this.quizGame = quiz;
    this.gameplayUI = new GameplayUI(this, 0, 0);
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
