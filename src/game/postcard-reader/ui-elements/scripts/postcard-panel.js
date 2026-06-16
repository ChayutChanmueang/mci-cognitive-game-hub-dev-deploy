import UIPage from "../core/ui-page";
import { Config } from "../../constants";
import Theme from "../../../../util/game-theme.js";
import { createThaiText } from "../../../../util/thai-text.js";
import { EventBus } from "../../../../core/EventBus.js";
import VoiceService from "../../../../core/voice-service.js";

export default class PostcardPanel extends UIPage {
    constructor(scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2, {
            panelPosition: { x: 0, y: 100 },
            overlayEnable: false,
            size: { x: 920, y: 680 },
            strokeEnable: true
        });

        this.titleText = createThaiText(
            scene,
            0,
            0,
            scene.postcardText,
            {
                fontSize: "52px",
                fontStyle: "bold",
                color: "#743D14"
            },
            { origin: 0.5, wrapWidth: 800 }
        );

        this.addElements([this.titleText]);

        this.startMemoryCountdown();

        // Accessibility: Read text aloud
        VoiceService.speak(scene.postcardText);
    }

    startMemoryCountdown() {
        const memoryTimeMs = Config.MemoryTimeS * 1000;
        this.countdownTimer = this.scene.time.addEvent({
            delay: memoryTimeMs,
            callback: () => {
                this.forceHide();
                this.scene.showGame();
                VoiceService.stop();
            }
        });

        // Signal HUD about memory phase
        EventBus.emit("minigame:tick-progress", { timeLeft: Config.MemoryTimeS, maxTime: Config.MemoryTimeS });
    }

    reinitializedPanel() {
        this.forceShow();
        this.titleText.setText(this.scene.postcardText);
        this.startMemoryCountdown();

        // Accessibility: Read text aloud
        VoiceService.speak(this.scene.postcardText);
    }

    update() {
        if (this.container.visible && this.countdownTimer) {
            const timeLeft = Math.trunc(this.countdownTimer.getRemainingSeconds() + 1);
            EventBus.emit("minigame:tick-progress", { timeLeft, maxTime: Config.MemoryTimeS });
        }
    }

    drawPanel(width, height) {
        this.panelBg.clear();
        
        // Shadow (Figma: X=0, Y=12, Blur=4, Spread=0, Color=#E49A2C)
        // Simulate slight blur by drawing an outer layer with lower alpha
        this.panelBg.fillStyle(0xE49A2C, 0.3);
        this.panelBg.fillRoundedRect(-width / 2 - 2, -height / 2 + 10, width + 4, height + 4, 54);
        this.panelBg.fillStyle(0xE49A2C, 0.6);
        this.panelBg.fillRoundedRect(-width / 2 - 1, -height / 2 + 11, width + 2, height + 2, 53);
        // Core shadow
        this.panelBg.fillStyle(0xE49A2C, 1);
        this.panelBg.fillRoundedRect(-width / 2, -height / 2 + 12, width, height, 52);

        // Main Background
        this.panelBg.fillStyle(0xFDF5E0, 1);
        this.panelBg.fillRoundedRect(-width / 2, -height / 2, width, height, 52);
    }

    createButton(x, y, text, onClick) {
        const bg = this.scene.add.rectangle(x, y, 200, 60, Theme.colors.primary, 1).setInteractive({ useHandCursor: true });
        bg.setScale(1.5);
        const label = createThaiText(this.scene, x, y, text, { fontSize: '32px', fontStyle: 'bold', color: '#ffffff' }, { origin: 0.5 });
        label.setScale(1.5);

        bg.on('pointerdown', onClick);
        bg.on('pointerover', () => bg.setFillStyle(Theme.colors.primaryLight));
        bg.on('pointerout', () => bg.setFillStyle(Theme.colors.primary));

        return [bg, label];
    }
}