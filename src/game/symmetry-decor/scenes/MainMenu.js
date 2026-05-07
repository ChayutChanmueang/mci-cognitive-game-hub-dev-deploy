import Phaser from "phaser";
import { Difficulty } from "../constants";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";
import VoiceService from "../../../core/voice-service.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("main-menu-scene");
  }

  preload() {
    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')
  }

  create(data) {
    this.lv1Btn = this.createButton(this.scale.width / 2, (this.scale.height / 2) - 100, "EASY", () => {
      this.scene.start('gameplay-scene', { level: Difficulty.EASY })
    });
    this.lv2Btn = this.createButton(this.scale.width / 2, (this.scale.height / 2), "NORMAL", () => {
      this.scene.start('gameplay-scene', { level: Difficulty.NORMAL })
    });
    this.lv3Btn = this.createButton(this.scale.width / 2, (this.scale.height / 2) + 100, "HARD", () => {
      this.scene.start('gameplay-scene', { level: Difficulty.HARD })
    });
    this.titleText = createThaiText(
      this,
      this.scale.width / 2,
      this.scale.height / 2 - 250,
      "ตกแต่งสมมาตร",
      ThaiTextPresets.menuTitle,
      { origin: 0.5 }
    );
    this.titleText.setDepth(100);

    // Voice Over Instructions
    VoiceService.speak("ยินดีต้อนรับสู่เกมตกแต่งสมมาตร วางสิ่งของลงในตารางเพื่อให้เกิดภาพสะท้อนที่สมมาตรกันครับ");
  }

  createButton(x, y, text, onClick) {
    const bg = this.add.rectangle(x, y, 200, 60, 0x00aa00, 1).setInteractive({ useHandCursor: true });
    bg.setScale(1.5);
    const label = createThaiText(this, x, y, text, ThaiTextPresets.buttonLabel, { origin: 0.5 });
    label.setScale(1.5);

    bg.on('pointerdown', onClick);

    bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
    bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

    return [bg, label];
  }
}