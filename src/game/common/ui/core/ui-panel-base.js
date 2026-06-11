import Theme from "../../../../util/game-theme.js";
import { EventBus } from "../../../../core/EventBus.js";

export default class UIPanel {
    constructor(scene, x, y, sizeXOrSetting, sizeY) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.container = scene.add.container(x, y);
        this.container.setDepth(2000);

        let width = 500;
        let height = 500;

        let hasOverlay = true;
        if (typeof sizeXOrSetting === 'object' && sizeXOrSetting !== null) {
            const setting = sizeXOrSetting;
            width = setting.size?.x || 500;
            height = setting.size?.y || 500;
            if (setting.overlayEnable === false) {
                hasOverlay = false;
            }
        } else {
            width = sizeXOrSetting || 500;
            height = sizeY || 500;
        }

        // Dark overlay
        this.overlay = scene.add.rectangle(
            0, 0,
            scene.scale.width * 2, scene.scale.height * 2,
            Theme.colors.overlay, Theme.colors.overlayAlpha
        );
        if (hasOverlay) {
            this.overlay.setInteractive();
        } else {
            this.overlay.setVisible(false);
        }

        // Glass panel background
        this.panelBg = scene.add.graphics();
        this.drawPanel(width, height);

        this.container.add([this.overlay, this.panelBg]);

        this.forceHide();
    }

    drawPanel(width, height) {
        this.panelBg.clear();
        
        // Shadow/Glow effect
        this.panelBg.lineStyle(8, Theme.colors.primary, 0.1);
        this.panelBg.strokeRoundedRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4, Theme.borderRadius.large);

        // Background
        this.panelBg.fillStyle(Theme.colors.surface, 0.95);
        this.panelBg.fillRoundedRect(-width / 2, -height / 2, width, height, Theme.borderRadius.large);
        
        // Border
        this.panelBg.lineStyle(2, Theme.colors.outline, 0.5);
        this.panelBg.strokeRoundedRect(-width / 2, -height / 2, width, height, Theme.borderRadius.large);
    }

    addElements(elements) {
        this.container.add(elements);
    }

    show() {
        this.container.setVisible(true);
        this.container.setScale(0.8);
        this.container.alpha = 0;
        
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.out'
        });
    }

    hide() {
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 0.8,
            scaleY: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Power2.in',
            onComplete: () => {
                this.container.setVisible(false);
                if (this.onHide) {
                    this.onHide();
                }
            }
        });
    }

    forceShow() {
        this.container.setVisible(true);
    }

    forceHide() {
        this.container.setVisible(false);
    }

    destroy() {
        this.container.destroy();
    }
    
    // Utility to create a Material button
    createButton(x, y, text, bgColor, textColor, onClick) {
        const width = 320;
        const height = 70;
        
        const bg = this.scene.add.graphics();
        
        const drawBtn = (color) => {
            bg.clear();
            bg.fillStyle(color, 1);
            bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, Theme.borderRadius.medium);
            
            if (color !== Theme.colors.primary) {
                bg.lineStyle(2, Theme.colors.outline, 0.5);
                bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, Theme.borderRadius.medium);
            }
        };

        drawBtn(bgColor);
        
        // Use a simpler hit area
        bg.setInteractive(new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height), Phaser.Geom.Rectangle.Contains);

        const label = this.scene.add.text(x, y, text, {
            fontFamily: Theme.fonts.main,
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#' + textColor.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        bg.on('pointerdown', () => {
            EventBus.emit('audio:play', 'ui:click');
            this.scene.tweens.add({
                targets: [bg, label],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true
            });
            onClick();
        });

        bg.on('pointerover', () => {
            this.scene.tweens.add({
                targets: [bg, label],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200
            });
        });

        bg.on('pointerout', () => {
            this.scene.tweens.add({
                targets: [bg, label],
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });

        return [bg, label];
    }
}
