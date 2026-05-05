import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import Entity from "../entity/entity";
import { Difficulty, GameLevels, Config } from "../constants";
import { EventBus } from "../../../core/EventBus";

import EmojiRenderer from "../components/scripts/emoji-renderer";
import CircleButton from "../entity/script/circleButton";
import SpriteRenderer from "../components/scripts/sprite-renderer";
import { createThaiText } from "../../../util/thai-text";
import GameEndPanel from "../ui-elements/scripts/gameend-panel";


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

    this.gameEndPanel = new GameEndPanel(this);
    this.gameEndPanel.forceHide();
  }

  onGameOver() {
    console.log("Complete");
    this.gameEndPanel.show();
  }

  update() {
    
  }
}