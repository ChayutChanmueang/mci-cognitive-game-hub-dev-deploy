import { createThaiText } from "../../../../util/thai-text";
import UIPage from "../core/ui-page";
import Theme from "../../../../util/game-theme.js";

export default class GameOverPanel extends UIPage {
    constructor(scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2, {
            overlayEnable: true,
            size: { x: 500, y: 600 },
            strokeEnable: true
        });

        this.panelBg.setScale(1.5);
        this.panelBg.setFillStyle(Theme.colors.surface, 0.95);
        this.panelBg.setStrokeStyle(4, Theme.colors.primary, 1);

        this.titleText = createThaiText(
            scene,
            0,
            -275,
            "เย่! ผ่านด่านแล้ว!",
            {
                fontSize: "72px",
                fontStyle: "bold",
                color: "#000000",
            },
            { origin: 0.5 },
        );

        this.scoreText = createThaiText(
            scene,
            0,
            -120,
            "คะแนน: 0",
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: Theme.colors.onSurface,
            },
            { origin: 0.5 },
        );

        this.levelText = createThaiText(
            scene,
            0,
            -50,
            "ด่านที่ผ่าน: 0 ด่าน",
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: Theme.colors.onSurface,
            },
            { origin: 0.5 },
        );

        this.timeText = createThaiText(
            scene,
            0,
            20,
            "เวลาที่ใช้: 0 วินาที",
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: Theme.colors.onSurface,
            },
            { origin: 0.5 },
        );

        this.restartBtn = this.createButton(0, 155, "เล่นด่านต่อไป", () => {
            this.scene.scene.restart();
        });

        this.homeBtn = this.createButton(0, 255, "กลับหน้าหลัก", () => {
            // Note: In actual play, navigation is handled by React via EventBus signals
            // This is just a fallback for local testing
            this.scene.scene.start('main-menu-scene');
        });

        this.addElements([this.titleText, this.scoreText, this.levelText, this.timeText, ...this.restartBtn, ...this.homeBtn]);
    }

    setFinalTime(Time) {
        this.timeText.setText("เวลาที่ใช้: " + Time + " วินาที");
    }

    setScore(score) {
        this.scoreText.setText("คะแนน: " + score);
    }

    setLevelsPassed(levels) {
        this.levelText.setText("ด่านที่ผ่าน: " + levels + " ด่าน");
    }

    reset() {
        this.setFinalTime(0);
        this.setScore(0);
        this.setLevelsPassed(0);
        this.forceHide();
    }

    createButton(x, y, text, onClick) {
        const width = 300;
        const height = 80;
        const bg = this.scene.add.rectangle(x, y, width, height, Theme.colors.primary, 1).setInteractive({ useHandCursor: true });
        
        const label = createThaiText(
            this.scene,
            x,
            y,
            text,
            {
                fontSize: "42px",
                fontStyle: "bold",
                color: "#ffffff",
            },
            { origin: 0.5 },
        );

        bg.on('pointerdown', () => {
            bg.setFillStyle(Theme.colors.primaryDark);
            onClick();
        });

        bg.on('pointerover', () => bg.setFillStyle(Theme.colors.primaryLight));
        bg.on('pointerout', () => bg.setFillStyle(Theme.colors.primary));

        return [bg, label];
    }
}
