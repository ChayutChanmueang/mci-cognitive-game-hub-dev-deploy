import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import RandomQuiz from "../components/scripts/random-quiz.js";
import {LevelMap, BlankWord} from "../constants.js";
import { createThaiText, ThaiTextPresets } from "../utils/thai-text";
import {createInlineSentence} from "../utils/auto-insert-layout.js";

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
  }

  create(data) {
    const quizData = RandomQuiz.getQuiz(this.levelMap);
    const textParts = quizData.textParts; //= this.scale.width * 0.8;
    const answer = quizData.correctAnswers;

    this.easyBtn = this.createButton(this.scale.width / 2, (this.scale.height / 2) + 300, "RETURN", () => {
      this.scene.start('main-menu-scene',{ conveyerNums: 1 })
    });

      const textStyle = {
          fontSize: "48px",
          fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
          fontStyle: "bold",
          color: "#ffffff",
      };

      this.add.rectangle(
          this.scale.width / 2,
          this.scale.height / 2,
          700,
          400,0x00aa00,1).setOrigin(0.5, 0.5);

      this.titleText = createInlineSentence(
          this,
          this.scale.width / 2,
          this.scale.height / 2,
          600,
          50,
          textParts,
          BlankWord,
          textStyle,
          {
            origin: { x: 0.5, y: 0.5 }
          });

      this.titleText.setDepth(100);

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
