import Phaser from "phaser";
import Conveyer from "../entity/script/conveyer";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import StorageManager from "../../../core/storage-manager";
import db from "../../../core/database.js";
import { EventBus } from "../../../core/EventBus.js";
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";
import ReplayLogBuffer from "../../../core/replay-log-buffer.js";
import { ReplayEvent } from "../../../core/replay-event.js";


const GAME_ID = "ATTN001";

export default class UITestScene extends Phaser.Scene {
  constructor() {
    super("ui-test-scene");
  }

  preload() {
    // rexUI is loaded via main.js global config

    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')
    //BG
    this.load.image('background', 'assets/zoo-feeder/etc/BG.png')
    //Food Sprite
    this.load.image('apple_sprite', 'assets/zoo-feeder/food/Apple.png')
    this.load.image('battery_sprite', 'assets/zoo-feeder/food/Battery.png')
    this.load.image('beef_sprite', 'assets/zoo-feeder/food/Beef.png')
    this.load.image('chicken_sprite', 'assets/zoo-feeder/food/Chick.png')
    this.load.image('corn_sprite', 'assets/zoo-feeder/food/Corn.png')
    this.load.image('fish_sprite', 'assets/zoo-feeder/food/Fish.png')
    this.load.image('garbage_sprite', 'assets/zoo-feeder/food/Garbage.png')
    this.load.image('plant_sprite', 'assets/zoo-feeder/food/Plant.png')
    this.load.image('soda_sprite', 'assets/zoo-feeder/food/Soda.png')
    //Animal Sprite
    this.load.image('bear_sprite', 'assets/zoo-feeder/animal/B_Bear.png')
    this.load.image('cow_sprite', 'assets/zoo-feeder/animal/B_Cow.png')
    this.load.image('elephant_sprite', 'assets/zoo-feeder/animal/B_Ele.png')
    this.load.image('fox_sprite', 'assets/zoo-feeder/animal/B_Fox.png')
    this.load.image('lion_sprite', 'assets/zoo-feeder/animal/B_Li.png')
    this.load.image('panda_sprite', 'assets/zoo-feeder/animal/B_Pan.png')
    //Animal Icon
    this.load.image("bear_icon", "assets/zoo-feeder/animal/icons/H_Bear.png");
    this.load.image("cow_icon", "assets/zoo-feeder/animal/icons/H_Cow.png");
    this.load.image("elephant_icon", "assets/zoo-feeder/animal/icons/H_ele.png");
    this.load.image("fox_icon", "assets/zoo-feeder/animal/icons/H_Fox.png");
    this.load.image("lion_icon", "assets/zoo-feeder/animal/icons/H_Li.png");
    this.load.image("panda_icon", "assets/zoo-feeder/animal/icons/H_Pan.png");
    //Emote
    this.load.image("popup_emote", "assets/zoo-feeder/etc/Popup.png");
    this.load.image("emote_sad", "assets/zoo-feeder/etc/Emoji_None.png");
    this.load.image("emote_happy", "assets/zoo-feeder/etc/Emoji_Smile.png");
  }

  create(data) {
    console.log("UI test scene");

    //Initialize Logging
    if(this.replayLogger == null){
      this.replayLogger = new ReplayLogBuffer();
    }
    else{
      this.replayLogger.clearEvents();
    }

    this.correctDeliver = 0;
    this.wrongDeliver = 0;
    this.correctDrop = 0;
    this.wrongDrop = 0;
    EventBus.emit('minigame:show-hud');

    // this.lava = this.add.rectangle(400,650,800,50,0xff0000,0);
    // this.physics.add.existing(this.lava,true);
    //this.animal = new Animal(this,this.scale.width/2,1200);
    this.background = this.add.sprite(0,0,'background');
    this.background.setScale(27);
    this.background.setDepth(-10);
    this.score = 0;
    this.level = this.score / 100;
    this.lastLevel = this.level;
    this.lives = 3;
    this.isGameOver = false;
    this.isRestarting = false;
    this.gameStartedAt = new Date();
    this.replayLogger.addEvent(ReplayEvent.ZooFeeder.ROUND_START,this.gameStartedAt);
    this.gameEndedAt = new Date();
    this.spawnFruitTimer = null;

    this.gameplayUI = new GameplayUI(this, 0, 0);
    this.gameplayUI.resetGameOverPanel();
    
    // Hide old Phaser UI elements if we're using the DOM HUD
    this.gameplayUI.uiBackground.setVisible(false);
    this.gameplayUI.currentScore.setVisible(false);
    this.gameplayUI.currentLives.setVisible(false);

    // Initial state to HUD
    EventBus.emit('minigame:score', { score: this.score });
    EventBus.emit('minigame:lives', { lives: this.lives });
    const gameTime = 180;
    EventBus.emit('minigame:tick', { timeLeft: gameTime, maxTime: gameTime }); // 3 minutes

    this.conveyerNums = data.conveyerNums || 3;
    this.conveyers = [];

    // 1. Define the exact pixel gap you want between each conveyor belt
    const _conveyerSpacing = 325;

    // 2. Calculate the starting X position so the group remains perfectly centered
    const _totalWidth = _conveyerSpacing * (this.conveyerNums - 1);
    const _startX = (this.scale.width / 2) - (_totalWidth / 2);

    // 3. Iterate and spawn using a cleaner 'for' loop
    for (let i = 0; i < this.conveyerNums; i++) {

      // Multiply the current index by the spacing to spread them out
      const _xPos = _startX + (i * _conveyerSpacing);

      const _newConveyer = new Conveyer(
        this,
        _xPos,
        (this.scale.height / 2) - 1050,
        150,
        2.15
      );

      this.conveyers.push(_newConveyer);
    }

    console.log(this.conveyers.length);
    //this.spawnFruit();
    this.physics.resume();

    //const _fruit = new Fruit(this, this.scale.width/2, 50);

  }

