import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import Entity from "../entity/entity";
import DraggableComponent from "../components/scripts/draggable";
import SocketComponent from "../components/scripts/socket";
import EntityGrid from "../entity/entityGrid";
import NonDraggableComponent from "../components/scripts/non-draggable";
import { Difficulty, GameLevels, Config, DifficultyLevelNumber } from "../constants";
import SolutionSocketComponent from "../components/scripts/solutionSocket";
import DraggableDataComponent from "../components/scripts/draggableData";
import { EventBus } from "../../../core/EventBus";

import LevelGenerator from "../components/scripts/level-generator";
import game_db from "/src/util/minigame-db-util.js";
import EmojiRenderer from "../components/scripts/emoji-renderer";
import SpriteRenderer from "../components/scripts/sprite-renderer";
import DebugMenu from "./DebugMenu";
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";
import { ReplayEvent } from "../../../core/replay-event.js";
import { ReplayLogBuffer } from "../../../core/replay-log-buffer.js";
import SessionStorageManager from "../../../core/session-storage-manager.js";
import { GameOverSetting } from "../constants.js";

// Pool of animal sprite keys (loaded in preload)
const ANIMAL_SPRITES = [
  'icon_bear',
  'icon_cow',
  'icon_elephant',
  'icon_fox',
  'icon_lion',
  'icon_panda',
];

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
    this.stage = 1;
    this.allScore = 0;
    this.isGameEnded = false;
    this.levelGenerator = new LevelGenerator();
  }

  preload() {
    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')

    // Animal icons for draggable entities
    this.load.image('icon_bear', 'assets/common/animal/icons/H_Bear.png')
    this.load.image('icon_cow', 'assets/common/animal/icons/H_Cow.png')
    this.load.image('icon_elephant', 'assets/common/animal/icons/H_ele.png')
    this.load.image('icon_fox', 'assets/common/animal/icons/H_Fox.png')
    this.load.image('icon_lion', 'assets/common/animal/icons/H_Li.png')
    this.load.image('icon_panda', 'assets/common/animal/icons/H_Pan.png')
  }

  create(data) {
    //Initialize Logging
    if (this.replayLogger == null) {
      this.replayLogger = new ReplayLogBuffer();
    }
    else {
      this.replayLogger.clearEvents();
    }

    this.correctSlotMove = 0;
    this.wrongSlotMove = 0;
    this.totalMove = 0;

    EventBus.emit('minigame:show-hud');

    this.sceneData = { ...data };
    var _tempLevel = Difficulty.EASY;
    switch (Number(SessionStorageManager.get("selected_game_level"))) {
      case 1: _tempLevel = Difficulty.EASY; break;
      case 2: _tempLevel = Difficulty.NORMAL; break;
      case 3: _tempLevel = Difficulty.HARD; break;
    }
    this.level = _tempLevel || data.level || Difficulty.EASY;
    this.stage = 1;
    this.allScore = 0;
    this.completedStages = 0;
    this.isGameEnded = false;

    this.constructGrid(true);

    this.gameStartedAt = new Date();
    this.replayLogger.addEvent(ReplayEvent.SymmetryDecor.ROUND_START, this.gameStartedAt);
    this.gameEndedAt = new Date();

    this.gameplayUI = new GameplayUI(this, 0, 0);

    // Hide old internal Phaser UI
    this.gameplayUI.uiBackground.setVisible(false);
    this.gameplayUI.currentScore.setVisible(false);
    this.gameplayUI.currentLives.setVisible(false);

    // Initial HUD State
    const maxTimeS = Math.ceil(Config.TimeLimitMs / 1000);
    EventBus.emit('minigame:score', { score: this.stage });
    EventBus.emit('minigame:level', { level: `${this.level} - รอบที่ ${this.stage}` });
    EventBus.emit('minigame:tick', { timeLeft: maxTimeS, maxTime: maxTimeS });

    // Flag: timer expired while puzzle was in progress — finish puzzle first
    this.pendingGameOver = false;

    this.events.on('socketFilled', (socketComponent, entity) => {
      if (this.isGameEnded) return;

      console.log(`Locked into ${socketComponent.name}`);
      if (socketComponent.entity.getComponent(SolutionSocketComponent) != null) {
        var socketChecker = socketComponent.entity.getComponent(SolutionSocketComponent);
        this.totalMove++;
        if (socketChecker.checkEntity(entity.getComponent(DraggableDataComponent))) {
          console.log("Correct Socket");
          this.correctSlotMove++;
          this.replayLogger.addEvent(ReplayEvent.SymmetryDecor.PIECE_PLACED, "CORRECT");
          if (this.checkIfAllSocketIsFilledCorrectly()) {
            console.log("Game Complete");
            this.handleRoundComplete();
          }
        }
        else {
          this.wrongSlotMove++;
          this.replayLogger.addEvent(ReplayEvent.SymmetryDecor.PIECE_PLACED, "WRONG");
        }
      }
    });

    this.levelStartTime = null;
    this.levelIsActive = true;

    // Debug menu (bottom-left toggle button)
    this.debugMenu = new DebugMenu(this);
  }

  handleRoundComplete() {
    if (this.isGameEnded) return;

    const addScore = Config.IncreaseScore[this.level];
    this.allScore += addScore;
    this.completedStages++;

    // Always trigger level complete effect for the final puzzle success
    showLevelCompleteEffect();

    // If timer already expired, end the game after the effect
    if (this.pendingGameOver) {
      this.time.delayedCall(1500, () => {
        this.onGameOver("success");
      });
      return;
    }

    // Otherwise, advance to the next round
    this.stage++;
    EventBus.emit('minigame:score', { score: this.stage });
    EventBus.emit('minigame:level', { level: `${this.level} - รอบที่ ${this.stage}` });

    // Short delay for success feedback before loading next puzzle
    this.time.delayedCall(1500, () => {
      this.constructGrid(true);
    });
  }

  onGameOver(status = "success") {
    if (this.isGameEnded) return;
    this.isGameEnded = true;
    this.levelIsActive = false;
    this.gameEndedAt = new Date();
    this.replayLogger.addEvent(ReplayEvent.PostcardReader.ROUND_COMPLETED, this.gameEndedAt);
    this.replayLogger.pushToDatabase();

    //Save game data to database
    game_db.pushGameData(this.allScore, DifficultyLevelNumber[this.level], this.gameStartedAt, this.gameEndedAt).then(() => {
      console.log("Game data saved to database.");
    }).catch((error) => {
      console.error("Failed to save game data:", error);
    });

    const finalTime = ((this.time.now - this.levelStartTime) / 1000).toFixed(2);
    // stages completed = current stage - 1 (since stage increments at round start)
    // but if pendingGameOver triggered after finishing, stage is already incremented by handleRoundComplete
    // so we track completedStages separately
    const completedStages = this.completedStages || 0;

    // this.gameplayUI.showGameOverPanel(finalTime, this.allScore, completedStages);
    EventBus.emit('minigame:game-over', {
      score: this.allScore,
      level: this.level,
      panelBorderColor: GameOverSetting.panelBorderColor,
      panelHeaderColor: GameOverSetting.panelHeaderColor,
    });
  }

  update() {
    if (this.isGameEnded || !this.levelIsActive) return;

    if (this.levelStartTime === null) {
      this.levelStartTime = this.time.now;
    }

    const elapsePlaytimeMS = this.time.now - this.levelStartTime;
    const timeLeftS = Math.ceil((Config.TimeLimitMs - elapsePlaytimeMS) / 1000);

    const maxTimeS = Math.ceil(Config.TimeLimitMs / 1000);
    EventBus.emit('minigame:tick', { timeLeft: Math.max(0, timeLeftS), maxTime: maxTimeS });

    if (elapsePlaytimeMS >= Config.TimeLimitMs && !this.pendingGameOver) {
      // Let the player finish the current puzzle before ending
      this.pendingGameOver = true;
    }
  }

  constructGrid(isProcedural = false) {
    if (this.grid) {
      this.grid.destroy();
    }

    var _gridConfig, _level, _solution;

    if (isProcedural) {
      const baseConfig = this.configMaker(this.level, this.stage);
      const generatedData = this.levelGenerator.generate(baseConfig, this.stage);
      _gridConfig = generatedData.GRIDCONFIG;
      _level = generatedData.LEVEL;
      _solution = generatedData.SOLUTION;
    } else {
      _gridConfig = GameLevels[Difficulty.EASY][0].GRIDCONFIG;
      _level = GameLevels[Difficulty.EASY][0].LEVEL;
      _solution = GameLevels[Difficulty.EASY][0].SOLUTION;
    }

    this.levelSolution = _solution;

    // Adjust grid position based on screen width
    const gridX = (this.scale.width - (_gridConfig.width || 900)) / 2;
    this.grid = new EntityGrid(this, gridX, 450, _gridConfig);

    let currentEntity = 0;
    let currentCorrectSocket = 0;

    for (let i = 0; i < _gridConfig.columns; i++) {
      for (let j = 0; j < _gridConfig.rows; j++) {
        const cell = new Entity(this, 0, 0, '__WHITE');
        cell.setTint(0xffffff);
        cell.alpha = 0.05;
        const socket = cell.addComponent(SocketComponent, `Socket ${i},${j}`);
        this.grid.addEntityAt(i, j, cell);

        if (currentEntity < _level.length) {
          if (_level[currentEntity].POS.X === i && _level[currentEntity].POS.Y === j) {
            if (_level[currentEntity].DRAGGABLE) {
              const box = new Entity(this, 0, 0, '__WHITE');
              box.clearTint();
              box.setDisplaySize(this.grid.cellWidth * 0.8, this.grid.cellHeight * 0.8);
              box.setDepth(100);

              const drag = box.addComponent(DraggableComponent);
              const data = box.addComponent(DraggableDataComponent, _level[currentEntity]);

              // Use the animal type from level data — this matches the solution socket
              const spriteKey = _level[currentEntity].Animal;
              const spriteScale = (this.grid.cellWidth * 0.8) / 128 * 0.56;
              box.addComponent(SpriteRenderer, {
                textureKey: spriteKey,
                sizeScale: spriteScale,
              });

              socket.attach(box);
              drag.currentSocket = socket;
              data.socket = socket;
            } else {
              const blocker = new Entity(this, 0, 0, '__WHITE');
              blocker.clearTint();
              blocker.setDisplaySize(this.grid.cellWidth * 0.8, this.grid.cellHeight * 0.8);
              blocker.setDepth(100);

              // Use the animal type from level data to match the draggable counterpart
              const blockerSpriteKey = _level[currentEntity].Animal;
              const blockerSpriteScale = (this.grid.cellWidth * 0.8) / 128 * 0.56;
              blocker.addComponent(SpriteRenderer, {
                textureKey: blockerSpriteKey,
                sizeScale: blockerSpriteScale,
              });

              blocker.addComponent(NonDraggableComponent, socket);
            }
            currentEntity++;
          }
        }

        if (currentCorrectSocket < _solution.length) {
          if (_solution[currentCorrectSocket].POS.X === i && _solution[currentCorrectSocket].POS.Y === j) {
            cell.addComponent(SolutionSocketComponent, _solution[currentCorrectSocket]);
            currentCorrectSocket++;
          }
        }
      }
    }
    this.grid.sort('depth');
  }

  configMaker(_Difficulty = Difficulty.EASY, _Level = 1) {
    var config = {
      width: 900,
      height: 900,
      columns: 0,
      rows: 0,
      padding: 0,
      itemCount: 0,
      showSymmetryLine: true,
      symmetryType: null
    };
    switch (_Difficulty) {
      case Difficulty.EASY:
        config.columns = 4;
        config.rows = 4;
        config.itemCount = Math.min(5, 3 + Math.floor((_Level - 1) / 2));
        config.symmetryType = ['L-R', 'T-B'][Math.floor(Math.random() * 2)];
        break;
      case Difficulty.NORMAL:
        config.columns = (_Level % 2 !== 0) ? 4 : 6;
        config.rows = config.columns;
        config.itemCount = Math.min(8, 3 + Math.floor((_Level - 1) / 2));
        let normalModes = ['L-R', 'T-B'];
        if (_Level >= 5) normalModes = ['L-R', 'T-B', 'R-L', 'B-T', 'QUADRANT'];
        else if (_Level >= 3) normalModes = ['L-R', 'T-B', 'R-L', 'B-T'];
        config.symmetryType = normalModes[Math.floor(Math.random() * normalModes.length)];
        break;
      case Difficulty.HARD:
        if (_Level >= 7) {
          const cycle = _Level % 3;
          if (cycle === 1) { config.columns = 4; config.rows = 4; }
          else if (cycle === 2) { config.columns = 6; config.rows = 6; }
          else { config.columns = 8; config.rows = 6; }
        } else {
          config.columns = (_Level % 2 !== 0) ? 4 : 6;
          config.rows = config.columns;
        }
        config.itemCount = Math.min(8, 3 + Math.floor((_Level - 1) / 2));
        let hardModes = ['L-R', 'T-B', 'R-L', 'B-T', 'QUADRANT', 'FOUR_WAY', 'DIAGONAL'];
        if (config.columns !== config.rows) {
          hardModes = hardModes.filter(mode => mode !== 'FOUR_WAY' && mode !== 'DIAGONAL');
        }
        config.symmetryType = hardModes[Math.floor(Math.random() * hardModes.length)];
        break;
    }

    // Ensure cells are square by adjusting height based on the column/row ratio
    if (config.columns > 0 && config.rows > 0) {
      config.height = config.width * (config.rows / config.columns);
    }

    return config;
  }

  checkIfAllSocketIsFilledCorrectly() {
    const _solution = this.levelSolution;
    for (var i = 0; i < _solution.length; i++) {
      const cell = this.grid.getEntityAt(_solution[i].POS.X, _solution[i].POS.Y);
      const socket = cell.getComponent(SocketComponent);
      const solution = cell.getComponent(SolutionSocketComponent);

      if (!socket.occupant) return false;
      if (!solution.checkEntity(socket.occupant.getComponent(DraggableDataComponent))) return false;
    }
    return true;
  }

  createButton(x, y, text, onClick) {
    const bg = this.add.rectangle(x, y, 200, 60, 0x00aa00, 1).setInteractive({ useHandCursor: true });
    bg.setScale(1.5);
    const label = this.add.text(x, y, text, {
      fontSize: '28px', fontStyle: 'bold'
    }).setOrigin(0.5);
    label.setScale(1.5);

    bg.on('pointerdown', onClick);

    bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
    bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

    return [bg, label];
  }
}