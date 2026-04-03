import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";

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

  create(data) {
    this.easyBtn = this.createButton(this.scale.width/2 ,(this.scale.height/2) - 100, "RETURN", () => {
            this.scene.start('main-menu-scene',{ conveyerNums: 1 })
        });
    this.titleText = createThaiText(
      this,
      this.scale.width / 2,
      this.scale.height / 2 - 250,
      "GAMEPLAY",
      ThaiTextPresets.menuTitle,
      { origin: 0.5 }
    );
    this.titleText.setDepth(100);

    this.level = data.level || 1;

    this.gameplayUI = new GameplayUI(this,0,0);
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
