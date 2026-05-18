import UIPanel from "../core/ui-panel";
import Theme from "../../../../util/game-theme.js";

export default class GameOverPanel extends UIPanel {
    constructor(scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2, 450, 600);

        this.finalScore = 0;

        const textStyle = {
            fontFamily: Theme.fonts.main,
            color: '#' + Theme.colors.onSurface.toString(16).padStart(6, '0'),
            align: 'center'
        };

        this.titleText = scene.add.text(0, -220, "จบการเล่น", {
            ...textStyle,
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#' + Theme.colors.primary.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.scoreLabel = scene.add.text(0, -120, "คะแนนที่ทำได้", {
            ...textStyle,
            fontSize: '24px',
            color: '#' + Theme.colors.onSurfaceVariant.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.scoreText = scene.add.text(0, -60, "0", {
            ...textStyle,
            fontSize: '84px',
            fontStyle: 'bold',
            color: '#' + Theme.colors.onSurface.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.highscoreText = scene.add.text(0, 40, "คะแนนสูงสุด: 0", {
            ...textStyle,
            fontSize: '28px',
            color: '#' + Theme.colors.onSurfaceVariant.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.restartBtn = this.createButton(0, 160, "เล่นอีกครั้ง", Theme.colors.primary, Theme.colors.onPrimary, () => {
            if (this.scene.restartGame) {
                this.scene.restartGame();
                return;
            }
            this.scene.scene.restart();
        });

        this.homeBtn = this.createButton(0, 250, "กลับหน้าหลัก", Theme.colors.outline, Theme.colors.onSurface, () => {
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
        this.finalScore = score;
    }

    setHighscore(score) {
        this.highscoreText.setText("คะแนนสูงสุด: " + score);
    }

    reset() {
        this.setFinalScore(0);
        this.setHighscore(0);
        this.forceHide();
    }

    createButton(x, y, text, bgColor, textColor, onClick) {
        const width = 320;
        const height = 70;
        
        const bg = this.scene.add.graphics();
        
        const drawBtn = (color, alpha = 1) => {
            bg.clear();
            bg.fillStyle(color, alpha);
            bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, Theme.borderRadius.medium);
            
            // Add subtle border for secondary buttons
            if (color !== Theme.colors.primary) {
                bg.lineStyle(2, Theme.colors.outline, 0.5);
                bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, Theme.borderRadius.medium);
            }
        };

        drawBtn(bgColor);
        
        const hitArea = new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height);
        bg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        bg.setCursorHandler ? bg.setCursorHandler('pointer') : null;

        const label = this.scene.add.text(x, y, text, {
            fontFamily: Theme.fonts.main,
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#' + textColor.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        bg.on('pointerdown', () => {
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
                scaleX: 1.02,
                scaleY: 1.02,
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

