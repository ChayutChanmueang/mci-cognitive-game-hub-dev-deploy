import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { createThaiText, ThaiTextPresets } from "../../../util/thai-text.js";
import { AnimalIconTray, SquareGridLayout } from "../../../util/layout/index.js";
import HintLineViewer from "../components/scripts/hint-line-viewer.js";
import RandomPuzzle from "../components/scripts/random-puzzle.js";
import { DefaultAnimals, GameplayConfig, PuzzleLevelConfig } from "../constants.js";

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super("gameplay-scene");
        this.level = 1;
        this.puzzleData = null;
        this.sceneData = {};
        this.frameGraphics = null;
        this.headerElements = [];
        this.hintViewer = null;
        this.animalTray = null;
        this.gridBoard = null;
        this.answerButtonBounds = null;
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
        this.puzzleData = null;
    }

    create(data) {
        this.gameplayUI = new GameplayUI(this, 0, 0);

        this.returnBtn = this.createButton(this.scale.width / 2 - 250, this.scale.height - 150, "RETURN", () => {
            this.scene.start("main-menu-scene", { conveyerNums: 1 });
        });

        this.nextBtn = this.createButton(this.scale.width / 2 + 250, this.scale.height - 150, "NEXT", () => {
            if (this.hintViewer) {
                const nextHint = this.hintViewer.showNextHint();

                if (nextHint !== null) {
                    return;
                }
            }

            this.loadNextPuzzle();
        });

        this.returnBtn[0].setDepth(100);
        this.nextBtn[0].setDepth(100);

        this.loadNextPuzzle();
    }

    createPuzzleData(data) {
        const animalChoices = data.animalChoices ?? DefaultAnimals;
        const levelConfig = data.levelConfig ?? PuzzleLevelConfig;
        const puzzleGenerator = new RandomPuzzle(this.level, levelConfig, animalChoices);

        return puzzleGenerator.getPuzzle();
    }

    resolveLayoutConfig(data) {
        const puzzle = this.puzzleData ?? this.createPuzzleData(data);

        return {
            rows: data.gridRows ?? puzzle.rows,
            columns: data.gridColumns ?? puzzle.columns,
            prompt: data.prompt ?? this.buildPromptText(puzzle),
            stageLabel: data.stageLabel ?? GameplayConfig.stageLabel,
            stageValue: data.stageValue ?? this.level
        };
    }

    buildPromptText(puzzle) {
        if (puzzle?.hintTexts?.length) {
            return puzzle.hintTexts.join(GameplayConfig.promptJoiner);
        }

        return GameplayConfig.defaultPromptFallback;
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
                if (this.hintViewer) {
                    this.hintViewer.showNextHint();
                }
            },
            (data) => {
                console.log(`unselected id: ${data.id}, icon: ${data.icon}, index: ${data.index}`);
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
            padding: 10,
            cellRadius: 28,
            cellFillColor: 0xe4ebf3,
            cellStrokeColor: 0x5b6c81,
            cellStrokeWidth: 4
        });

        this.answerButtonBounds = this.animalTray.getFooterBounds(true);
    }

    createFrame(sceneWidth, sceneHeight) {
        const outer = this.add.graphics();

        outer.fillStyle(0xf7f2e6, 1);
        outer.lineStyle(10, 0x475466, 1);
        outer.fillRoundedRect(12, 112, sceneWidth - 24, sceneHeight - 24, 42);
        outer.strokeRoundedRect(12, 112, sceneWidth - 24, sceneHeight - 24, 42);

        return outer;
    }

    createHeader(layoutConfig, data) {
        const left = 52;
        const top = 136;
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

        this.headerElements = [stagePanel, headerIcon, stageText];

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
