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
import ReplayLogBuffer from "../../../core/replay-log-buffer.js";
import {ZooDetectiveReplayEvent} from "../../../core/replay-event.js";
import game_db from "/src/util/minigame-db-util.js";
import SessionStorageManager from "../../../core/session-storage-manager.js";
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";

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
        this.selectedAnimal = null;
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

            this.replayLog.addAnswerEvent(ZooDetectiveReplayEvent.ANIMAL_PLACED, {
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

        this.replayLog.pushToDatabase().then(r => {console.log("Push data to database.");});
    }

    renderPuzzle() {
        const sceneWidth = this.scale.width;
        const sceneHeight = this.scale.height;
        const layoutConfig = this.resolveLayoutConfig(this.sceneData);
        const animals = this.puzzleData.availableAnimals;

        this.selectedAnimal = null;
        this.currentHintIndex = 0;
        this.currentPlacements = Array(this.puzzleData.totalSlots).fill(null);
        this.lockedCellIndexes.clear();
        this.lockedAnimalIds.clear();

        this.frameGraphics?.destroy();
        this.headerElements.forEach((element) => element.destroy());
        this.headerElements = [];
        this.hintViewer?.destroy();
        this.hintViewer = null;
        this.animalTray?.destroy();
        this.gridBoard?.destroy();
        this.gridShadowGraphics?.destroy();
        this.gridShadowGraphics = null;

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

        this.animalTray = new AnimalIconTray(this, 0, -15,
            (data) => {
                console.log(`selected id: ${data.id}, icon: ${data.icon}, index: ${data.index}`);
                if (this.lockedAnimalIds.has(data.id)) {
                    return;
                }

                this.selectedAnimal = animals.find((animal) => animal.id === data.id) ?? data;
            },
            (data) => {
                console.log(`unselected id: ${data.id}, icon: ${data.icon}, index: ${data.index}`);
                if (this.selectedAnimal?.id === data.id) {
                    this.selectedAnimal = null;
                }
            },
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
        this.animalTray.setDepth(5);

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
        this.gridBoard.setDepth(3);
        this.setupGridInteractions();

        this.answerButtonBounds = this.animalTray.getFooterBounds(true);
    }

    setupGridInteractions() {
        for (const cell of this.gridBoard.getCells()) {
            cell.container.setSize(cell.size, cell.size);
            cell.container.setInteractive(
                new Phaser.Geom.Rectangle(cell.size / 2, cell.size / 2, cell.size, cell.size),
                Phaser.Geom.Rectangle.Contains
            );
            cell.container.on("pointerdown", () => {
                this.handleGridCellClick(cell);
            });
        }
    }

    handleGridCellClick(cell) {
        if (!this.selectedAnimal || this.lockedCellIndexes.has(cell.index)) {
            return;
        }

        const previousCellIndex = this.findPlacementIndexByAnimalId(this.selectedAnimal.id);
        const occupyingAnimal = this.currentPlacements[cell.index];

        if (occupyingAnimal && occupyingAnimal.id !== this.selectedAnimal.id) {
            this.currentPlacements[cell.index] = null;
        }

        if (previousCellIndex >= 0 && previousCellIndex !== cell.index) {
            this.clearCellPlacement(previousCellIndex);
        }

        this.currentPlacements[cell.index] = this.selectedAnimal;
        this.renderAnimalInCell(cell, this.selectedAnimal);
        this.emitPlacementEvaluation(cell.index, this.selectedAnimal, previousCellIndex);
        this.evaluateHintProgression();
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

    clearCellPlacement(cellIndex) {
        const cell = this.gridBoard?.getCell(cellIndex);

        if (!cell) {
            return;
        }

        this.currentPlacements[cellIndex] = null;
        this.gridBoard.clearCell(cellIndex, true);
        this.setCellState(cell, "default");
    }

    renderAnimalInCell(cell, animal) {
        const animalVisual = this.createAnimalVisual(animal, Math.floor(cell.size * 0.7));

        this.gridBoard.clearCell(cell.index, true);
        this.gridBoard.addToCell(cell.index, animalVisual);
    }

    setCellState(cell, state = "default") {
        const strokeColorMap = {
            default: Theme.colors.warmAccent,
            locked: Theme.colors.primary
        };
        const fillColorMap = {
            default: Theme.colors.warmSurface,
            locked: Theme.colors.primaryContainer
        };

        cell.background.clear();
        cell.background.fillStyle(fillColorMap[state] ?? fillColorMap.default, 1);
        cell.background.lineStyle(7, strokeColorMap[state] ?? strokeColorMap.default, 1);
        cell.background.fillRoundedRect(0, 0, cell.size, cell.size, 42);
        cell.background.strokeRoundedRect(0, 0, cell.size, cell.size, 42);
    }

    resetGridStates() {
        for (const cell of this.gridBoard?.getCells() ?? []) {
            this.setCellState(cell, "default");
        }
    }

    applyConfirmedLocks(confirmedCellIndexes) {
        for (const cell of this.gridBoard?.getCells() ?? []) {
            if (confirmedCellIndexes.has(cell.index)) {
                cell.container.disableInteractive();
                continue;
            }

            if (!cell.container.input) {
                cell.container.setInteractive(
                    new Phaser.Geom.Rectangle(cell.size / 2, cell.size / 2, cell.size, cell.size),
                    Phaser.Geom.Rectangle.Contains
                );
            }
        }

        for (const itemView of this.animalTray?.getItemViews() ?? []) {
            const isLocked = this.lockedAnimalIds.has(itemView.item.id);

            if (isLocked) {
                itemView.container.disableInteractive();
                itemView.container.setAlpha(0.4);
                continue;
            }

            if (!itemView.container.input) {
                itemView.container.setInteractive(
                    new Phaser.Geom.Rectangle(0, 0, this.animalTray.options.itemWidth, this.animalTray.options.itemHeight),
                    Phaser.Geom.Rectangle.Contains
                );
            }
            itemView.container.setAlpha(1);
        }

        if (this.selectedAnimal && this.lockedAnimalIds.has(this.selectedAnimal.id)) {
            this.selectedAnimal = null;
            this.animalTray?.setSelectedItem(null);
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

        this.applyConfirmedLocks(confirmedCellIndexes);

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

    disableAnimalTrayItem(animalId) {
        const itemView = this.animalTray?.getItemViews().find((view) => view.item.id === animalId);

        if (!itemView) {
            return;
        }

        itemView.container.disableInteractive();
        itemView.container.setAlpha(0.4);
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

