import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import Entity from "../entity/entity";
import { Difficulty, GameLevels, Config } from "../constants";
import { EventBus } from "../../../core/EventBus";

import EmojiRenderer from "../components/scripts/emoji-renderer";
import CircleButton from "../entity/script/circleButton";
import SpriteRenderer from "../components/scripts/sprite-renderer";
import { createThaiText } from "../../../util/thai-text";
import Theme from "../../../util/game-theme.js";


export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
    this.maxPush = 20
    this.currentPush = 0;
  }

  preload() {
    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')
    
    this.load.image('stretch_left', 'assets/resting-point/stretch_left.png')
    this.load.image('stretch_right', 'assets/resting-point/stretch_right.png')
  }

  create(data) {
    this.sprite = new Entity(this,this.scale.width/2,500,'stretch_left');
    this.sprite.setDisplaySize(288,288);
    this.spriteRenderer = this.sprite.addComponent(SpriteRenderer, {
        textureKey: 'stretch_left',
        sizeScale: 2,
      });
    this.spriteRenderer.changeSprite('stretch_left');

    this.topText = createThaiText(this,this.scale.width/2,250,"ยืดเส้นยืดสายกันหน่อย",
      {
        fontSize: "48px",
        fontStyle: "bold",
        color: '#fff',
        // stroke: '#fff',
        // strokeThickness: 10,
      },
      { origin: 0.5, wrapWidth: 750 },
    );
    this.bottomText = createThaiText(this,this.scale.width/2,750,"กดที่ ปุ่ม เพื่อขยับร่างกาย",
      {
        fontSize: "48px",
        fontStyle: "bold",
        color: '#fff',
        // stroke: '#fff',
        // strokeThickness: 10,
      },
      { origin: 0.5, wrapWidth: 750 },
    );

    this.button = new CircleButton(this,this.scale.width/2,1000,100,() => {
      this.currentPush++;
      console.log("Current Push : " + this.currentPush + "/" + this.maxPush);
      if(this.currentPush%2 == 0){
        this.spriteRenderer.changeSprite('stretch_left');
      }
      else{
        this.spriteRenderer.changeSprite('stretch_right');
      }
      this.bottomText.text = this.currentPush.toString() + "/" + this.maxPush.toString() + " ครั้ง";
      if(this.currentPush >= this.maxPush){
        this.onGameOver();
      }
    });

    // Track the circle button's scene-level graphics for hiding on game over
    this._gameElements = this.children.list.slice();
  }

  onGameOver() {
    console.log("Complete");

    const W = this.scale.width;
    const H = this.scale.height;

    // ── 1. Fade out all current scene elements ──────────────────────────────
    this.tweens.add({
      targets: this.children.list.slice(),
      alpha: 0,
      duration: 300,
      ease: 'Power1',
      onComplete: () => this._showFinishLayout(W, H),
    });
  }

  _showFinishLayout(W, H) {
    // ── 2. Reset sprite to left pose, reposition to screen centre ───────────
    this.spriteRenderer.changeSprite('stretch_left');
    this.sprite.setPosition(W / 2, H * 0.38);
    this.sprite.setDisplaySize(380, 380);
    this.sprite.setAlpha(0);
    this.sprite.setDepth(10);

    // ── 3. "เก่งมาก !!!" title ──────────────────────────────────────────────
    this.topText.setPosition(W / 2, H * 0.17);
    this.topText.setText("เก่งมาก !!!");
    this.topText.setStyle({ fontSize: "80px", fontStyle: "bold", color: "#ffffff" });
    this.topText.setAlpha(0);
    this.topText.setDepth(10);

    // ── 4. Completion message ────────────────────────────────────────────────
    this.bottomText.setPosition(W / 2, H * 0.60);
    this.bottomText.setText("ยืดเส้นยืดสายเสร็จแล้ว\nกลับไปเล่นเกมกันต่อ");
    this.bottomText.setStyle({ fontSize: "52px", fontStyle: "bold", color: "#ffffff", align: "center" });
    this.bottomText.setWordWrapWidth(800);
    this.bottomText.setAlpha(0);
    this.bottomText.setDepth(10);

    // ── 5. Green "ต่อไป" button ──────────────────────────────────────────────
    const btnW = W * 0.65;
    const btnH = 110;
    const btnX = W / 2;
    const btnY = H * 0.82;

    this.continueBtn = this.add.graphics();
    this.continueBtn.setDepth(10);
    this.continueBtn.setAlpha(0);
    this._drawContinueBtn(0x4caf50);
    this.continueBtn.setInteractive(
      new Phaser.Geom.Rectangle(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH),
      Phaser.Geom.Rectangle.Contains
    );

    this.continueBtnLabel = createThaiText(this, btnX, btnY, "ต่อไป", {
      fontSize: "58px",
      fontStyle: "bold",
      color: "#ffffff",
    }, { origin: 0.5 });
    this.continueBtnLabel.setDepth(11);
    this.continueBtnLabel.setAlpha(0);

    // Hover / press
    this.continueBtn.on('pointerover', () => { this._drawContinueBtn(0x43a047); this.tweens.add({ targets: [this.continueBtn, this.continueBtnLabel], scaleX: 1.04, scaleY: 1.04, duration: 150 }); });
    this.continueBtn.on('pointerout',  () => { this._drawContinueBtn(0x4caf50); this.tweens.add({ targets: [this.continueBtn, this.continueBtnLabel], scaleX: 1, scaleY: 1, duration: 150 }); });
    this.continueBtn.on('pointerdown', () => {
      this._drawContinueBtn(0x388e3c);
      this.tweens.add({ targets: [this.continueBtn, this.continueBtnLabel], scaleX: 0.96, scaleY: 0.96, duration: 80, yoyo: true,
        onComplete: () => EventBus.emit('game-complete'),
      });
    });

    // ── 6. Staggered fade-in ─────────────────────────────────────────────────
    this.tweens.add({ targets: this.topText,    alpha: 1, y: H * 0.17, duration: 400, ease: 'Power2', delay: 0 });
    this.tweens.add({ targets: this.sprite,     alpha: 1, scaleX: { from: 0.5, to: 1 }, scaleY: { from: 0.5, to: 1 }, duration: 450, ease: 'Back.out', delay: 100 });
    this.tweens.add({ targets: this.bottomText, alpha: 1, duration: 400, ease: 'Power2', delay: 250 });
    this.tweens.add({ targets: [this.continueBtn, this.continueBtnLabel], alpha: 1, duration: 400, ease: 'Power2', delay: 400 });
  }

  _drawContinueBtn(color) {
    const W = this.scale.width;
    const btnW = W * 0.65;
    const btnH = 110;
    const btnX = W / 2;
    const btnY = this.scale.height * 0.82;
    this.continueBtn.clear();
    this.continueBtn.fillStyle(color, 1);
    this.continueBtn.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 55);
  }

  update() {
    
  }
}