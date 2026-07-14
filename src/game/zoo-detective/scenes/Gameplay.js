import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";
import { AnimalIconTray, InlineContentLayout, ShadowRoundedPanel, SquareGridLayout } from "../../../util/layout/index.js";
import Theme from "../../../util/game-theme.js";
import HintLineViewer from "../components/scripts/hint-line-viewer.js";
import RandomPuzzle from "../components/scripts/random-puzzle.js";
import { AnimalIconAssets, DefaultAnimals, GameplayConfig, LevelMap, PuzzleLevelConfig } from "../constants.js";
import {Config} from "../../zoo-detective/constants.js";
import DateTimeTimer from "../../../util/datetime-timer.js";
import { EventBus } from "../../../core/EventBus.js";
import DragDropManager from "../../../core/drag-drop-manager.js";
import ReplayLogBuffer from "../../../core/replay-log-buffer.js";
import { GlobalReplayEvent } from "../../../core/replay-event.js";
import game_db from "/src/util/minigame-db-util.js";
import SessionStorageManager from "../../../core/session-storage-manager.js";
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";

// Board < animals < tray. Every animal lives on the placement layer, which is lifted to DRAGGING_DEPTH
// while one is being dragged so it clears the bottom bar instead of vanishing behind it.
const BOARD_DEPTH = 3;
const PLACEMENT_LAYER_DEPTH = 4;
const TRAY_DEPTH = 5;
const DRAGGING_DEPTH = 20;

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super("gameplay-scene");
        this.level = 1;
        this.allScore = 0;
        this.roundScore = 0;
        this.puzzleData = null;
        this.puzzleGenerator = null;
        this.sceneData = {};
        this.frameGraphics = null;
        this.headerElements = [];
        this.hintViewer = null;
        this.animalTray = null;
        this.gridBoard = null;
        this.gridShadowGraphics = null;
        this.answerButtonBounds = null;
        this.round = 0;
        // US-E9-03: animals are dragged from the tray onto a cell (no tap-to-place), reusing the
        // shared DragDropManager that Context Clues uses.
        this.dragDrop = null;
        this.dropZoneObjects = [];
        // A placed animal leaves the tray and lives on its own layer, where it stays draggable so a
        // wrong guess can be dragged to another cell — until its hint comes true and it locks.
        this.placementLayer = null;
        // One game object per animal for the whole round — dragged out of the tray and around the
        // board, parked invisibly on its tray slot whenever it is not on the grid.
        this.animalVisuals = new Map();
        this.traySlotPositions = new Map();
        this.trayViewsByAnimalId = new Map();
        this.currentHintIndex = 0;
        this.currentPlacements = [];
        this.lockedCellIndexes = new Set();
        this.lockedAnimalIds = new Set();
        this.onPuzzleCompleted = null;
        this.onPlacementEvaluated = null;
        this.puzzleTimer = new DateTimeTimer();
        this.timeLimitMs = Config.TimeLimitMs;
        this.isGameEnded = false;
        this.timeExpired = false;
    }

    preload() {
        // rexUI is loaded via main.js global config
        this.load.image('context-clues-bg','assets/zoo-detective/etc/BG.png')
        this.load.image("button-idle", "assets/button_rectangle_depth_flat.png");
        this.load.image("button-press", "assets/button_rectangle_flat.png");

        for (const asset of Object.values(AnimalIconAssets)) {
            this.load.image(asset.texture, asset.path);
        }
    }

    init(data) {
        this.sceneData = { ...data };
        this.level = (data.level ?? Number(SessionStorageManager.get("selected_game_level"))) || 1;
        this.levelMap = LevelMap[this.level] ?? "easy";
        this.puzzleData = null;
        this.round = 0;
        this.allScore = 0;
        this.timeLimitMs = data.timeLimitMs ?? Config.TimeLimitMs;
        this.isGameEnded = false;
        this.timeExpired = false;
        this.onPlacementEvaluated = data.onPlacementEvaluated ?? null;
        this.replayLog = new ReplayLogBuffer();
    }

    create(data) {
        EventBus.emit('minigame:show-hud');

        // DragDropManager hooks scene input; without this it would keep those listeners across a
        // scene restart and the next round would fire every handler twice.
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardownDragDrop());

        this.createSceneBackdrop();

        this.resetGameTimer();
        this.onCloseTutorial = () => {
            this.startGameTimer();
        };

        const skipTutorial = this.sceneData.skipTutorial === true;

        this.gameplayUI = new GameplayUI(this, 0, 0, {
            showTutorial: !skipTutorial
        });
        this.gameplayUI.setLevel(this.levelMap, this.level, 1, 1);
        this.gameplayUI.setScore(this.allScore);
        this.gameplayUI.setTimeLeft(Math.ceil(this.timeLimitMs / 1000));

        // Hide old Phaser UI elements
        this.gameplayUI.uiBackground.setVisible(false);
        this.gameplayUI.currentScore.setVisible(false);

        // Initial state to HUD
        EventBus.emit('minigame:score', { score: this.allScore });
        EventBus.emit('minigame:level', { level: 'ด่าน 1' });
        EventBus.emit('minigame:tick', { timeLeft: Math.ceil(this.timeLimitMs / 1000) });

        this.gameStartedAt = new Date();
        this.replayLog.addCorrectEvent(GlobalReplayEvent.ROUND_START, true);
        this.gameEndedAt = new Date();

        this.onPuzzleCompleted = (result = {})=>{
            if (this.isGameEnded) {
                return;
            }

            this.round++;
            const nextRoundDisplay = this.round + 1;

            this.gameplayUI.setLevel(this.levelMap, this.level, nextRoundDisplay, nextRoundDisplay);
            EventBus.emit('minigame:level', { level: `ด่าน ${nextRoundDisplay}` });

            console.log(`allScore : ${this.allScore}`);
            console.log(`elapsedTimeMs : ${result.elapsedTimeMs ?? 0}`);

            showLevelCompleteEffect();

            this.time.delayedCall(1500, () => {
                if (this.isGameEnded) {
                    return;
                }

                if (this.timeExpired) {
                    this.endGame("failure");
                } else {
                    this.loadNextPuzzle();
                }
            });
        };

        this.onPlacementEvaluated = (callback = {})=>{

            const isReplacingSameCell = callback.previousCellIndex >= 0 && callback.previousCellIndex === callback.cellIndex;
            const cell = this.gridBoard?.getCell(callback.cellIndex);
            const cellPosition = cell ? {
                x: this.gridBoard.x + cell.x + cell.size / 2,
                y: this.gridBoard.y + cell.y + 32,
            } : null;

            if (!callback.isCorrect && !isReplacingSameCell) {
                EventBus.emit('audio:play', 'zoo-detective:wrong');
                if (cell) {
                    this.flashCellErrorBorder(cell);
                }
            } else if (callback.isCorrect) {
                this.increaseScore(Config.IncreaseScore[this.levelMap], cellPosition);
                EventBus.emit('audio:play', 'zoo-detective:correct');
            }

            this.replayLog.addAnswerEvent(GlobalReplayEvent.ANSWER_SUBMITTED, {
                cellIndex: callback.cellIndex,
                animal: callback.animal,
                previousCellIndex: callback.previousCellIndex,
                currentHintIndex: callback.currentHintIndex,
                currentHint: callback.currentHint,
            }, Boolean(callback.isCorrect));
        };

        this.loadNextPuzzle();

        if (skipTutorial) {
            this.startGameTimer();
        }
    }

    createPuzzleData(data) {
        const animalChoices = data.animalChoices ?? DefaultAnimals;
        const levelConfig = data.levelConfig ?? PuzzleLevelConfig;
        this.puzzleGenerator = new RandomPuzzle(this.level, levelConfig, animalChoices);

        return this.puzzleGenerator.getPuzzle();
    }

    resolveLayoutConfig(data) {
        const puzzle = this.puzzleData ?? this.createPuzzleData(data);

        return {
            rows: data.gridRows ?? puzzle.rows,
            columns: data.gridColumns ?? puzzle.columns,
            prompt: data.prompt,
            stageLabel: data.stageLabel ?? GameplayConfig.stageLabel,
            stageValue: data.stageValue ?? this.level
        };
    }

    loadNextPuzzle() {
        this.puzzleData = this.createPuzzleData(this.sceneData);
        this.renderPuzzle();
        this.currentHintIndex = 0;
        this.syncHintViewer();
    }

    update() {
        if (!this.gameplayUI) {
            return;
        }

        const elapsedMs = this.puzzleTimer.getElapsedMilliseconds();
        const timeLeftS = Math.ceil((this.timeLimitMs - elapsedMs) / 1000);
        this.gameplayUI.setTimeLeft(Math.max(0, timeLeftS));
        EventBus.emit('minigame:tick', { timeLeft: Math.max(0, timeLeftS) });

        if (!this.isGameEnded && !this.timeExpired && elapsedMs >= this.timeLimitMs) {
            this.timeExpired = true;
        }

    }

    startGameTimer(){
        this.puzzleTimer.start();
    }

    resetGameTimer(){
        this.puzzleTimer.reset();
    }

    endGame(resultStatus = "success") {
        if (this.isGameEnded) {
            return;
        }

        this.isGameEnded = true;
        if (resultStatus === "failure" && this.puzzleTimer.getStartedAt()) {
            const timeoutStopAt = new Date(this.puzzleTimer.getStartedAt().getTime() + this.timeLimitMs);
            this.puzzleTimer.stop(timeoutStopAt);
        } else {
            this.puzzleTimer.stop();
        }

        this.gameEndedAt = new Date();

        const elapsedMs = this.puzzleTimer.getElapsedMilliseconds();
        const timeLeftS = Math.ceil((this.timeLimitMs - elapsedMs) / 1000);
        this.gameplayUI?.setTimeLeft(Math.max(0, timeLeftS));
        this.gameplayUI?.setScore(this.allScore);
        this.gameplayUI?.showGameOverPanel(this.allScore, resultStatus);
        
        EventBus.emit('audio:play', 'zoo-detective:endgame');
        EventBus.emit('minigame:game-over', { 
            score: this.allScore,
            level: this.level,
            resultImage: 'assets/common/result/result_zoo_detective.png',
        });

        //Save game data to database
        game_db.pushGameData(this.allScore, this.level, this.gameStartedAt, this.gameEndedAt).then(() => {
            console.log("Game data saved to database.");
        }).catch((error) => {
            console.error("Failed to save game data:", error);
        });

        this.replayLog.addCorrectEvent(GlobalReplayEvent.ROUND_COMPLETED, resultStatus === "success");
        this.replayLog.pushToDatabase().then(r => {console.log("Push data to database.");});
    }

    renderPuzzle() {
        const sceneWidth = this.scale.width;
        const sceneHeight = this.scale.height;
        const layoutConfig = this.resolveLayoutConfig(this.sceneData);
        const animals = this.puzzleData.availableAnimals;

        this.currentHintIndex = 0;
        this.currentPlacements = Array(this.puzzleData.totalSlots).fill(null);
        this.lockedCellIndexes.clear();
        this.lockedAnimalIds.clear();

        this.teardownDragDrop();

        this.frameGraphics?.destroy();
        this.headerElements.forEach((element) => element.destroy());
        this.headerElements = [];
        this.hintViewer?.destroy();
        this.hintViewer = null;
        this.animalTray?.destroy();
        this.gridBoard?.destroy();
        this.gridShadowGraphics?.destroy();
        this.gridShadowGraphics = null;

        // overlapDrop (US-E7-23): a drop lands if the dragged animal's box merely overlaps a cell,
        // so no pixel-perfect aim is needed — the point of the change for elderly players.
        this.dragDrop = new DragDropManager(this, { overlapDrop: true });

        this.frameGraphics = this.createFrame(sceneWidth, sceneHeight - 102);
        const headerMetrics = this.createHeader(layoutConfig, this.sceneData);
        const answerItemsPerRow = this.sceneData.maxAnimalsPerRow ?? 5;
        const answerItemGap = Config.ItemGapSize[this.levelMap];
        const answerTrayPadding = { top: 36, right: 25, bottom: 25, left: 25 };
        const answerTrayWidth = sceneWidth;
        const answerItemSize = Math.max(
            Config.GridSize[this.levelMap],
            Math.min(
                100,
                Math.floor(
                    (
                        answerTrayWidth
                        - answerTrayPadding.left
                        - answerTrayPadding.right
                        - ((answerItemsPerRow - 1) * answerItemGap)
                    ) / answerItemsPerRow
                )
            )
        );

        // The tray's own highlight is kept purely as "picked up" feedback while dragging — it no
        // longer selects an animal for placement, because placement is now drag-only (US-E9-03).
        this.animalTray = new AnimalIconTray(this, 0, -15,
            () => {},
            () => {},
            {
                width: answerTrayWidth,
                maxItemsPerRow: answerItemsPerRow,
                itemWidth: answerItemSize,
                itemHeight: answerItemSize,
                itemGap: answerItemGap,
                rowGap: 24,
                padding: answerTrayPadding,
                itemTextStyle: {
                    fontFamily: '"Noto Color Emoji", "Segoe UI Emoji", sans-serif',
                    fontSize: `${Math.floor(answerItemSize * 0.72)}px`
                },
                createItemContent: (scene, animal, index, bounds) => this.createAnimalVisual(
                    animal,
                    Math.floor(Math.min(bounds.width, bounds.height) * 0.9)
                ),
                trayRadius: 32,
                trayFillColor: Theme.colors.surfaceContainer,
                trayFillAlpha: 0.96,
                trayStrokeAlpha: 0,
                trayStrokeWidth: 0,
                itemRadius: 32,
                itemSelectedFillColor: Theme.colors.warmSurfaceContainer,
                itemUnSelectedFillColor: Theme.colors.warmTrayItem,
                itemStrokeAlpha: 0,
                itemStrokeWidth: 0,
                footerReservedHeight: this.sceneData.answerButtonHeight ?? 0,
                footerOffset: this.sceneData.answerButtonOffset ?? 12,
                items: animals
            });
        this.animalTray.setPosition(0, sceneHeight - this.animalTray.height);
        this.animalTray.setDepth(TRAY_DEPTH);

        const boardTop = headerMetrics.bottom + 42;
        const boardBottom = this.animalTray.y - 52;
        const boardWidth = Math.min(sceneWidth - 156, 944);
        const availableBoardHeight = Math.max(1, boardBottom - boardTop);
        const proportionalBoardHeight = Math.ceil(boardWidth * (layoutConfig.rows / layoutConfig.columns));
        const boardHeight = Math.min(availableBoardHeight, proportionalBoardHeight);
        const boardX = (sceneWidth - boardWidth) / 2;

        this.gridBoard = new SquareGridLayout(this, boardX, boardTop, {
            rows: layoutConfig.rows,
            columns: layoutConfig.columns,
            width: boardWidth,
            height: boardHeight,
            gap: Config.SlotGapSize[this.levelMap],
            padding: 4,
            cellRadius: 42,
            cellFillColor: Theme.colors.warmSurface,
            cellStrokeColor: Theme.colors.warmAccent,
            cellStrokeWidth: 7
        });
        this.createGridCellShadows();
        this.gridBoard.setDepth(BOARD_DEPTH);

        // Above the board so a placed animal is never drawn behind a neighbouring cell, below the
        // tray so an animal being dragged out of the tray passes over the ones already placed.
        this.placementLayer = this.add.container(0, 0);
        this.placementLayer.setDepth(PLACEMENT_LAYER_DEPTH);

        this.setupCellDropZones();
        this.setupTrayDropZone();
        this.setupAnimalDragSources(animals);

        this.answerButtonBounds = this.animalTray.getFooterBounds(true);
    }

    // The tray itself takes drops, so a player who changes their mind can pull an animal back off the
    // board and into its old slot. Only a placed, not-yet-locked animal qualifies — dropping a tray
    // animal back on the tray is a no-op, and a locked one cannot leave its cell at all.
    setupTrayDropZone() {
        const zone = this.add.zone(
            this.animalTray.x + (this.animalTray.width / 2),
            this.animalTray.y + (this.animalTray.height / 2),
            this.animalTray.width,
            this.animalTray.height
        );

        this.dropZoneObjects.push(zone);

        this.dragDrop.registerDropZone({
            zone,
            id: "tray",
            accepts: ({ data }) => (
                this.isAnimalPlaced(data.animal.id)
                && !this.lockedAnimalIds.has(data.animal.id)
            ),
            // Safe to run inline: the animal object is only parked, never destroyed, so we are not
            // pulling the game object out from under Phaser while it is still dragging it.
            onDrop: ({ data }) => this.removeAnimalFromBoard(data.animal.id)
        });
    }

    removeAnimalFromBoard(animalId) {
        const cellIndex = this.findPlacementIndexByAnimalId(animalId);

        if (cellIndex >= 0) {
            this.clearCellPlacement(cellIndex);
        }

        this.parkAnimalInTray(animalId);
        this.evaluateHintProgression();
    }

    // Each cell gets a real Zone rather than making the cell Container interactive: a Zone carries an
    // explicit width/height, so both Phaser's pointer hit test and DragDropManager's overlap check
    // (which relies on getBounds) match the cell the player actually sees.
    setupCellDropZones() {
        for (const cell of this.gridBoard.getCells()) {
            const zone = this.add.zone(
                this.gridBoard.x + cell.centerX,
                this.gridBoard.y + cell.centerY,
                cell.size,
                cell.size
            );

            this.dropZoneObjects.push(zone);

            this.dragDrop.registerDropZone({
                zone,
                id: `cell-${cell.index}`,
                accepts: () => !this.lockedCellIndexes.has(cell.index),
                onDrop: ({ data }) => this.placeAnimalInCell(cell, data.animal),
                onDragEnter: () => this.setCellState(cell, "hover"),
                onDragLeave: () => this.restoreCellState(cell)
            });
        }
    }

    // Every animal gets exactly ONE game object, built at grid-cell size and living on the placement
    // layer for the whole round. It is what the player drags in both directions — out of the tray and
    // around the board — so the thing under the finger is always the same object at the same size,
    // never a stand-in that gets swapped for a different one on drop.
    //
    // While the animal is in the tray that object sits invisible on its slot, and the tray's own card
    // is what you see. Grabbing the card hands the drag straight to the object: the card disappears,
    // the animal appears, and it is already the size it will be in the cell.
    setupAnimalDragSources(animals) {
        this.trayViewsByAnimalId.clear();
        this.traySlotPositions.clear();

        const cellSize = this.gridBoard.getCells()[0]?.size ?? 0;
        const iconSize = Math.floor(cellSize * 0.7);
        const { itemWidth, itemHeight } = this.animalTray.options;

        for (const itemView of this.animalTray.getItemViews()) {
            const animal = animals.find((candidate) => candidate.id === itemView.item.id) ?? itemView.item;
            const slot = {
                x: this.animalTray.x + itemView.container.x,
                y: this.animalTray.y + itemView.container.y
            };

            this.trayViewsByAnimalId.set(animal.id, itemView);
            this.traySlotPositions.set(animal.id, slot);

            const visual = this.createAnimalVisual(animal, iconSize);
            visual.setPosition(slot.x, slot.y);
            visual.setVisible(false);
            this.placementLayer.add(visual);
            this.animalVisuals.set(animal.id, visual);

            // Grab from the tray. The card is the handle; the animal object is what actually moves.
            // Because the object is parked exactly on the slot the handle occupies, DragDropManager's
            // handle→target offset resolves to the tray's own origin and the animal tracks the pointer.
            this.dragDrop.registerDraggable({
                handle: itemView.container,
                target: visual,
                data: { animal },
                returnOnMiss: false,
                snapOnDrop: true,
                // The tray card's art is centred on its container, so the grab area must be too.
                interactiveConfig: {
                    hitArea: new Phaser.Geom.Rectangle(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight),
                    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                    draggable: true
                },
                onDragStart: () => {
                    this.hideTrayItem(animal.id);
                    visual.setVisible(true);
                    this.liftPlacementLayer(visual);
                },
                onDragEnd: () => {
                    this.placementLayer.setDepth(PLACEMENT_LAYER_DEPTH);

                    // Dropped on nothing: the animal goes back to its slot and the card returns.
                    if (!this.isAnimalPlaced(animal.id)) {
                        this.parkAnimalInTray(animal.id);
                    }

                    this.resetHoverStates();
                }
            });

            // Grab the same object again once it is on the board, to move it between cells or drag it
            // back down to the tray. It is only draggable while placed and not yet locked.
            this.dragDrop.registerDraggable({
                handle: visual,
                target: visual,
                data: { animal },
                returnOnMiss: false,
                snapOnDrop: true,
                onDragStart: () => this.liftPlacementLayer(visual),
                onDragEnd: ({ handle }) => {
                    this.placementLayer.setDepth(PLACEMENT_LAYER_DEPTH);

                    // Dropped on nothing: back to the cell it came from.
                    if (this.isAnimalPlaced(animal.id)) {
                        this.dragDrop.moveHome(handle);
                    }

                    this.resetHoverStates();
                }
            });

            this.input.setDraggable(visual, false);
        }
    }

    // The dragged animal has to clear the bottom bar, or it vanishes behind it on the way down.
    liftPlacementLayer(visual) {
        this.placementLayer.setDepth(DRAGGING_DEPTH);
        this.placementLayer.bringToTop(visual);
    }

    isAnimalPlaced(animalId) {
        return this.findPlacementIndexByAnimalId(animalId) >= 0;
    }

    placeAnimalInCell(cell, animal) {
        if (!animal || this.lockedCellIndexes.has(cell.index)) {
            return;
        }

        const previousCellIndex = this.findPlacementIndexByAnimalId(animal.id);
        const occupyingAnimal = this.currentPlacements[cell.index];

        // Another animal already sits here. Its tray slot is empty, so send it back there rather than
        // leaving it stranded with nowhere to be picked up again.
        if (occupyingAnimal && occupyingAnimal.id !== animal.id) {
            this.currentPlacements[cell.index] = null;
            this.parkAnimalInTray(occupyingAnimal.id);
        }

        if (previousCellIndex >= 0 && previousCellIndex !== cell.index) {
            this.clearCellPlacement(previousCellIndex);
        }

        this.currentPlacements[cell.index] = animal;
        this.showAnimalInCell(cell, animal);
        this.emitPlacementEvaluation(cell.index, animal, previousCellIndex);
        this.evaluateHintProgression();
    }

    showAnimalInCell(cell, animal) {
        const visual = this.animalVisuals.get(animal.id);

        if (!visual) {
            return;
        }

        // The snap tween from the drop is already carrying the animal into the cell, so only its home
        // needs setting — a later miss must return it to this cell, not wherever it came from.
        visual.setVisible(true);
        this.dragDrop.setHome(visual, this.gridBoard.x + cell.centerX, this.gridBoard.y + cell.centerY);
        this.input.setDraggable(visual, true);
        this.hideTrayItem(animal.id);
    }

    // Back to the bottom bar: the animal object goes invisible on its slot and the card reappears.
    // Nothing is destroyed — it is the same object either way, just parked.
    parkAnimalInTray(animalId) {
        const visual = this.animalVisuals.get(animalId);
        const slot = this.traySlotPositions.get(animalId);

        if (visual && slot) {
            // A snap tween may still be flying it toward a drop zone; it would fight setPosition.
            this.tweens.killTweensOf(visual);
            visual.setVisible(false);
            visual.setPosition(slot.x, slot.y);
            this.dragDrop?.setHome(visual, slot.x, slot.y);
            this.input.setDraggable(visual, false);
        }

        const itemView = this.trayViewsByAnimalId.get(animalId);

        if (itemView) {
            itemView.container.setVisible(true);
            itemView.container.setAlpha(1);
            this.input.setDraggable(itemView.container, true);
        }
    }

    // Once an animal is on the board its tray slot empties — it cannot be placed twice.
    hideTrayItem(animalId) {
        const itemView = this.trayViewsByAnimalId.get(animalId);

        if (!itemView) {
            return;
        }

        itemView.container.setVisible(false);
        this.input.setDraggable(itemView.container, false);
    }

    teardownDragDrop() {
        this.dragDrop?.destroy();
        this.dragDrop = null;

        // DragDropManager only unhooks its listeners; these game objects are ours to destroy.
        this.dropZoneObjects.forEach((zone) => zone.destroy());
        this.dropZoneObjects = [];

        this.animalVisuals.forEach((visual) => visual.destroy());
        this.animalVisuals.clear();
        this.traySlotPositions.clear();
        this.trayViewsByAnimalId.clear();

        this.placementLayer?.destroy();
        this.placementLayer = null;
    }

    emitPlacementEvaluation(cellIndex, animal, previousCellIndex = -1) {
        const currentHint = this.puzzleData?.hints?.[this.currentHintIndex] ?? null;
        const isCorrectForCurrentHint = currentHint
            ? this.puzzleGenerator?.isHintSatisfied?.(currentHint, this.currentPlacements) ?? false
            : false;

        this.onPlacementEvaluated?.({
            isCorrect: isCorrectForCurrentHint,
            cellIndex,
            animal,
            previousCellIndex,
            currentHintIndex: this.currentHintIndex,
            currentHint,
            placements: [...this.currentPlacements],
            lockedCellIndexes: [...this.lockedCellIndexes],
            lockedAnimalIds: [...this.lockedAnimalIds],
            puzzleData: this.puzzleData,
            level: this.level,
            scene: this
        });
    }

    findPlacementIndexByAnimalId(animalId) {
        return this.currentPlacements.findIndex((animal) => animal?.id === animalId);
    }

    // Empties the cell's slot. The animal's visual is not touched — it is moving to another cell and
    // the placement layer, not the grid, owns it now.
    clearCellPlacement(cellIndex) {
        const cell = this.gridBoard?.getCell(cellIndex);

        if (!cell) {
            return;
        }

        this.currentPlacements[cellIndex] = null;
        this.setCellState(cell, "default");
    }

    setCellState(cell, state = "default") {
        // locked = the existing green (a hint just came true); the red for a wrong drop is the
        // existing blink in flashCellErrorBorder. hover is the drop-target highlight (US-E9-03).
        const strokeColorMap = {
            default: Theme.colors.warmAccent,
            locked: Theme.colors.primary,
            hover: GameplayConfig.dropTargetStrokeColor
        };
        const fillColorMap = {
            default: Theme.colors.warmSurface,
            locked: Theme.colors.primaryContainer,
            hover: GameplayConfig.dropTargetFillColor
        };

        cell.background.clear();
        cell.background.fillStyle(fillColorMap[state] ?? fillColorMap.default, 1);
        cell.background.lineStyle(7, strokeColorMap[state] ?? strokeColorMap.default, 1);
        cell.background.fillRoundedRect(0, 0, cell.size, cell.size, 42);
        cell.background.strokeRoundedRect(0, 0, cell.size, cell.size, 42);
    }

    // A cell that lit up under the dragged animal goes back to whichever state it actually holds.
    restoreCellState(cell) {
        this.setCellState(cell, this.lockedCellIndexes.has(cell.index) ? "locked" : "default");
    }

    resetHoverStates() {
        for (const cell of this.gridBoard?.getCells() ?? []) {
            this.restoreCellState(cell);
        }
    }

    resetGridStates() {
        for (const cell of this.gridBoard?.getCells() ?? []) {
            this.setCellState(cell, "default");
        }
    }

    applyConfirmedLocks() {
        // Cells no longer carry their own input — a locked cell simply stops accepting drops (see the
        // `accepts` guard in setupCellDropZones). What has to be frozen is the animal sitting on it:
        // a wrong guess stays draggable so it can be moved, but once its hint comes true it is final.
        // An animal parked in the tray is dragged by its card, not by this object, so it stays
        // undraggable until it is actually on the board.
        for (const [animalId, visual] of this.animalVisuals) {
            const canDrag = this.isAnimalPlaced(animalId) && !this.lockedAnimalIds.has(animalId);
            this.input.setDraggable(visual, canDrag);
        }
    }

    createSceneBackdrop() {
        const { width, height } = this.scale;

        // Main background image — assets/context-clues/etc/BG.png, depth -20 (bottommost layer)
        const background = this.add.image(width / 2, height / 2, 'context-clues-bg');
        background.setDisplaySize(width, height);
        background.setDepth(-20);
    }

    evaluateHintProgression() {
        const hints = this.puzzleData?.hints ?? [];
        const confirmedCellIndexes = new Set();
        let nextHintIndex = 0;

        this.resetGridStates();

        while (nextHintIndex < hints.length) {
            const hint = hints[nextHintIndex];
            const isSatisfied = this.puzzleGenerator?.isHintSatisfied?.(hint, this.currentPlacements) ?? false;

            if (!isSatisfied) {
                break;
            }

            for (const cellIndex of this.puzzleGenerator?.getHintRelatedIndexes?.(hint) ?? []) {
                confirmedCellIndexes.add(cellIndex);
            }

            nextHintIndex += 1;
        }

        this.lockedCellIndexes = confirmedCellIndexes;
        this.lockedAnimalIds = new Set(
            [...confirmedCellIndexes]
                .map((cellIndex) => this.currentPlacements[cellIndex]?.id)
                .filter(Boolean)
        );

        for (const cellIndex of confirmedCellIndexes) {
            const confirmedCell = this.gridBoard?.getCell(cellIndex);

            if (confirmedCell) {
                this.setCellState(confirmedCell, "locked");
            }
        }

        this.applyConfirmedLocks();

        this.currentHintIndex = nextHintIndex;
        this.syncHintViewer();

        if (nextHintIndex >= hints.length) {
            this.tryCompletePuzzle();
        }
    }

    syncHintViewer() {
        if (!this.hintViewer) {
            return;
        }

        if (this.currentHintIndex >= (this.puzzleData?.hints?.length ?? 0)) {
            this.hintViewer.reset(-1);
            return;
        }

        this.hintViewer.reset(this.currentHintIndex);
    }

    tryCompletePuzzle() {
        const isComplete = this.currentHintIndex >= (this.puzzleData?.hints?.length ?? 0);

        if (!isComplete) {
            return false;
        }

        this.onPuzzleCompleted?.({
            level: this.level,
            puzzleData: this.puzzleData,
            placements: [...this.currentPlacements],
            lockedCellIndexes: [...this.lockedCellIndexes],
            elapsedTimeMs: this.puzzleTimer.getElapsedMilliseconds()
        });

        return true;
    }

    createFrame(sceneWidth, sceneHeight) {
        return this.add.graphics();
    }

    createHeader(layoutConfig, data) {
        const left = 78;
        const top = 268;
        const chipHeight = 174;
        const right = 78;
        const cardWidth = this.scale.width - left - right;
        const promptX = left;
        const promptHints = this.getPromptHints(data);
        const promptWrapWidth = cardWidth - 92;
        const hintViewerMinHeight = chipHeight;
        const hintPanel = new ShadowRoundedPanel(this, promptX, top, cardWidth, hintViewerMinHeight, {
            origin: [0, 0],
            fillColor: Theme.colors.warmSurfaceContainer,
            strokeWidth: 0,
            radius: 48,
            depth: 2,
            shadows: [
                {
                    offsetY: 15,
                    spread: 2,
                    color: Theme.colors.coolShadow,
                    alpha: 0.2
                },
                {
                    offsetY: 8,
                    color: Theme.colors.warmAccent,
                    alpha: 0.75
                }
            ]
        });

        const hintViewerOptions = {
            width: cardWidth,
            minHeight: hintViewerMinHeight,
            padding: 0,
            radius: 48,
            fillColor: Theme.colors.warmSurfaceContainer,
            fillAlpha: 0,
            strokeColor: Theme.colors.warmSurfaceContainer,
            strokeAlpha: 0,
            strokeWidth: 0,
            emptyText: "",
            textOptions: {
                origin: [0, 0],
                wrapWidth: promptWrapWidth
            },
            contentFactory: (scene, hint, bounds) => this.createHintContent(hint, bounds)
        };

        this.hintViewer = new HintLineViewer(this, promptX, top - 6, promptHints, hintViewerOptions);
        this.hintViewer.setDepth(3);

        const instructionY = top + hintViewerMinHeight + 86;

        const promptText = createThaiText(
            this,
            this.scale.width / 2,
            instructionY,
            `${GameplayConfig.defaultPromptFallback}`,
            {
                fontSize: "36px",
                fontStyle: "bold",
                color: Theme.toCssColor(Theme.colors.warmText)
            },
            { origin: [0.5, 0.5] }
        );
        promptText.setDepth(3);

        this.headerElements = [hintPanel, promptText];

        return {
            bottom: instructionY + (promptText.height / 2)
        };
    }

    createGridCellShadows() {
        this.gridShadowGraphics = this.add.graphics();
        this.gridShadowGraphics.setDepth(2);
        this.gridShadowGraphics.fillStyle(Theme.colors.coolShadow, 0.2);

        for (const cell of this.gridBoard.getCells()) {
            this.gridShadowGraphics.fillRoundedRect(
                this.gridBoard.x + cell.x,
                this.gridBoard.y + cell.y + 18,
                cell.size,
                cell.size,
                42
            );
        }
    }

    getPromptHints(data) {
        if (Array.isArray(data.questionHints)) {
            return [...data.questionHints];
        }

        return [...(this.puzzleData?.hints ?? [])];
    }

    createHintContent(hint, bounds) {
        return new InlineContentLayout(this, 0, 0, this.createHintSegments(hint), {
            width: bounds.width,
            height: bounds.height,
            padding: { left: 32, right: 32 },
            gap: GameplayConfig.hintGap,
            justify: "left",
            align: "center"
        });
    }

    createHintSegments(hint) {
        if (!hint || typeof hint === "string") {
            return [{
                text: hint ?? "",
                style: {
                    fontSize: "48px",
                    color: Theme.toCssColor(Theme.colors.warmText)
                }
            }];
        }

        return [
            this.createHintVisualItem(hint.animal, 190),
            {
                text: hint.animal?.label ?? hint.animal?.id ?? "",
                style: {
                    fontSize: "48px",
                    color: Theme.toCssColor(Theme.colors.warmText)
                }
            },
            {
                create: (scene) => new InlineContentLayout(scene, 0, 0, this.createPositionSegments(hint), {
                    gap: GameplayConfig.hintGap,
                    justify: "center",
                    align: "center"
                })
            }
        ];
    }

    createPositionSegments(hint) {
        const relationText = hint.type === "relation"
            ? GameplayConfig.hintDirection[hint.direction] ?? "อยู่ใกล้"
            : `อยู่${this.formatPositionLabel(hint.position)}`;
        const segments = [{
            text: relationText,
            style: {
                fontSize: "48px",
                color: Theme.toCssColor(Theme.colors.warmHighlight)
            }
        }];

        if (hint.type === "relation" && hint.referenceAnimal) {
            segments.push({
                text: hint.referenceAnimal.label ?? hint.referenceAnimal.id ?? "",
                style: {
                    fontSize: "48px",
                    color: Theme.toCssColor(Theme.colors.warmText)
                }
            });
        }

        return segments;
    }

    createHintVisualItem(animal, size) {
        if (animal?.texture) {
            return {
                texture: animal.texture,
                frame: animal.frame,
                displayWidth: animal.displayWidth ?? size,
                displayHeight: animal.displayHeight ?? size
            };
        }

        return {
            text: animal?.icon ?? "",
            style: {
                fontFamily: '"Noto Color Emoji", "Segoe UI Emoji", sans-serif',
                fontSize: `${size}px`
            }
        };
    }

    createAnimalVisual(animal, size) {
        if (animal?.texture && this.textures.exists(animal.texture)) {
            return this.add.image(0, 0, animal.texture)
                .setDisplaySize(size, size)
                .setOrigin(0.5);
        }

        return this.add.text(0, 0, animal?.icon ?? animal?.label ?? "?", {
            fontFamily: '"Noto Color Emoji", "Segoe UI Emoji", sans-serif',
            fontSize: `${size}px`
        }).setOrigin(0.5);
    }

    formatPositionLabel(position = "") {
        const label = String(position);
        return label.startsWith("ด้าน") ? label : `ด้าน${label}`;
    }

    measureHintViewerHeight(hints, textStyle, wrapWidth) {
        if (!hints.length) {
            return 112;
        }

        let maxMeasuredHeight = 112;

        for (const hint of hints) {
            const measurementText = createThaiText(
                this,
                0,
                0,
                hint,
                textStyle,
                {
                    origin: [0, 0],
                    wrapWidth
                }
            );
            maxMeasuredHeight = Math.max(maxMeasuredHeight, measurementText.height + 48);
            measurementText.destroy();
        }

        return maxMeasuredHeight;
    }

    drawRoundedPanel(x, y, width, height, {
        fillColor,
        fillAlpha = 1,
        strokeColor,
        strokeAlpha = 1,
        strokeWidth = 4,
        radius = 18,
        origin = [0, 0],
        depth = 0
    }) {
        const [originX = 0, originY = 0] = origin;
        const panel = this.add.graphics();

        panel.setPosition(x, y);
        panel.setDepth(depth);

        const drawX = -width * originX;
        const drawY = -height * originY;

        panel.fillStyle(fillColor, fillAlpha);
        panel.lineStyle(strokeWidth, strokeColor, strokeAlpha);
        panel.fillRoundedRect(drawX, drawY, width, height, radius);
        panel.strokeRoundedRect(drawX, drawY, width, height, radius);

        return panel;
    }

    syncScoreUI() {
        const score = Math.max(0, Number(this.allScore) || 0);

        this.allScore = score;
        this.gameplayUI?.setScore(score);
        EventBus.emit('minigame:score', { score });
    }

    increaseScore(score, position = null){
        const gain = Math.max(0, Number(score) || 0);
        if (gain <= 0) {
            return;
        }

        this.allScore += gain;
        this.syncScoreUI();
        this.showScoreGainEffect(gain, position);
    }

    decreaseScore(score){
        const penalty = Math.max(0, Number(score) || 0);
        if (penalty <= 0) {
            return;
        }

        this.allScore = Math.max(0, this.allScore - penalty);
        this.syncScoreUI();
    }

    showScoreGainEffect(score, position = null) {
        const x = position?.x ?? this.scale.width / 2;
        const y = position?.y ?? this.scale.height / 2 - 250;

        const scoreGainText = createThaiText(
            this,
            x,
            y,
            `+${score}`,
            {
                fontSize: "72px",
                fontStyle: "bold",
                color: "#20c66b"
            },
            { origin: 0.5 }
        );
        scoreGainText.setDepth(200);

        this.tweens.add({
            targets: scoreGainText,
            y: scoreGainText.y - 80,
            alpha: 0,
            duration: 1000,
            ease: "Sine.easeOut",
            onComplete: () => {
                scoreGainText.destroy();
            }
        });
    }

    flashCellErrorBorder(cell) {
        const x = this.gridBoard.x + cell.x;
        const y = this.gridBoard.y + cell.y;
        const flash = this.add.graphics();
        flash.setDepth(10);
        flash.lineStyle(8, 0xff0000, 1);
        flash.strokeRoundedRect(x, y, cell.size, cell.size, 42);

        this.tweens.add({
            targets: flash,
            alpha: { from: 1, to: 0 },
            duration: 120,
            yoyo: true,
            repeat: 1,
            ease: 'Linear',
            onComplete: () => flash.destroy()
        });
    }

    createButton(x, y, text, onClick) {
        const container = this.add.container(0, 0);
        const bg = this.add.rectangle(x, y, 200, 60, 0x00aa00, 1).setInteractive({ useHandCursor: true });
        bg.setScale(1.5);
        const label = createThaiText(this, x, y, text, ThaiTextPresets.buttonLabel, { origin: 0.5 });
        label.setScale(1.5);

        bg.on("pointerdown", onClick);

        bg.on("pointerover", () => bg.setFillStyle(0x00ff00));
        bg.on("pointerout", () => bg.setFillStyle(0x00aa00));

        container.add(bg);
        container.add(label);
        return [container, bg, label];
    }
}

