import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";
import { AnimalIconTray, SquareGridLayout } from "../../../util/layout/index.js";
import HintLineViewer from "../components/scripts/hint-line-viewer.js";
import RandomPuzzle from "../components/scripts/random-puzzle.js";
import { DefaultAnimals, GameplayConfig, LevelMap, PuzzleLevelConfig } from "../constants.js";
import {Config} from "../../zoo-detective/constants.js";
import ProgressBar from "../../../util/layout/progress-bar.js";

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super("gameplay-scene");
        this.level = 1;
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
        this.currentPlacements = [];
        this.lockedCellIndexes = new Set();
        this.lockedAnimalIds = new Set();
        this.onPuzzleCompleted = null;
        this.progressBarRefs = [];
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
        this.progressBarRefs = [];
    }

    create(data) {
        this.gameplayUI = new GameplayUI(this, 0, 0);

        this.onPuzzleCompleted = ()=>{
            this.round++;

            if (this.round < Config.MaxRound[this.levelMap]) {
                this.progressBarRefs[this.round].animateTo(1, 500)

                this.time.delayedCall(500, () => {
                    this.gameplayUI.showNextQuizPanel(() => {
                        // Create New Puzzle
                        this.loadNextPuzzle();
                    })
                });
            }else{
                this.gameplayUI.setScore(0);
                this.gameplayUI.showGameOverPanel(0);
            }
        };

        this.returnBtn = this.createButton(this.scale.width / 2 - 250, this.scale.height - 150, "RETURN", () => {
            this.scene.start("main-menu-scene", { conveyerNums: 1 });
        });

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

        this.returnBtn[0].setDepth(100);

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
        this.hintViewer?.showNextHint();
    }

    renderPuzzle() {
        const sceneWidth = this.scale.width;
        const sceneHeight = this.scale.height;
        const layoutConfig = this.resolveLayoutConfig(this.sceneData);
        const animals = this.puzzleData.availableAnimals;

        this.selectedAnimal = null;
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
                footerReservedHeight: this.sceneData.answerButtonHeight ?? 170,
                footerOffset: this.sceneData.answerButtonOffset ?? 28,
                items: animals
            });
        this.animalTray.setPosition(48, sceneHeight - this.animalTray.height - 42);

        const boardTop = headerMetrics.bottom + 48;
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

        if (occupyingAnimal && occupyingAnimal.id !== this.selectedAnimal.id && !this.lockedCellIndexes.has(cell.index)) {
            this.currentPlacements[cell.index] = null;
        }

        if (previousCellIndex >= 0 && previousCellIndex !== cell.index && !this.lockedCellIndexes.has(previousCellIndex)) {
            this.clearCellPlacement(previousCellIndex);
        }

        this.currentPlacements[cell.index] = this.selectedAnimal;
        this.renderAnimalInCell(cell, this.selectedAnimal);

        const expectedAnimal = this.puzzleData.solution[cell.index];
        const isCorrect = this.puzzleGenerator?.checkAnswer([expectedAnimal], [this.selectedAnimal]) ?? false;

        if (!isCorrect) {
            this.setCellState(cell, "default");
            return;
        }

        this.lockedCellIndexes.add(cell.index);
        this.lockedAnimalIds.add(this.selectedAnimal.id);
        this.setCellState(cell, "locked");
        cell.container.disableInteractive();
        this.disableAnimalTrayItem(this.selectedAnimal.id);
        this.selectedAnimal = null;
        this.animalTray.setSelectedItem(null);
        this.tryCompletePuzzle();

        if (this.hintViewer) {
            const nextHint = this.hintViewer.showNextHint();

            if (nextHint !== null) {
                return;
            }
        }
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

    disableAnimalTrayItem(animalId) {
        const itemView = this.animalTray?.getItemViews().find((view) => view.item.id === animalId);

        if (!itemView) {
            return;
        }

        itemView.container.disableInteractive();
        itemView.container.setAlpha(0.4);
    }

    tryCompletePuzzle() {
        const isComplete = this.lockedCellIndexes.size === this.puzzleData.totalSlots;

        if (!isComplete) {
            return false;
        }

        this.onPuzzleCompleted?.({
            level: this.level,
            puzzleData: this.puzzleData,
            placements: [...this.currentPlacements],
            lockedCellIndexes: [...this.lockedCellIndexes]
        });

        return true;
    }

    createFrame(sceneWidth, sceneHeight) {
        const outer = this.add.graphics();

        outer.fillStyle(0xf7f2e6, 1);
        outer.lineStyle(10, 0x475466, 1);
        outer.fillRoundedRect(12, 186, sceneWidth - 24, sceneHeight - 150, 42);
        outer.strokeRoundedRect(12, 186, sceneWidth - 24, sceneHeight - 150, 42);

        return outer;
    }

    createHeader(layoutConfig, data) {
        const left = 52;
        const top = 222;
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
            top + chipHeight + 60,
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
