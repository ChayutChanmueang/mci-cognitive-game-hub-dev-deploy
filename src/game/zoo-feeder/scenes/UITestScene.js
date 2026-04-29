import Phaser from "phaser";
import Conveyer from "../entity/script/conveyer";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import StorageManager from "../../../core/storage-manager";
import db from "../../../core/database.js";

const GAME_ID = "ATTN001";

export default class UITestScene extends Phaser.Scene {
  constructor() {
    super("ui-test-scene");
  }

  preload() {
    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI",
    );

    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')
    //BG
    this.load.image('background', 'assets/zoo-feeder/etc/BG.svg')
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
    this.load.image('bear_sprite', 'assets/zoo-feeder/animal/B_Bear.svg')
    this.load.image('cow_sprite', 'assets/zoo-feeder/animal/B_Cow.svg')
    this.load.image('elephant_sprite', 'assets/zoo-feeder/animal/B_Ele.svg')
    this.load.image('fox_sprite', 'assets/zoo-feeder/animal/B_Fox.svg')
    this.load.image('lion_sprite', 'assets/zoo-feeder/animal/B_Li.svg')
    this.load.image('panda_sprite', 'assets/zoo-feeder/animal/B_Pan.svg')
  }

  create(data) {
    console.log("UI test scene");

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

    this.gameplayUI = new GameplayUI(this, 0, 0);
    this.gameplayUI.resetGameOverPanel();
    this.conveyerNums = data.conveyerNums || 3;
    this.conveyers = [];

    // 1. Define the exact pixel gap you want between each conveyor belt
    const _conveyerSpacing = 300;

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
        (this.scale.height / 2) - 950,
        150,
        2.15
      );

      this.conveyers.push(_newConveyer);
    }

    console.log(this.conveyers.length);
    //this.spawnFruit();
    this.physics.resume();

    //const _fruit = new Fruit(this, this.scale.width/2, 50);

    this.countdownTimer = this.time.addEvent({
      delay: 180000,
      callback: () => {
        this.onGameOver();
      },
      callbackScope: thisArg,
      loop: false,
    })
  }
  update(time, delta) {
    for (const _conveyer of this.conveyers) {
      _conveyer.update(time, delta);
    }
  }
  onGetEatableFood() {
    this.addScore(20);
  }
  onGetUneatableFood() {
    this.removeLives(-50);
  }
  onRemoveEatableFood() {
    this.removeLives(-25);
  }
  onRemoveUneatableFood() {
    this.addScore(10);
  }
  addScore(addedScore) {
    this.score += addedScore;
    console.log("Current Score: " + this.score);
    this.level = this.score / 100;
    this.level = Math.floor(this.level);
    console.log("level: " + this.level);
    this.gameplayUI.setScore(this.score);

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
    //this.scene.pause();
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
    const storedHighScore = StorageManager.get('highscore', 0);
    const endedAt = new Date();

    db.submitGameData({
      gid: GAME_ID,
      score: this.score,
      level: this.conveyerNums,
      startedAt: this.gameStartedAt,
      endedAt,
    })
      .then(() => {
        if (this.isRestarting || !this.sys.isActive()) {
          return;
        }

        console.log("Saved game data to Supabase");

        if (this.score > storedHighScore) {
          StorageManager.save('highscore', this.score);
          this.gameplayUI.setGameOverHighscore(this.score);
        }
      })
      .catch((error) => {
        console.error("Failed to save game data:", error);
      });

    this.gameplayUI.showGameOverPanel(this.score);
    //console.log("Highscore: " + StorageManager.get('highscore'));
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
