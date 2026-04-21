import Phaser from "phaser";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("main-menu-scene");
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

  create(data) {
    this.lv1Btn = this.createButton(this.scale.width/2 ,(this.scale.height/2) - 100, "EASY", () => {
            this.scene.start('gameplay-scene',{ level:1 })
        });
    this.lv2Btn = this.createButton(this.scale.width/2 ,(this.scale.height/2), "NORMAL", () => {
            this.scene.start('gameplay-scene',{ level:2 })
        });
      this.lv2Btn = this.createButton(this.scale.width/2 ,(this.scale.height/2) + 100, "HARD", () => {
          this.scene.start('gameplay-scene',{ level:3 })
      });

    this.titleText = createThaiText(
      this,
      this.scale.width / 2,
      this.scale.height / 2 - 250,
      "Context Clues",
      ThaiTextPresets.menuTitle,
      { origin: 0.5 }
    );
    this.titleText.setDepth(100);

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