  startTimer() {
    const gameTime = 180;
    if (this.countdownTimer) return;
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        const remaining = Math.ceil(this.countdownTimer.getOverallRemainingSeconds());
        EventBus.emit('minigame:tick', { timeLeft: remaining, maxTime: gameTime });
        if (remaining <= 0) {
            this.onGameOver();
        }
      },
      repeat: gameTime - 1,
    });
  }

  update(time, delta) {
    for (const _conveyer of this.conveyers) {
      _conveyer.update(time, delta);
    }
  }
  onGetEatableFood() {
    this.addScore(20);
    this.correctDeliver++;
    this.replayLogger.addEvent(ReplayEvent.ZooFeeder.FOOD_DELIVERED,"CORRECT");
  }
  onGetUneatableFood() {
    this.addScore(-50);
    this.wrongDeliver++;
    this.replayLogger.addEvent(ReplayEvent.ZooFeeder.FOOD_DELIVERED,"WRONG");
    
  }
  onRemoveEatableFood() {
    this.addScore(-25);
    this.wrongDrop++;
    this.replayLogger.addEvent(ReplayEvent.ZooFeeder.FOOD_DROPPED,"WRONG");
  }
  onRemoveUneatableFood() {
    this.addScore(10);
    this.correctDrop++;
    this.replayLogger.addEvent(ReplayEvent.ZooFeeder.FOOD_DROPPED,"CORRECT");
  }
  addScore(addedScore) {
    this.score += addedScore;
    if(this.score < 0) this.score = 0;
    console.log("Current Score: " + this.score);
    this.level = this.score / 100;
    this.level = Math.floor(this.level);
    console.log("level: " + this.level);
    this.gameplayUI.setScore(this.score);
    EventBus.emit('minigame:score', { score: this.score });


    if (this.level % 10 == 0 && this.level != this.lastLevel) {
      for (const _conveyer of this.conveyers) {
        _conveyer.animal.changeAnimal();
      }
      console.log("change animal");
      //this.lastLevel = this.level;
    }
    if (this.level % 5 == 0 && this.level != this.lastLevel) {
      for (const _conveyer of this.conveyers) {
        _conveyer.addSpeed(50);
      }
      this.lastLevel = this.level;
    }
  }
  removeLives(removedLives) {
    this.lives -= removedLives
    console.log("Current Lives: " + this.lives);
    EventBus.emit('minigame:lives', { lives: Math.max(0, this.lives) });
    if (this.lives >= 0) {
      this.gameplayUI.setLives(this.lives);
    }
    if (this.lives < 0) {
      //this.scene.pause();
      this.onGameOver();
    }
  }
  onGameOver() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    
    // Trigger the premium DOM effect
    showLevelCompleteEffect();

    this.physics.pause();

    for (const _conveyer of this.conveyers) {
      _conveyer.stop();
      if (_conveyer.spawnTimer) {
        _conveyer.spawnTimer.paused = true;
      }
    }
    if (this.spawnFruitTimer) {
      this.time.removeEvent(this.spawnFruitTimer);
      this.spawnFruitTimer = undefined;
    }

    // Wait for the effect to finish before showing the game over panel
    this.time.delayedCall(1500, () => {
      const storedHighScore = StorageManager.get('highscore', 0);

      if (this.score > storedHighScore) {
        StorageManager.save('highscore', this.score);
        this.gameplayUI.setGameOverHighscore(this.score);
      }

      this.gameEndedAt = new Date();
      this.replayLogger.addEvent(ReplayEvent.ZooFeeder.ROUND_COMPLETED,this.gameEndedAt);

      this.replayLogger.pushToDatabase();

      // this.gameplayUI.showGameOverPanel(this.score);
      EventBus.emit('minigame:game-over', { 
          score: this.score,
          level: this.level
      });
    });
  }
  restartGame() {
    if (this.isRestarting) {
      return;
    }

    this.isRestarting = true;
    this.isGameOver = false;

    if (this.gameplayUI) {
      this.gameplayUI.resetGameOverPanel();
    }

    if (this.conveyer && this.conveyer.spawnTimer) {
      this.conveyer.spawnTimer.remove(false);
    }

    this.scene.restart();
  }
  spawnFruit() {
    this.randomSpawnFruit();
    console.log(this.spawnFruitTimer);
    if (this.spawnFruitTimer == null) {
      this.spawnFruitTimer = this.time.addEvent({
        delay: this.randomChooseNum(9, 15) * 100, //ms
        callback: this.randomSpawnFruit,
        callbackScope: this,
        loop: true
      });
    }
  }
  randomSpawnFruit() {
    this.conveyers[this.randomChooseNum(0, this.conveyers.length - 1)].spawnFoods();
    if (this.spawnFruitTimer) {
      this.spawnFruitTimer.delay = this.randomChooseNum(9, 15) * 100;
    }
  }
  randomChooseNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
