import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import Entity from "../entity/entity";
import { Difficulty, GameLevels, Config } from "../constants";
import { EventBus } from "../../../core/EventBus";

import EmojiRenderer from "../components/scripts/emoji-renderer";
import CircleButton from "../entity/script/circleButton";
import SpriteRenderer from "../components/scripts/sprite-renderer";


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
    this.button = new CircleButton(this,this.scale.width/2,750,100,() => {
      this.currentPush++;
      console.log("Current Push : " + this.currentPush + "/" + this.maxPush);
      if(this.currentPush%2 == 0){
        this.spriteRenderer.changeSprite('stretch_left');
      }
      else{
        this.spriteRenderer.changeSprite('stretch_right');
      }
      if(this.currentPush >= this.maxPush){
        this.onGameOver();
      }
    });

    this.sprite = new Entity(this,this.scale.width/2,500,'stretch_left');
    this.spriteRenderer = this.sprite.addComponent(SpriteRenderer,'stretch_left');
    this.spriteRenderer.changeSprite('stretch_left');
  }

  onGameOver() {
    console.log("Complete");
  }

  update() {
    
  }
}