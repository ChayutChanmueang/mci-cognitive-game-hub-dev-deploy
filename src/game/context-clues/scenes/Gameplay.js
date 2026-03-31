import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import RandomQuiz from "../components/scripts/random-quiz.js";
import {LevelMap, BlankWord} from "../constants.js";
import { createThaiText, ThaiTextPresets } from "../utils/thai-text";
import {createInlineSentence} from "../utils/auto-insert-layout.js";
import ProgressBar from "../utils/progress-bar.js";

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
    const answers = quizData.options;

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
          400,0x525252,1).setOrigin(0.5, 0.5);

      this.add.rectangle(
          this.scale.width / 2,
          this.scale.height,
          this.scale.width,
          250,0xffffff,1).setOrigin(0.5, 1);
      this.progressBar = new ProgressBar(this, this.scale.width / 2, 500, {
          width: 500,
          height: 50,
      })
        this.progressBar.setValue(0)
      this.progressBar.animateTo(1, 5000)

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

      const items = answers.map((word) => {
          const box = this.add.container(0, 0);

          const bg = this.add.rectangle(0, 0, 140, 60, 0xffffff, 0.15)
              .setStrokeStyle(2, 0xa1a1a1)
              .setOrigin(0.5);

          const label = this.add.text(0, 0, word, {
              fontSize: "28px",
              fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
              fontStyle: "bold",
              color: "#000000"
          }).setOrigin(0.5);

          box.add([bg, label]);

          bg.setInteractive({ draggable: true });
          this.input.setDraggable(bg);

          bg.on("drag", (pointer, dragX, dragY) => {
              box.x = dragX;
              box.y = dragY;
          });

          return box;
      });

      Phaser.Actions.GridAlign(items, {
          width: 3,
          cellWidth: 200,
          cellHeight: 120,
          x: this.scale.width / 2 - 200,
          y: this.scale.height - 175,
          position: Phaser.Display.Align.TOP_LEFT
      });

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
