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
            overlayEnable: true,
            size: { x: 850, y: 1400 },
            strokeEnable: true
        });

        this.panelBg.setScale(1.5);

        this.titleText = createThaiText(
            scene,
            0,
            0,
            scene.postcardText,
            {
                fontSize: "52px",
                fontStyle: "bold",
                color: Theme.colors.onSurface
            },
            { origin: 0.5, wrapWidth: 700 }
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
        EventBus.emit("minigame:tick", { timeLeft: Config.MemoryTimeS, maxTime: Config.MemoryTimeS });
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
            EventBus.emit("minigame:tick", { timeLeft, maxTime: Config.MemoryTimeS });
        }
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