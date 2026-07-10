import Phaser from "phaser";
import Entity from "../entity/entity";
import DraggableComponent from "../components/scripts/draggable";
import SocketComponent from "../components/scripts/socket";
import EntityGrid from "../entity/entityGrid";
import NonDraggableComponent from "../components/scripts/non-draggable";
import SolutionSocketComponent from "../components/scripts/solutionSocket";
import DraggableDataComponent from "../components/scripts/draggableData";
import { EventBus } from "../../../core/EventBus";

import LevelGenerator from "../components/scripts/level-generator";
import TutorialLevelManager from "../components/scripts/tutorial-level-manager";
import SpriteRenderer from "../components/scripts/sprite-renderer";
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";
import { TutorialLevelConfig, AvailableAssets, ThemeAssets } from "../constants.js";

export default class TutorialLevelScene extends Phaser.Scene {
  constructor() {
    super("tutorial-level-scene");
    this.levelGenerator = new LevelGenerator();
  }

  preload() {
    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png');
    this.load.image('button-press', 'assets/button_rectangle_flat.png');

    for (const [key, path] of Object.entries(ThemeAssets)) {
        this.load.image(key, path);
    }
    this.load.image('tutorial_hand', 'assets/common/ui_icon/return_btn.png');
  }

  create() {
    EventBus.emit('minigame:show-hud');

    this.background = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-10);

    // Initial HUD State
    EventBus.emit('minigame:score', { score: 0 });
    EventBus.emit('minigame:level', { level: 'ฝึกซ้อม' });
    // Keep timer visually frozen (e.g., at 100%) and set text to 'ฝึกเล่น'
    EventBus.emit('minigame:tick', { timeLeft: 1, maxTime: 1, updateProgress: false });
    EventBus.emit('minigame:timer-text', { text: 'ฝึกเล่น' });

    this.constructTutorialGrid();
  }

  constructTutorialGrid() {
    if (this.grid) {
      this.grid.destroy();
    }

    const config = {
      width: 900,
      height: 900,
      columns: TutorialLevelConfig.gridColumns,
      rows: TutorialLevelConfig.gridRows,
      padding: 0,
      itemCount: TutorialLevelConfig.itemCount,
      showSymmetryLine: true,
      symmetryType: TutorialLevelConfig.symmetryType
    };

    const generatedData = this.levelGenerator.generate(config, 1, AvailableAssets);
    const _gridConfig = generatedData.GRIDCONFIG;
    const _level = generatedData.LEVEL;
    const _solution = generatedData.SOLUTION;

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

    // Disable drop-zones on the reference side AND non-solution slots
    for (let i = 0; i < _gridConfig.columns; i++) {
      for (let j = 0; j < _gridConfig.rows; j++) {
        const cell = this.grid.getEntityAt(i, j);
        if (!cell) continue;

        const hasSolution = cell.getComponent(SolutionSocketComponent);
        const isReferenceCell = this.levelGenerator.isCellInRegion(
            _gridConfig.symmetryType, 'fixed', i, j,
            Math.floor(_gridConfig.columns / 2),
            Math.floor(_gridConfig.rows / 2)
        );

        if (isReferenceCell) {
            // Reference side
            if (cell.input) cell.input.dropZone = false;
            cell.setTint(0x888888);
            cell.setAlpha(0.5);
        } else if (!hasSolution) {
            // Draggable side but not a solution slot
            if (cell.input) cell.input.dropZone = false;
            cell.setAlpha(0.3); // Visually dim it slightly
        }
      }
    }

    // Start the Tutorial Manager
    if (this.tutorialManager) {
        this.tutorialManager.destroy();
    }

    this.tutorialManager = new TutorialLevelManager(
        this,
        this.grid,
        _level,
        _solution,
        _gridConfig.symmetryType,
        TutorialLevelConfig
    );
    
    this.events.once('tutorial-level-complete', () => {
        showLevelCompleteEffect();
        this.time.delayedCall(1500, () => {
            this.scene.start('gameplay-scene');
        });
    });

    this.tutorialManager.start();
  }
}
