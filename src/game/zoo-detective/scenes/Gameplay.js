import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import {createThaiText, ThaiTextPresets} from "../../../util/thai-text.js";
import { AnimalIconTray, SquareGridLayout } from "../../../util/layout/index.js";
import {LevelMap} from "../../context-clues/constants.js";
import RandomQuiz from "../../context-clues/components/scripts/random-quiz.js";

const GRID_PRESETS = Object.freeze({
    1: { rows: 2, columns: 2 },
    2: { rows: 2, columns: 3 },
    3: { rows: 3, columns: 3 }
});

const DEFAULT_ANIMALS = Object.freeze([
    { id: "lion", icon: "🦁" },
    { id: "elephant", icon: "🐘" },
    { id: "giraffe", icon: "🦒" },
    { id: "monkey", icon: "🐒" },
    { id: "zebra", icon: "🦓" },
    { id: "panda", icon: "🐼" }
]);

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

        this.load.image('button-idle','assets/button_rectangle_depth_flat.png')
        this.load.image('button-press','assets/button_rectangle_flat.png')
    }

    init(data) {
        this.level = data.level;
    }

    create(data) {
        this.gameplayUI = new GameplayUI(this, 0, 0);

        this.returnBtn = this.createButton(this.scale.width/2 - 250,(this.scale.height) - 150, "RETURN", () => {
            this.scene.start('main-menu-scene',{ conveyerNums: 1 });
        });

        this.nextBtn = this.createButton(this.scale.width/2 + 250,(this.scale.height) - 150, "NEXT", () => {

        });

        const sceneWidth = this.scale.width;
        const sceneHeight = this.scale.height;
        this.level = data.level ?? 1;
        const layoutConfig = this.resolveLayoutConfig(data);
        const animals = data.animalChoices ?? DEFAULT_ANIMALS;

        this.createFrame(sceneWidth, sceneHeight);
        const headerMetrics = this.createHeader(layoutConfig, data);

        this.animalTray = new AnimalIconTray(this, 48, 0,
            (data) => {
                console.log(`selected id: ${data.id}, icon: ${data.icon}, index: ${data.index}`);
            },
            (data) => {
                console.log(`unselected id: ${data.id}, icon: ${data.icon}, index: ${data.index}`);
            },
            {
            width: sceneWidth - 96,
            maxItemsPerRow: data.maxAnimalsPerRow ?? 6,
            itemWidth: 132,
            itemHeight: 132,
            itemGap: 18,
            rowGap: 20,
            padding: { top: 40, right: 36, bottom: 32, left: 36 },
            trayRadius: 42,
            footerReservedHeight: data.answerButtonHeight ?? 170,
            footerOffset: data.answerButtonOffset ?? 28,
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

        this.returnBtn[0].setDepth(100);
        this.nextBtn[0].setDepth(100);

        this.answerButtonBounds = this.animalTray.getFooterBounds(true);
    }

    resolveLayoutConfig(data) {
        const preset = GRID_PRESETS[data.level] ?? GRID_PRESETS[1];

        return {
            rows: data.gridRows ?? preset.rows,
            columns: data.gridColumns ?? preset.columns,
            prompt: data.prompt ?? "1. อยู่ที่ซ้ายล่าง",
            stageLabel: data.stageLabel ?? "ลำดับ",
            stageValue: data.stageValue ?? this.level
        };
    }

    createFrame(sceneWidth, sceneHeight) {
        const outer = this.add.graphics();

        outer.fillStyle(0xf7f2e6, 1);
        outer.lineStyle(10, 0x475466, 1);
        outer.fillRoundedRect(12, 112, sceneWidth - 24, sceneHeight - 24, 42);
        outer.strokeRoundedRect(12, 112, sceneWidth - 24, sceneHeight - 24, 42);
    }

    createHeader(layoutConfig, data) {
        const left = 52;
        const top = 136;
        const chipWidth = 240;
        const chipHeight = 112;
        const gap = 22;
        const cardWidth = this.scale.width - left - 52 - chipWidth - gap;
        const promptText = createThaiText(
            this,
            left + chipWidth + gap + 30,
            top + 24,
            data.questionText ?? layoutConfig.prompt,
            {
                fontSize: "40px",
                fontStyle: "bold",
                color: "#7d7790"
            },
            {
                origin: [0, 0],
                wrapWidth: cardWidth - 60
            }
        );
        const cardHeight = Math.max(112, promptText.height + 44);

        this.drawRoundedPanel(left, top, chipWidth, chipHeight, {
            fillColor: 0xffffff,
            strokeColor: 0x1fd11a,
            strokeWidth: 8,
            radius: 24
        });
        this.drawRoundedPanel(left + chipWidth + gap, top, cardWidth, cardHeight, {
            fillColor: 0xffffff,
            strokeColor: 0x1fd11a,
            strokeWidth: 8,
            radius: 24
        });

        this.add.text(left + 26, top + (chipHeight / 2), "📝", {
            fontFamily: '"Noto Color Emoji", "Segoe UI Emoji", sans-serif',
            fontSize: "52px"
        }).setOrigin(0, 0.5);

        createThaiText(
            this,
            left + 82,
            top + (chipHeight / 2),
            `${layoutConfig.stageLabel}`,
            {
                fontSize: "42px",
                fontStyle: "bold",
                color: "#3f5165"
            },
            { origin: [0, 0.5] }
        );
        promptText.setDepth(2);

        return {
            bottom: top + Math.max(chipHeight, cardHeight)
        };
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

    createButton(x,y,text,onClick){
        const container = this.add.container(0, 0);
        const bg = this.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = createThaiText(this, x, y, text, ThaiTextPresets.buttonLabel, { origin: 0.5 });
        label.setScale(1.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        container.add(bg);
        container.add(label);
        return [container, bg,label];
    }
}
