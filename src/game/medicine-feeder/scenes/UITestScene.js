import Phaser from "phaser";
import Conveyer from "../entity/script/conveyer";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import StorageManager from "../../../core/storage-manager";
import db from "../../../core/database.js";
import { EventBus } from "../../../core/EventBus.js";
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";
import ReplayLogBuffer from "../../../core/replay-log-buffer.js";
import { GlobalReplayEvent } from "../../../core/replay-event.js";
import game_db from "/src/util/minigame-db-util.js";
import SessionStorageManager from "../../../core/session-storage-manager.js";
import DebugMenu from "./DebugMenu.js";
import { GameOverSetting, StartMenuSetting, GameplaySetting, ConveyerDifficultyLevel, DifficultyLabel, ThemeAssets, ReceiverSetting, ItemSpriteLibrary } from '../constants.js';
import { TutorialPanel } from '../../../ui/tutorial-panel.js';
const GAME_ID = "ATTN002";

export default class UITestScene extends Phaser.Scene {
  constructor() {
    super("ui-test-scene");
  }

  preload() {
    // rexUI is loaded via main.js global config

    // Shared UI assets (not theme-specific)
    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')
    // Shared emote assets (not theme-specific)
    this.load.image("popup_emote", "assets/zoo-feeder/etc/Popup.png");
    this.load.image("emote_sad",   "assets/zoo-feeder/etc/Emoji_None.png");
    this.load.image("emote_happy", "assets/zoo-feeder/etc/Emoji_Smile.png");

    // Theme-specific assets: loaded dynamically from the active theme JSON
    for (const [key, path] of Object.entries(ThemeAssets)) {
      this.load.image(key, path);
    }
  }

  create(data) {
    console.log("UI test scene");

    //Initialize Logging
    if (this.replayLogger == null) {
      this.replayLogger = new ReplayLogBuffer();
    }
    else {
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
    this.background = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-10);
    this.score = 0;
    this.level = this.score / 100;
    this.lastLevel = this.level;
    this.lives = 3;
    this.isGameOver = false;
    this.isRestarting = false;
    this.gameStartedAt = new Date();
    this.replayLogger.addCorrectEvent(GlobalReplayEvent.ROUND_START, true);
    this.gameEndedAt = new Date();
    this.spawnItemTimer = null;

    this.gameplayUI = new GameplayUI(this, 0, 0);
    this.gameplayUI.resetGameOverPanel();

    // Hide old Phaser UI elements if we're using the DOM HUD
    this.gameplayUI.uiBackground.setVisible(false);
    this.gameplayUI.currentScore.setVisible(false);
    this.gameplayUI.currentLives.setVisible(false);

    // Initial state to HUD
    EventBus.emit('minigame:score', { score: this.score });
    const gameTime = 180;
    EventBus.emit('minigame:tick', { timeLeft: gameTime, maxTime: gameTime }); // 3 minutes

    this.conveyerNums = Number(SessionStorageManager.get("selected_game_level")) || data.conveyerNums || 3;
    this.conveyers = [];

    // 1. Define the exact pixel gap based on conveyerNums
    const maxSpacing = 325;
    const availableWidth = this.scale.width - 200; // Leave some padding
    let _conveyerSpacing = maxSpacing;
    let _conveyerScale = 1;

    // If spacing is too wide for screen, scale down
    if (_conveyerSpacing * (this.conveyerNums - 1) > availableWidth) {
        _conveyerSpacing = availableWidth / Math.max(1, (this.conveyerNums - 1));
        _conveyerScale = _conveyerSpacing / maxSpacing;
    }

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
        2.15 * _conveyerScale
      );

