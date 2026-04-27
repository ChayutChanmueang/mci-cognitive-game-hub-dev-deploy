import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";
import { AnimalIconTray, SquareGridLayout } from "../../../util/layout/index.js";
import HintLineViewer from "../components/scripts/hint-line-viewer.js";
import RandomPuzzle from "../components/scripts/random-puzzle.js";
import { DefaultAnimals, GameplayConfig, LevelMap, PuzzleLevelConfig } from "../constants.js";
import {Config} from "../../zoo-detective/constants.js";
import ProgressBar from "../../../util/layout/progress-bar.js";
import DateTimeTimer from "../../../util/datetime-timer.js";

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
        this.answerButtonBounds = null;
        this.round = 0;
        this.selectedAnimal = null;
        this.currentHintIndex = 0;
        this.currentPlacements = [];
        this.lockedCellIndexes = new Set();
        this.lockedAnimalIds = new Set();
        this.onPuzzleCompleted = null;
        this.onPlacementEvaluated = null;
        this.progressBarRefs = [];
        this.puzzleTimer = new DateTimeTimer();
        this.timeLimitMs = Config.TimeLimitMs;
        this.isGameEnded = false;
    }

    preload() {
        this.load.scenePlugin(
            "rexuiplugin",
            "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
            "rexUI",
            "rexUI",
        );

        this.load.image("button-idle", "assets/button_rectangle_depth_flat.png");
        this.load.image("button-press", "assets/button_rectangle_flat.png");
    }

    init(data) {
        this.sceneData = { ...data };
        this.level = data.level ?? 1;
        this.levelMap = LevelMap[this.level] ?? "easy";
        this.puzzleData = null;
        this.round = 0;
        this.allScore = 0;
        this.progressBarRefs = [];
        this.timeLimitMs = data.timeLimitMs ?? Config.TimeLimitMs;
        this.isGameEnded = false;
        this.onPlacementEvaluated = data.onPlacementEvaluated ?? null;
    }

    create(data) {
        this.gameplayUI = new GameplayUI(this, 0, 0);
        this.gameplayUI.setLevel(this.levelMap, this.level, 1, Config.MaxRound[this.levelMap]);
        this.gameplayUI.setScore(this.allScore);
        this.gameplayUI.setElapsedTime(0);

        this.resetGameTimer();
        this.onCloseTutorial = () => {
            this.startGameTimer();
        };

        this.onPuzzleCompleted = (result = {})=>{
            if (this.isGameEnded) {
                return;
            }

            this.round++;
            const addScore = Config.IncreaseScore[this.levelMap] + this.roundScore;
            this.allScore += (addScore >= 0 ? addScore : 0);
            this.roundScore = 0;
            const maxRound = Config.MaxRound[this.levelMap];
            const nextRoundDisplay = Math.min(this.round + 1, maxRound);

            this.gameplayUI.setScore(this.allScore);
            this.gameplayUI.setLevel(this.levelMap, this.level, nextRoundDisplay, maxRound);

            console.log(`allScore : ${this.allScore}`);
            console.log(`elapsedTimeMs : ${result.elapsedTimeMs ?? 0}`);

            if (this.round < maxRound) {
                this.progressBarRefs[this.round].animateTo(1, 500)

                this.time.delayedCall(500, () => {
                    if (this.isGameEnded) {
                        return;
                    }

                    this.gameplayUI.showNextQuizPanel(() => {
                        // Create New Puzzle
                        this.loadNextPuzzle();
                    })
                });
            }else{
                this.endGame();
            }
        };

        this.onPlacementEvaluated = (callback = {isCorrect: isCorrectForCurrentHint,
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
             })=>{

            if (!callback.isCorrect) {
                this.roundScore -= Config.DecreaseScore[this.levelMap];
            }
        };

        let dotProgressBars = [];
        for (let i = 0; i < Config.MaxRound[this.levelMap]; i++) {
            const bar = new ProgressBar(this, 0, 0, {
                width: 50,
                height: 50
            });

            bar.setValue(0);

            this.progressBarRefs.push(bar);
            dotProgressBars.push(bar.getContainer());
        }

        Phaser.Actions.GridAlign(dotProgressBars, {
            width: 10,
            cellWidth: 60,
            cellHeight: 5,
            x: this.scale.width / 2 - 275,
            y: 140,
            position: Phaser.Display.Align.TOP_LEFT
        });

        this.progressBarRefs[this.round]?.animateTo(1, 500);

        this.loadNextPuzzle();
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
        this.gameplayUI.setElapsedTime(elapsedMs);

        if (!this.isGameEnded && elapsedMs >= this.timeLimitMs) {
            this.endGame();
        }
    }

    startGameTimer(){
        this.puzzleTimer.start();
    }

    resetGameTimer(){
        this.puzzleTimer.reset();
    }

    endGame() {
        if (this.isGameEnded) {
            return;
        }

        this.isGameEnded = true;
        this.puzzleTimer.stop();

        const elapsedMs = this.puzzleTimer.getElapsedMilliseconds();
        this.gameplayUI?.setElapsedTime(elapsedMs);
        this.gameplayUI?.setScore(this.allScore);
        this.gameplayUI?.showGameOverPanel(this.allScore);
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

        this.frameGraphics = this.createFrame(sceneWidth, sceneHeight);
        const headerMetrics = this.createHeader(layoutConfig, this.sceneData);

        this.animalTray = new AnimalIconTray(this, 48, 0,
            (data) => {
                console.log(`selected id: ${data.id}, icon: ${data.icon}, index: ${data.index}`);
                if (this.lockedAnimalIds.has(data.id)) {
                    return;
                }

                this.selectedAnimal = data;
            },
            (data) => {
                console.log(`unselected id: ${data.id}, icon: ${data.icon}, index: ${data.index}`);
                if (this.selectedAnimal?.id === data.id) {
                    this.selectedAnimal = null;
                }
            },
            {
                width: sceneWidth - 96,
                maxItemsPerRow: this.sceneData.maxAnimalsPerRow ?? 6,
                itemWidth: 132,
                itemHeight: 132,
                itemGap: 18,
                rowGap: 20,
                padding: { top: 40, right: 36, bottom: 32, left: 36 },
                trayRadius: 42,
                footerReservedHeight: this.sceneData.answerButtonHeight ?? 0,
                footerOffset: this.sceneData.answerButtonOffset ?? 12,
                items: animals
            });
        this.animalTray.setPosition(48, sceneHeight - this.animalTray.height - 42);

        const boardTop = headerMetrics.bottom + 100;
        const boardBottom = this.animalTray.y - 56;
        const boardWidth = Math.min(sceneWidth - 140, 930);
        const boardHeight = Math.max(420, boardBottom - boardTop);
        const boardX = (sceneWidth - boardWidth) / 2;

        this.gridBoard = new SquareGridLayout(this, boardX, boardTop, {
            rows: layoutConfig.rows,
            columns: layoutConfig.columns,
            width: boardWidth,
            height: boardHeight,
            gap: 26,
            padding: 50,
            cellRadius: 28,
            cellFillColor: 0xe4ebf3,
            cellStrokeColor: 0x5b6c81,
            cellStrokeWidth: 4
        });
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
        const emojiText = this.add.text(0, 0, animal.icon ?? animal.label ?? "?", {
            fontFamily: '"Noto Color Emoji", "Segoe UI Emoji", sans-serif',
            fontSize: `${Math.floor(cell.size * 0.45)}px`
        }).setOrigin(0.5);

        this.gridBoard.clearCell(cell.index, true);
        this.gridBoard.addToCell(cell.index, emojiText);
    }

    setCellState(cell, state = "default") {
        const strokeColorMap = {
            default: 0x5b6c81,
            locked: 0x2aa84a
        };
        const fillColorMap = {
            default: 0xe4ebf3,
            locked: 0xd9f4df
        };

        cell.background.clear();
        cell.background.fillStyle(fillColorMap[state] ?? fillColorMap.default, 1);
        cell.background.lineStyle(4, strokeColorMap[state] ?? strokeColorMap.default, 1);
        cell.background.fillRoundedRect(0, 0, cell.size, cell.size, 28);
        cell.background.strokeRoundedRect(0, 0, cell.size, cell.size, 28);
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
        const outer = this.add.graphics();

        outer.fillStyle(0xf7f2e6, 1);
        outer.lineStyle(10, 0x475466, 1);
        outer.fillRoundedRect(12, 216, sceneWidth - 24, sceneHeight - 120, 42);
        outer.strokeRoundedRect(12, 216, sceneWidth - 24, sceneHeight - 120, 42);

        return outer;
    }

    createHeader(layoutConfig, data) {
        const left = 52;
        const top = 255;
        const chipWidth = 240;
        const chipHeight = 112;
        const gap = 22;
        const cardWidth = this.scale.width - left - 52 - chipWidth - gap;
        const promptX = left + chipWidth + gap;
        const promptHints = this.getPromptHints(data);
        const promptStyle = {
            fontSize: "40px",
            fontStyle: "bold",
            color: "#7d7790",
            align: "left"
        };
        const promptWrapWidth = cardWidth - 60;
        const hintViewerMinHeight = this.measureHintViewerHeight(promptHints, promptStyle, promptWrapWidth);

        const stagePanel = this.drawRoundedPanel(left, top, chipWidth, chipHeight, {
            fillColor: 0xffffff,
            strokeColor: 0x1fd11a,
            strokeWidth: 8,
            radius: 24
        });

        const hintViewerOptions = {
            width: cardWidth,
            minHeight: hintViewerMinHeight,
            padding: 24,
            radius: 24,
            fillColor: 0xffffff,
            strokeColor: 0x1fd11a,
            strokeWidth: 8,
            emptyText: "",
            textStyle: promptStyle,
            textOptions: {
                origin: [0, 0],
                wrapWidth: promptWrapWidth
            }
        };

        this.hintViewer = new HintLineViewer(this, promptX, top, promptHints, hintViewerOptions);
        this.hintViewer.setDepth(2);

        const headerIcon = this.add.text(left + 26, top + (chipHeight / 2), "📝", {
            fontFamily: '"Noto Color Emoji", "Segoe UI Emoji", sans-serif',
            fontSize: "52px"
        }).setOrigin(0, 0.5);

        const stageText = createThaiText(
            this,
            left + 82,
            top + (chipHeight / 2),
            `${layoutConfig.stageLabel} ${layoutConfig.stageValue}`,
            {
                fontSize: "42px",
                fontStyle: "bold",
                color: "#3f5165"
            },
            { origin: [0, 0.5] }
        );

        const promptText = createThaiText(
            this,
            this.scale.width / 2,
            top + chipHeight + 80,
            `${GameplayConfig.defaultPromptFallback}`,
            {
                fontSize: "42px",
                fontStyle: "bold",
                color: "#3f5165"
            },
            { origin: [0.5, 0.5] }
        );

        this.headerElements = [stagePanel, headerIcon, stageText, promptText];

        return {
            bottom: top + Math.max(chipHeight, this.hintViewer.height)
        };
    }

    getPromptHints(data) {
        return [...(data.questionHints ?? this.puzzleData?.hintTexts ?? [])];
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
        radius = 18
    }) {
        const panel = this.add.graphics();

        panel.fillStyle(fillColor, fillAlpha);
        panel.lineStyle(strokeWidth, strokeColor, strokeAlpha);
        panel.fillRoundedRect(x, y, width, height, radius);
        panel.strokeRoundedRect(x, y, width, height, radius);

        return panel;
    }

    increaseScore(score){
        this.allScore += score;
    }

    decreaseScore(score){
        this.allScore -= score;

        const scorePenaltyText = createThaiText(
            this,
            this.scale.width / 2,
            this.scale.height / 2 - 250,
            `-${score}`,
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: "#ff4d4d"
            },
            { origin: 0.5 }
        );
        scorePenaltyText.setDepth(200);

        this.tweens.add({
            targets: scorePenaltyText,
            y: scorePenaltyText.y - 40,
            alpha: 0,
            duration: 700,
            ease: "Sine.easeOut",
            onComplete: () => {
                scorePenaltyText.destroy();
            }
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
