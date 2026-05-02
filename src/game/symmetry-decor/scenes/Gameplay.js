import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import Entity from "../entity/entity";
import DraggableComponent from "../components/scripts/draggable";
import SocketComponent from "../components/scripts/socket";
import EntityGrid from "../entity/entityGrid";
import NonDraggableComponent from "../components/scripts/non-draggable";
import { Difficulty, GameLevels } from "../constants";
import SolutionSocketComponent from "../components/scripts/solutionSocket";
import DraggableDataComponent from "../components/scripts/draggableData";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
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
  }

  create(data) {
    if (this.stage == undefined || this.level != data.level) this.stage = 1;
    this.level = data.level || 1;
    if (this.fullPlaytime == undefined  || this.level != data.level || this.fullPlaytime >= 180) {
      this.fullPlaytime = 0;
      this.startTime = this.time.now;
    }


    // if (this.level == Difficulty.EASY) {
    //   this.constructGrid(false);
    // }
    // else {
    //   this.constructGrid(true);
    // }
    this.constructGrid(true);

    this.gameStartedAt = new Date();
    this.gameEndedAt = new Date();

    this.gameplayUI = new GameplayUI(this, 0, 0);
    this.gameplayUI.setScore(this.stage);

    this.events.on('socketFilled', (socketComponent, entity) => {
      console.log(`Locked into ${socketComponent.name}`);
      if (socketComponent.entity.getComponent(SolutionSocketComponent) != null) {
        var socketChecker = socketComponent.entity.getComponent(SolutionSocketComponent);
        if (socketChecker.checkEntity(entity.getComponent(DraggableDataComponent))) {
          console.log("Correct Socket");
          if (this.checkIfAllSocketIsFilledCorrectly()) {
            console.log("Game Complete");
            this.onGameOver();
          }
          else {
            console.log("Not Complete Yet");
          }
        }
      }
    });
    this.onGameStart();
  }
  onGameStart() {
    this.levelStartTime = this.time.now;
    this.levelIsActive = true;
  }
  onGameOver() {
    //this.gameplayUI.TemplatePanel.show();
    this.finalTime = ((this.time.now - this.levelStartTime) / 1000).toFixed(2);
    this.fullPlaytime = ((this.time.now - this.startTime) / 1000).toFixed(2);
    this.gameEndedAt = new Date();

    // this.gameplayUI.showGameOverPanel(this.finalTime);
    // console.log("Final Playtime : " + this.finalTime);
    // this.stage++;
    if(this.fullPlaytime < 180){
      this.gameplayUI.showGameOverPanel(this.finalTime);
      console.log("Final Playtime : " + this.finalTime);
      if(this.levelIsActive)
      this.stage++;
    }
    else{
      this.gameplayUI.showGameEndPanel(this.stage);
      console.log("Final Playtime : " + this.finalTime);
      //console.log(this.fullPlaytime);
    }

    this.levelIsActive = false;
    console.log(this.fullPlaytime);

  }
  update() {
    const elapsePlaytimeMS = this.time.now - this.levelStartTime;
    this.elapsePlaytime = (elapsePlaytimeMS / 1000).toFixed(2);
  }
  generateProceduralLevel(difficultyConfig) {
    const rows = difficultyConfig.rows || 6;
    const columns = difficultyConfig.columns || 6;
    const halfCols = Math.floor(columns / 2);
    const halfRows = Math.floor(rows / 2);

    // Default to L-R if none provided
    const symmetryType = difficultyConfig.symmetryType || 'L-R';

    var levelData = [];
    var solutionData = [];
    const availableColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    // --- NEW PREDETERMINED AMOUNT LOGIC ---
    var numItems;
    if (difficultyConfig.itemCount !== undefined) {
      // Use the predetermined amount if it exists in the config
      numItems = difficultyConfig.itemCount;
    } else {
      // Fallback to the original math if no specific amount is provided
      var maxBaseItems = symmetryType === 'FOUR_WAY' ?
        Math.min(2, Math.floor((rows * columns) / 16)) :
        Math.min(4, Math.floor((rows * columns) / 8));

      numItems = Math.max(1, maxBaseItems);
    }
    // --------------------------------------

    var usedPositions = new Set();

    for (var i = 0; i < numItems; i++) {
      // --- 1. GENERATE FIXED TARGET ---
      var fixedX, fixedY;
      var safety = 0;
      do {
        if (symmetryType === 'T-B') {
          fixedX = Math.floor(Math.random() * columns);
          fixedY = Math.floor(Math.random() * halfRows);
        } else if (symmetryType === 'B-T') {
          fixedX = Math.floor(Math.random() * columns);
          fixedY = halfRows + Math.floor(Math.random() * (rows - halfRows));
        } else if (symmetryType === 'R-L') {
          fixedX = halfCols + Math.floor(Math.random() * (columns - halfCols));
          fixedY = Math.floor(Math.random() * rows);
        } else if (symmetryType === 'QUADRANT' || symmetryType === 'FOUR_WAY') {
          fixedX = Math.floor(Math.random() * halfCols);
          fixedY = Math.floor(Math.random() * halfRows); // Top-Left Quadrant
        } else if (symmetryType === 'DIAGONAL') {
          // Fixed in Bottom-Left triangle (X < Y)
          fixedY = Math.floor(Math.random() * rows);
          fixedX = Math.floor(Math.random() * fixedY);
        } else { // Default: L-R
          fixedX = Math.floor(Math.random() * halfCols);
          fixedY = Math.floor(Math.random() * rows);
        }
        safety++;
      } while (usedPositions.has(`${fixedX},${fixedY}`) && safety < 100);
      usedPositions.add(`${fixedX},${fixedY}`);

      var color = availableColors[Math.floor(Math.random() * availableColors.length)];
      levelData.push({ POS: { X: fixedX, Y: fixedY }, Type: "Rectangle", Color: color, DRAGGABLE: false });

      // --- 2. CALCULATE MIRROR TARGETS (SOLUTIONS) ---
      var mirrorTargets = [];

      if (symmetryType === 'T-B' || symmetryType === 'B-T') {
        mirrorTargets.push({ X: fixedX, Y: (rows - 1) - fixedY }); // Mirror Y
      } else if (symmetryType === 'QUADRANT') {
        mirrorTargets.push({ X: (columns - 1) - fixedX, Y: (rows - 1) - fixedY }); // Opposite Corner
      } else if (symmetryType === 'DIAGONAL') {
        mirrorTargets.push({ X: fixedY, Y: fixedX }); // Swap X and Y
      } else if (symmetryType === 'FOUR_WAY') {
        mirrorTargets.push({ X: (columns - 1) - fixedX, Y: fixedY });             // Top-Right
        mirrorTargets.push({ X: fixedX, Y: (rows - 1) - fixedY });                // Bottom-Left
        mirrorTargets.push({ X: (columns - 1) - fixedX, Y: (rows - 1) - fixedY }); // Bottom-Right
      } else { // L-R and R-L
        mirrorTargets.push({ X: (columns - 1) - fixedX, Y: fixedY }); // Mirror X
      }

      for (var target of mirrorTargets) {
        solutionData.push({ POS: { X: target.X, Y: target.Y }, Type: "Rectangle", Color: color });
      }

      // --- 3. SPAWN DRAGGABLE ITEMS ---
      for (var target of mirrorTargets) {
        var dragX, dragY;
        safety = 0;
        do {
          if (symmetryType === 'T-B') {
            dragX = Math.floor(Math.random() * columns);
            dragY = halfRows + Math.floor(Math.random() * (rows - halfRows)); // Bottom half
          } else if (symmetryType === 'B-T') {
            dragX = Math.floor(Math.random() * columns);
            dragY = Math.floor(Math.random() * halfRows); // Top half
          } else if (symmetryType === 'R-L') {
            dragX = Math.floor(Math.random() * halfCols); // Left half
            dragY = Math.floor(Math.random() * rows);
          } else if (symmetryType === 'QUADRANT') {
            dragX = halfCols + Math.floor(Math.random() * (columns - halfCols)); // Bottom-Right
            dragY = halfRows + Math.floor(Math.random() * (rows - halfRows));
          } else if (symmetryType === 'DIAGONAL') {
            dragY = Math.floor(Math.random() * rows);
            dragX = dragY + 1 + Math.floor(Math.random() * (columns - dragY - 1)); // Top-Right triangle
            if (dragX >= columns) dragX = columns - 1;
          } else if (symmetryType === 'FOUR_WAY') {
            // Random quadrant except Top-Left
            var quad = Math.floor(Math.random() * 3);
            dragX = (quad === 0 || quad === 2) ? halfCols + Math.floor(Math.random() * (columns - halfCols)) : Math.floor(Math.random() * halfCols);
            dragY = (quad === 1 || quad === 2) ? halfRows + Math.floor(Math.random() * (rows - halfRows)) : Math.floor(Math.random() * halfRows);
          } else { // L-R
            dragX = halfCols + Math.floor(Math.random() * (columns - halfCols)); // Right half
            dragY = Math.floor(Math.random() * rows);
          }
          safety++;
        } while (usedPositions.has(`${dragX},${dragY}`) && safety < 100);

        usedPositions.add(`${dragX},${dragY}`);
        levelData.push({ POS: { X: dragX, Y: dragY }, Type: "Rectangle", Color: color, DRAGGABLE: true });
      }
    }

    levelData.sort((a, b) => {
      if (a.POS.X === b.POS.X) return a.POS.Y - b.POS.Y;
      return a.POS.X - b.POS.X;
    });

    solutionData.sort((a, b) => {
      if (a.POS.X === b.POS.X) return a.POS.Y - b.POS.Y;
      return a.POS.X - b.POS.X;
    });

    return { GRIDCONFIG: difficultyConfig, LEVEL: levelData, SOLUTION: solutionData };
  }
  constructGrid(isProcedural = false) {
    var _gridConfig, _level, _solution;

    if (isProcedural) {
      // --- NEW PROCEDURAL LOGIC ---
      const baseConfig = this.configMaker(this.level, this.stage);

      const generatedData = this.generateProceduralLevel(baseConfig);
      _gridConfig = generatedData.GRIDCONFIG;
      _level = generatedData.LEVEL;
      _solution = generatedData.SOLUTION;

    } else {
      // --- YOUR EXISTING LOGIC ---
      _gridConfig = GameLevels.Easy[0].GRIDCONFIG;
      _level = GameLevels.Easy[0].LEVEL;
      _solution = GameLevels.Easy[0].SOLUTION;
    }
    this.levelSolution = _solution;

    this.grid = new EntityGrid(this, 100, 300, _gridConfig);
    var currentEntity = 0;
    var currentCorrectSocket = 0;

    for (var i = 0; i < _gridConfig.columns; i++) {
      for (var j = 0; j < _gridConfig.rows; j++) {
        //Construct Grid as Usual
        var cell = new Entity(this, 0, 0, '__WHITE');
        cell.setTint(0xffffff);
        cell.alpha = 0.01;
        var socket = cell.addComponent(SocketComponent, "Socket " + i + "," + j);
        this.grid.addEntityAt(i, j, cell);

        console.log(i + "," + j);
        //Adding Entities
        if (currentEntity < _level.length) {
          if (_level[currentEntity].POS.X == i && _level[currentEntity].POS.Y == j) {
            //Draggable Object
            if (_level[currentEntity].DRAGGABLE) {
              var box = new Entity(this, 0, 0, '__WHITE');
              box.setTint(_level[currentEntity].Color);
              box.setDisplaySize(this.grid.cellWidth * 0.75, this.grid.cellHeight * 0.75);
              box.setDepth(100);
              var drag = box.addComponent(DraggableComponent);
              var data = box.addComponent(DraggableDataComponent, _level[currentEntity])

              socket.attach(box);
              drag.currentSocket = socket;
              data.socket = socket;
            }
            //Mirror Solution
            else {
              var lockedCell = this.grid.getEntityAt(i, j);
              var lockedSocket = lockedCell.getComponent(SocketComponent);
              var blocker = new Entity(this, 0, 0, '__WHITE');

              blocker.setTint(_level[currentEntity].Color);
              blocker.alpha = 0.5;
              blocker.setDisplaySize(this.grid.cellWidth * 0.75, this.grid.cellHeight * 0.75);
              blocker.setDepth(100);

              blocker.addComponent(NonDraggableComponent, lockedSocket);
            }
            currentEntity++;
            console.log("Current Entity " + currentEntity);
            console.log("Add Entity To " + i + "," + j);
          }
        }
        if (currentCorrectSocket < _solution.length) {
          if (_solution[currentCorrectSocket].POS.X == i && _solution[currentCorrectSocket].POS.Y == j) {
            cell.addComponent(SolutionSocketComponent, _solution[currentCorrectSocket]);
            currentCorrectSocket++;
            console.log("Current Correct Socket " + currentCorrectSocket);
            console.log("Set As Solution To " + i + "," + j);
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
        // 1. Lock the grid size to 4x4
        config.columns = 4;
        config.rows = 4;

        // 2. Item Progression: Starts at 3, goes up every 2 levels, maxes at 5
        config.itemCount = Math.min(5, 3 + Math.floor((_Level - 1) / 2));

        // 3. Keep symmetry simple for Easy mode (Vertical or Horizontal only)
        const easyModes = ['L-R', 'T-B'];
        config.symmetryType = easyModes[Math.floor(Math.random() * easyModes.length)];
        break;
      case Difficulty.NORMAL:
        // 1. Grid Size Alternation (Odd levels = 4x4, Even levels = 6x6)
        if (_Level % 2 !== 0) {
          config.columns = 4;
          config.rows = 4;
        } else {
          config.columns = 6;
          config.rows = 6;
        }

        // 2. Item Progression: Starts at 3, goes up every 2 levels, absolute max of 8
        config.itemCount = Math.min(8, 3 + Math.floor((_Level - 1) / 2));

        // 3. Symmetry Mode Progression
        var normalModes = ['L-R', 'T-B']; // Default for Levels 1 & 2

        if (_Level >= 5) {
          // At Level 5+, all Normal modes are unlocked
          normalModes = ['L-R', 'T-B', 'R-L', 'B-T', 'QUADRANT'];
        } else if (_Level >= 3) {
          // At Level 3 & 4, add the reverse directional modes
          normalModes = ['L-R', 'T-B', 'R-L', 'B-T'];
        }

        config.symmetryType = normalModes[Math.floor(Math.random() * normalModes.length)];

        // 4. Anti-Softlock Safety Cap 
        // Ensures the item count NEVER exceeds the available cells in the Fixed Zone
        var maxSafeItems = 8; // Fallback default

        if (config.symmetryType === 'QUADRANT') {
          // Quadrant fixed zones are a quarter of the board (2x2=4 or 3x3=9)
          maxSafeItems = (config.columns === 4) ? 4 : 9;
        } else {
          // Half-board fixed zones (L-R, T-B) are half of the board (2x4=8 or 3x6=18)
          maxSafeItems = (config.columns === 4) ? 8 : 18;
        }

        config.itemCount = Math.min(config.itemCount, maxSafeItems);

        break;
      case Difficulty.HARD:
        // --- 1. Grid Size Progression (Adding 8x6) ---
        if (_Level >= 7) {
          // Cycle through 4x4, 6x6, and 8x6
          const cycle = _Level % 3;
          if (cycle === 1) { config.columns = 4; config.rows = 4; }
          else if (cycle === 2) { config.columns = 6; config.rows = 6; }
          else { config.columns = 8; config.rows = 6; } // 8x6 Grid
        } else {
          // Follow Normal mode pattern before level 7
          if (_Level % 2 !== 0) { config.columns = 4; config.rows = 4; }
          else { config.columns = 6; config.rows = 6; }
        }

        // --- 2. Item Progression ---
        config.itemCount = Math.min(8, 3 + Math.floor((_Level - 1) / 2));

        // --- 3. Symmetry Mode Progression ---
        var hardModes = ['L-R', 'T-B'];

        if (_Level >= 9) {
          hardModes = ['L-R', 'T-B', 'R-L', 'B-T', 'QUADRANT', 'FOUR_WAY', 'DIAGONAL'];
        } else if (_Level >= 7) {
          hardModes = ['L-R', 'T-B', 'R-L', 'B-T', 'QUADRANT', 'FOUR_WAY'];
        } else if (_Level >= 5) {
          hardModes = ['L-R', 'T-B', 'R-L', 'B-T', 'QUADRANT'];
        } else if (_Level >= 3) {
          hardModes = ['L-R', 'T-B', 'R-L', 'B-T'];
        }

        // Filter out perfect-square-only modes if the grid is 8x6
        const isPerfectSquare = (config.columns === config.rows);
        if (!isPerfectSquare) {
          hardModes = hardModes.filter(mode => mode !== 'FOUR_WAY' && mode !== 'DIAGONAL');
        }

        config.symmetryType = hardModes[Math.floor(Math.random() * hardModes.length)];

        // --- 4. Dynamic Anti-Softlock Safety Cap ---
        var maxSafeItems = 8;

        if (config.symmetryType === 'QUADRANT' || config.symmetryType === 'FOUR_WAY') {
          // Fixed zone is exactly 1/4th of the board
          maxSafeItems = Math.floor((config.columns * config.rows) / 4);
        } else if (config.symmetryType === 'DIAGONAL') {
          // Fixed zone is the bottom triangle (Total cells minus the center diagonal line, divided by 2)
          maxSafeItems = Math.floor(((config.columns * config.rows) - config.columns) / 2);
        } else {
          // Fixed zone is exactly half the board (L-R, R-L, T-B, B-T)
          maxSafeItems = Math.floor((config.columns * config.rows) / 2);
        }

        config.itemCount = Math.min(config.itemCount, maxSafeItems);
        break;
    }
    return config;
  }
  constructTestGrid() {
    const _gridConfig = {
      width: 900,
      height: 900,
      columns: 12,
      rows: 12,
      padding: 0
    }

    this.grid = new EntityGrid(this, 100, 300, _gridConfig);

    for (var i = 0; i < _gridConfig.columns; i++) {
      for (var j = 0; j < _gridConfig.rows; j++) {
        var cell = new Entity(this, 0, 0, '__WHITE');
        cell.setTint(0xffffff);
        var socket = cell.addComponent(SocketComponent, "Socket " + i + "," + j);
        this.grid.addEntityAt(i, j, cell);
        if (i == j) {
          var box = new Entity(this, 0, 0, '__WHITE');
          box.setTint(0x000000);
          box.setDisplaySize(this.grid.cellWidth, this.grid.cellHeight);
          box.setDepth(100);
          var drag = box.addComponent(DraggableComponent);

          socket.attach(box);
          drag.currentSocket = socket;
        }
        else if (i == 0 || j == 0) {
          var lockedCell = this.grid.getEntityAt(i, j);
          var lockedSocket = lockedCell.getComponent(SocketComponent);
          var blocker = new Entity(this, 0, 0, '__WHITE');

          blocker.setTint(0xff0000);
          blocker.setDisplaySize(this.grid.cellWidth, this.grid.cellHeight);
          blocker.setDepth(100);

          blocker.addComponent(NonDraggableComponent, lockedSocket);
        }
      }
    }

    this.grid.sort('depth');
  }
  checkIfAllSocketIsFilledCorrectly() {
    const _solution = this.levelSolution;

    for (var i = 0; i < _solution.length; i++) {
      var currentSocket = this.grid.getEntityAt(_solution[i].POS.X, _solution[i].POS.Y);
      var currentSolutionSocket = currentSocket.getComponent(SolutionSocketComponent);
      if (currentSocket.getComponent(SocketComponent).occupant == null) {
        console.log("Noone in socket " + "(" + _solution[i].POS.X + "," + _solution[i].POS.Y + ")");
        return false;
      }
      var currentEntity = currentSocket.getComponent(SocketComponent).occupant;
      var currentEntityData = currentEntity.getComponent(DraggableDataComponent);
      console.log(i);
      console.log(_solution[i].POS.X + "," + _solution[i].POS.Y)
      console.log(currentSolutionSocket);
      if (currentSolutionSocket.checkEntity(currentEntityData) == false) {
        console.log("Not in correct socket");
        return false;
      }
      console.log(_solution[i].POS.X + "," + _solution[i].POS.Y + " is correct");
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