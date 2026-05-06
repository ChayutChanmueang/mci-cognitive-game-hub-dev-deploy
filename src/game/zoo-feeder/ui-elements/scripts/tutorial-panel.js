import UIPanel from "../core/ui-panel";
import { FoodSpriteLibrary, AnimalSetting, FoodTypes } from "../../constants";
import Theme from "../../../../util/game-theme.js";

export default class TutorialPanel extends UIPanel {
    constructor(scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2, 850, 1600);

        const textStyle = {
            fontFamily: Theme.fonts.main,
            color: '#' + Theme.colors.onSurface.toString(16).padStart(6, '0'),
            align: 'center'
        };

        this.titleText = scene.add.text(0, -720, "วิธีเล่นเกม", {
            ...textStyle,
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#' + Theme.colors.primary.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        // Section: Plant Eaters
        this.subContainer1 = this.createSection(
            0, -450, 
            "สัตว์กินพืช", 
            [AnimalSetting.COW.Icon, AnimalSetting.ELEPHANT.Icon, AnimalSetting.PANDA.Icon], 
            FoodSpriteLibrary[FoodTypes.VEGETABLE],
            0x4caf50 // Material Green
        );

        // Section: Meat Eaters
        this.subContainer2 = this.createSection(
            0, 50, 
            "สัตว์กินเนื้อ", 
            [AnimalSetting.LION.Icon, AnimalSetting.BEAR.Icon, AnimalSetting.FOX.Icon], 
            FoodSpriteLibrary[FoodTypes.MEAT],
            0xf44336 // Material Red
        );

        // Section: Do Not Eat
        this.subContainer3 = this.createSection(
            0, 500, 
            "ห้ามกินเด็ดขาด!", 
            [], 
            FoodSpriteLibrary[FoodTypes.JUNK],
            Theme.colors.onSurfaceVariant,
            true
        );

        this.startBtn = this.createButton(0, 720, "เริ่มเกม", Theme.colors.primary, Theme.colors.onPrimary, () => {
            this.hide();
        });

        this.addElements([
            this.titleText, 
            this.subContainer1, 
            this.subContainer2, 
            this.subContainer3,
            ...this.startBtn
        ]);
    }

    createSection(x, y, title, icons, foodIcons, accentColor, isDanger = false) {
        const container = this.scene.add.container(x, y);
        const width = 750;
        const height = isDanger ? 320 : 420;

        const bg = this.scene.add.graphics();
        bg.fillStyle(Theme.colors.surfaceContainer, 0.5);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, Theme.borderRadius.medium);
        bg.lineStyle(2, accentColor, 0.3);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, Theme.borderRadius.medium);
        container.add(bg);

        const titleText = this.scene.add.text(0, -height / 2 + 40, title, {
            fontFamily: Theme.fonts.main,
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#' + accentColor.toString(16).padStart(6, '0')
        }).setOrigin(0.5);
        container.add(titleText);

        if (icons.length > 0) {
            icons.forEach((icon, index) => {
                const spacing = 180;
                const totalWidth = (icons.length - 1) * spacing;
                const xPos = (index * spacing) - (totalWidth / 2);
                const sprite = this.scene.add.sprite(xPos, -30, icon);
                sprite.setScale(0.6);
                container.add(sprite);
            });

            const actionLabel = this.scene.add.text(0, 60, "ต้องกิน", {
                fontFamily: Theme.fonts.main,
                fontSize: '28px',
                color: '#' + Theme.colors.onSurfaceVariant.toString(16).padStart(6, '0')
            }).setOrigin(0.5);
            container.add(actionLabel);
        }

        const foodY = icons.length > 0 ? 130 : 50;
        foodIcons.forEach((texture, index) => {
            const spacing = 140;
            const totalWidth = (foodIcons.length - 1) * spacing;
            const xPos = (index * spacing) - (totalWidth / 2);
            const foodSprite = this.scene.add.sprite(xPos, foodY, texture);
            foodSprite.setScale(0.5);
            container.add(foodSprite);
        });

        return container;
    }

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

    onHide() {
        this.scene.spawnFruit();
        if (this.scene.startTimer) {
            this.scene.startTimer();
        }
    }
}