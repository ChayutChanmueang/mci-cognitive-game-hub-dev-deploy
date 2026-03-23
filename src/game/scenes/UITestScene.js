import Phaser from "phaser";
import Conveyer from "../entity/script/conveyer";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import StorageManager from "../../core/storage-manager";
import db from "../../core/database.js";

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

    this.load.image('button-idle','assets/button_rectangle_depth_flat.png')
    this.load.image('button-press','assets/button_rectangle_flat.png')
  }

  create(data) {
    console.log("UI test scene");

    // this.lava = this.add.rectangle(400,650,800,50,0xff0000,0);
    // this.physics.add.existing(this.lava,true);
    //this.animal = new Animal(this,this.scale.width/2,1200);
    this.score = 0;
    this.level = this.score / 100;
    this.lastLevel = this.level;
    this.lives = 3;
    this.isGameOver = false;
    this.isRestarting = false;

    this.gameplayUI = new GameplayUI(this,0,0);
    this.gameplayUI.resetGameOverPanel();
    const _conveyerNums = data.conveyerNums || 3;
    this.currentConeyer = 0;
    this.conveyers = [];
    while(this.conveyers.length < _conveyerNums){
      this.conveyers[this.currentConeyer] = new Conveyer(this,this.scale.width * ((1 + this.currentConeyer)/(_conveyerNums+1)),(this.scale.height/2) - 950,150,2.15);
      this.currentConeyer++;
    }

    console.log(this.conveyers.length);
    this.spawnFruit();
    this.physics.resume();
    
    //const _fruit = new Fruit(this, this.scale.width/2, 50);
  }
  update(time,delta){
    for(const _conveyer of this.conveyers){
      _conveyer.update(time,delta);
    }
  }
  onGetEatableFood(){
    this.addScore(100);
  }
  onGetUneatableFood(){
    this.removeLives(1);
  }
  onRemoveEatableFood(){
    this.removeLives(1);
  }
  onRemoveUneatableFood(){
    this.addScore(25);
  }
  addScore(addedScore){
    this.score += addedScore;
    console.log("Current Score: " + this.score);
    this.level = this.score / 100;
    this.level = Math.floor(this.level);
    console.log("level: " + this.level);
    this.gameplayUI.setScore(this.score);
    
    if(this.level % 10 == 0 && this.level != this.lastLevel){
      for(const _conveyer of this.conveyers){
      _conveyer.animal.changeAnimal();
      }
      console.log("change animal");
      //this.lastLevel = this.level;
    }
    if(this.level % 5 == 0 && this.level != this.lastLevel){
      for(const _conveyer of this.conveyers){
      _conveyer.addSpeed(50);
      }
      this.lastLevel = this.level;
    }
  }
  removeLives(removedLives){
    this.lives -= removedLives
    console.log("Current Lives: " + this.lives);
    if(this.lives >= 0){
      this.gameplayUI.setLives(this.lives);
    }
    if(this.lives < 0){
      //this.scene.pause();
      this.onGameOver();
    }
  }
  onGameOver(){
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    //this.scene.pause();
    this.physics.pause();

    for(const _conveyer of this.conveyers){
      _conveyer.stop();
      if(_conveyer.spawnTimer){
        _conveyer.spawnTimer.paused = true;
      }
    }
    if(this.spawnFruitTimer){
      this.time.removeEvent(this.spawnFruitTimer);
      this.spawnFruitTimer = undefined;
    }
    const storedHighScore = StorageManager.get('highscore', 0);

    if(this.score > storedHighScore){
      db.submitHighScore(this.score, 0)
        .then((record) => {
          if (this.isRestarting || !this.sys.isActive()) {
            return;
          }

          console.log(`Saved high score ID: ${record.id}`);
          StorageManager.save('highscore', this.score);
          this.gameplayUI.setGameOverHighscore(this.score);
        })
        .catch((error) => {
          console.error("Failed to save high score:", error);
        });
    }
    this.gameplayUI.showGameOverPanel(this.score);
    //console.log("Highscore: " + StorageManager.get('highscore'));
  }
  restartGame(){
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
  spawnFruit(){
    this.randomSpawnFruit();
    console.log(this.spawnFruitTimer);
    if(this.spawnFruitTimer == null){
        this.spawnFruitTimer = this.time.addEvent({
            delay: this.randomChooseNum(9,15) * 100, //ms
            callback: this.randomSpawnFruit,
            callbackScope: this,
            loop: true
        });
    }
  }
  randomSpawnFruit(){
    this.conveyers[this.randomChooseNum(0,this.conveyers.length-1)].spawnFoods();
    if(this.spawnFruitTimer){
      this.spawnFruitTimer.delay = this.randomChooseNum(9,15) * 100;
    }
  }
  randomChooseNum(min,max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
}
