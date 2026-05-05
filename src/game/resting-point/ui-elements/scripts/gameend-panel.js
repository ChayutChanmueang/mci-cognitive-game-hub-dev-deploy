import { createThaiText } from "../../../../util/thai-text";
import UIPage from "../core/ui-page";
import Theme from "../../../../util/game-theme.js";

export default class GameEndPanel extends UIPage {
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
            -200,
            "สรุปผลการเล่น",
            {
                fontSize: "72px",
                fontStyle: "bold",
                color: Theme.colors.primary,
            },
            { origin: 0.5 },
        );

        this.scoreText = createThaiText(
            scene,
            0,
            0,
            "จำนวนด่านที่ผ่าน: 0",
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: Theme.colors.onSurface,
            },
            { origin: 0.5 },
        );

        this.homeBtn = this.createButton(0, 225, "กลับหน้าหลัก", () => {
            this.scene.scene.start('main-menu-scene');
        });

        this.addElements([this.titleText, this.scoreText, ...this.homeBtn]);
    }

    setPassStages(Stages) {
        this.scoreText.setText("จำนวนด่านที่ผ่าน: " + Stages);
    }

    reset() {
        this.setPassStages(0);
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
