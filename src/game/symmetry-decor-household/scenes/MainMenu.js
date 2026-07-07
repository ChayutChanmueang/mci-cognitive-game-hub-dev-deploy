import Phaser from "phaser";
import { Difficulty } from "../constants";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";
import VoiceService from "../../../core/voice-service.js";
import { EventBus } from "../../../core/EventBus.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("main-menu-scene");
  }

  preload() {
    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')
  }

  create(data) {
    EventBus.emit('minigame:hide-hud');

    // Create DOM-based return button
    this.returnBtnContainer = document.createElement('div');
    this.returnBtnContainer.style.position = 'absolute';
    this.returnBtnContainer.style.top = '16px';
    this.returnBtnContainer.style.left = '16px';
    this.returnBtnContainer.style.zIndex = '1000';
    this.returnBtnContainer.style.pointerEvents = 'auto';

    this.returnBtnContainer.innerHTML = `
        <div style="
            background-color: white; 
            border-radius: 50%; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            width: 56px;
            height: 56px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        " 
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.25)';" 
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
        id="main-menu-exit-button-wrapper">
            <md-icon-button id="main-menu-exit-button" aria-label="กลับ" style="--md-icon-button-icon-color: #2d3748; width: 48px; height: 48px;">
                <md-icon class="material-symbols-rounded" style="font-size: 28px;">arrow_back</md-icon>
            </md-icon-button>
        </div>
    `;

    const uiRoot = document.getElementById("ui-root");
    if (uiRoot) {
        uiRoot.appendChild(this.returnBtnContainer);
    }

    const exitBtn = this.returnBtnContainer.querySelector("#main-menu-exit-button-wrapper");
    if (exitBtn) {
        exitBtn.addEventListener("click", () => {
            EventBus.emit("minigame:exit-request");
        });
    }

    this.events.once('shutdown', () => {
        if (this.returnBtnContainer) {
            this.returnBtnContainer.remove();
        }
    });

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