      this.conveyers.push(_newConveyer);
    }

    console.log(this.conveyers.length);
    // Pause physics initially until tutorial is dismissed
    this.physics.pause();

    // Debug menu
    // this.debugMenu = new DebugMenu(this);

    // Show DOM Tutorial Panel
    const uiRoot = document.getElementById('ui-root');
    this.tutorialPanel = new TutorialPanel(uiRoot, {
      title:              StartMenuSetting.tutorialTitle,
      description:        StartMenuSetting.description,
      subdescription:     StartMenuSetting.instructions,
      panelBorderColor:   StartMenuSetting.panelBorderColor,
      panelHeaderColor:   StartMenuSetting.panelHeaderColor,
      primaryFontColor:   StartMenuSetting.primaryFontColor,
      secondaryFontColor: StartMenuSetting.secondaryFontColor,
      receiverSetting:    ReceiverSetting,
      itemSpriteLibrary:  ItemSpriteLibrary,
      themeAssets:        ThemeAssets,
      onStart: () => {
        this.physics.resume();
        this.spawnItem();
        this.startTimer();
      }
    });
    this.tutorialPanel.render();
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
    this.addScore(1);
    this.correctDeliver++;
    this.replayLogger.addCorrectEvent(GlobalReplayEvent.ANSWER_SUBMITTED, true);
    EventBus.emit('audio:play', 'medicine-feeder:eating');
    EventBus.emit('audio:play', 'medicine-feeder:correct');
  }
  onGetUneatableFood() {
    this.wrongDeliver++;
    this.replayLogger.addCorrectEvent(GlobalReplayEvent.ANSWER_SUBMITTED, false);
    EventBus.emit('audio:play', 'medicine-feeder:eating');
    EventBus.emit('audio:play', 'medicine-feeder:wrong');
  }
  onRemoveEatableFood() {
    this.wrongDrop++;
    this.replayLogger.addCorrectEvent(GlobalReplayEvent.ANSWER_SUBMITTED, false);
    EventBus.emit('audio:play', 'medicine-feeder:wrong');
  }
  onRemoveUneatableFood() {
    this.addScore(1);
    this.correctDrop++;
    this.replayLogger.addCorrectEvent(GlobalReplayEvent.ANSWER_SUBMITTED, true);
    EventBus.emit('audio:play', 'medicine-feeder:correct');
  }
  addScore(addedScore) {
    this.score += addedScore;
    if (this.score < 0) this.score = 0;
    console.log("Current Score: " + this.score);
    this.level = this.score / 100;
    this.level = Math.floor(this.level);
    console.log("level: " + this.level);
    this.gameplayUI.setScore(this.score);
    EventBus.emit('minigame:score', { score: this.score });


    if (this.level % 10 == 0 && this.level != this.lastLevel) {
      for (const _conveyer of this.conveyers) {
        _conveyer.receiver.changeReceiver();
      }
      console.log("change receiver");
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

    // Trigger the premium DOM effect
    showLevelCompleteEffect();

    this.physics.pause();

    for (const _conveyer of this.conveyers) {
      _conveyer.stop();
      if (_conveyer.spawnTimer) {
        _conveyer.spawnTimer.paused = true;
      }
    }
    if (this.spawnItemTimer) {
      this.time.removeEvent(this.spawnItemTimer);
      this.spawnItemTimer = undefined;
    }

    // Wait for the effect to finish before showing the game over panel
    this.time.delayedCall(1500, () => {
      const storedHighScore = StorageManager.get('highscore', 0);

      if (this.score > storedHighScore) {
        StorageManager.save('highscore', this.score);
        this.gameplayUI.setGameOverHighscore(this.score);
      }

      this.gameEndedAt = new Date();

      //Save game data to database
      game_db.pushGameData(this.score, ConveyerDifficultyLevel[this.conveyerNums], this.gameStartedAt, this.gameEndedAt).then(() => {
        console.log("Game data saved to database.");
      }).catch((error) => {
        console.error("Failed to save game data:", error);
      });

      this.replayLogger.addCorrectEvent(GlobalReplayEvent.ROUND_COMPLETED, true);

      this.replayLogger.pushToDatabase();

      // this.gameplayUI.showGameOverPanel(this.score);
      EventBus.emit('audio:play', 'medicine-feeder:endgame');
      EventBus.emit('minigame:game-over', {
        score: this.score,
        level: ConveyerDifficultyLevel[this.conveyerNums],
        panelBorderColor: GameOverSetting.panelBorderColor,
        panelHeaderColor: GameOverSetting.panelHeaderColor,
        resultImage: 'assets/common/result/result_zoo_feeder.png',
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
  spawnItem() {
    this.randomSpawnItem();
    console.log(this.spawnItemTimer);
    if (this.spawnItemTimer == null) {
      const cooldowns = GameplaySetting.spawnCooldowns[this.conveyerNums] || GameplaySetting.spawnCooldowns[1];
      this.spawnItemTimer = this.time.addEvent({
        delay: this.randomChooseNum(cooldowns.min, cooldowns.max) * 100, //ms
        callback: this.randomSpawnItem,
        callbackScope: this,
        loop: true
      });
    }
  }
  randomSpawnItem() {
    this.conveyers[this.randomChooseNum(0, this.conveyers.length - 1)].spawnItems();
    if (this.spawnItemTimer) {
      const cooldowns = GameplaySetting.spawnCooldowns[this.conveyerNums] || GameplaySetting.spawnCooldowns[1];
      this.spawnItemTimer.delay = this.randomChooseNum(cooldowns.min, cooldowns.max) * 100;
    }
  }
  randomChooseNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
