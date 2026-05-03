import UIPage from "../core/ui-page";
import Theme from "../../../../util/game-theme.js";
import { createThaiText } from "../../../../util/thai-text.js";

export default class GameOverPanel extends UIPage {
    constructor(scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2, {
            overlayEnable: true,
            size: { x: 500, y: 700 },
            strokeEnable: true
        });

        this.panelBg.setScale(1.5);
        this.panelBg.setFillStyle(Theme.colors.surface, 0.95);
        this.panelBg.setStrokeStyle(4, Theme.colors.primary, 1);

        this.titleText = createThaiText(
            scene,
            0,
            -220,
            "สรุปผลการเล่น",
            {
                fontSize: "72px",
                fontStyle: "bold",
                color: Theme.colors.primary,
            },
            { origin: 0.5 },
        );

        this.scoreLabel = createThaiText(
            scene,
            0,
            -100,
            "คะแนนที่คุณทำได้",
            {
                fontSize: "32px",
                color: Theme.colors.onSurfaceVariant,
            },
            { origin: 0.5 },
        );

        this.scoreText = createThaiText(
            scene,
            0,
            0,
            "0",
            {
                fontSize: "120px",
                fontStyle: "bold",
                color: Theme.colors.onSurface,
            },
            { origin: 0.5 },
        );

        this.highscoreText = createThaiText(
            scene,
            0,
            120,
            "คะแนนสูงสุด: 0",
            {
                fontSize: "32px",
                color: Theme.colors.onSurfaceVariant,
            },
            { origin: 0.5 },
        );

        this.restartBtn = this.createButton(0, 250, "เล่นรอบใหม่", () => {
            this.scene.scene.restart();
        });

        this.homeBtn = this.createButton(0, 380, "กลับหน้าหลัก", () => {
            // Note: Navigation handled by React via EventBus signals in main system
            this.scene.scene.start('main-menu-scene');
        });

        this.addElements([
            this.titleText, 
            this.scoreLabel, 
            this.scoreText, 
            this.highscoreText, 
            ...this.restartBtn, 
            ...this.homeBtn
        ]);
    }

    setFinalScore(score) {
        this.scoreText.setText(score.toString());
    }

    setHighscore(score) {
        this.highscoreText.setText("คะแนนสูงสุด: " + score);
    }

    reset() {
        this.setFinalScore(0);
        this.setHighscore(0);
        this.forceHide();
    }

    createButton(x, y, text, onClick) {
        const width = 350;
        const height = 90;
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

