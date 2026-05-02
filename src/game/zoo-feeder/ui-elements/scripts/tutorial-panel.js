import UIPanel from "../core/ui-panel";
import { FoodSpriteLibrary, AnimalSetting, FoodTypes } from "../../constants";

export default class TutorialPanel extends UIPanel {
    constructor(scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2, 800, 1750);

        //Relative to the main container

        this.titleText = scene.add.text(0, -750, "TUTORIAL", {
            fontSize: '48px', color: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.titleText.setScale(1.5);

        this.homeBtn = this.createButton(0, 750, "START", () => {
            //this.scene.spawnFruit();
            this.hide();
        });

        // Initialize the container only once
        this.subContainer1 = scene.add.container(0, -425);

        // Create and add the background panel FIRST so it renders at the bottom
        this.subContainer1Panel = scene.add.rectangle(0, 0, 600, 450, 0x222222, 1);
        this.subContainer1Panel.setStrokeStyle(4, 0xffffff);
        this.subContainer1.add(this.subContainer1Panel);

        this.veggieTitleText = scene.add.text(0, -150, "PLANT EATER", {
            fontSize: '48px', color: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.veggieEater1 = scene.add.sprite(-125, -50, AnimalSetting.COW.Icon);
        this.veggieEater1.setScale(0.5);
        this.veggieEater2 = scene.add.sprite(0, -50, AnimalSetting.ELEPHANT.Icon);
        this.veggieEater2.setScale(0.5);
        this.veggieEater3 = scene.add.sprite(125, -50, AnimalSetting.PANDA.Icon);
        this.veggieEater3.setScale(0.5);

        this.eat1Text = scene.add.text(0, 50, "EAT", {
            fontSize: '48px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add the standard text and icon elements next
        this.subContainer1.add([this.veggieTitleText, this.veggieEater1, this.veggieEater2, this.veggieEater3, this.eat1Text]);

        const vegList = FoodSpriteLibrary[FoodTypes.VEGETABLE];
        const spacing = 125; // Define pixels between sprites

        vegList.forEach((texture, index) => {
            // Calculate centered position for the group of food sprites
            const totalWidth = (vegList.length - 1) * spacing;
            const xPos = (index * spacing) - (totalWidth / 2);

            const foodSprite = scene.add.sprite(xPos, 150, texture);
            foodSprite.setScale(0.4);
            // Food sprites are added LAST, ensuring they render on top of the panel
            this.subContainer1.add(foodSprite);
        });

        // Initialize the container only once
        this.subContainer2 = scene.add.container(0, 75);

        // Create and add the background panel FIRST so it renders at the bottom
        this.subContainer2Panel = scene.add.rectangle(0, 0, 600, 450, 0x222222, 1);
        this.subContainer2Panel.setStrokeStyle(4, 0xffffff);
        this.subContainer2.add(this.subContainer2Panel);

        this.meatTitleText = scene.add.text(0, -150, "MEAT EATER", {
            fontSize: '48px', color: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instantiate carnivorous animal sprites
        this.meatEater1 = scene.add.sprite(-125, -50, AnimalSetting.LION.Icon);
        this.meatEater1.setScale(0.5);
        this.meatEater2 = scene.add.sprite(0, -50, AnimalSetting.BEAR.Icon);
        this.meatEater2.setScale(0.5);
        this.meatEater3 = scene.add.sprite(125, -50, AnimalSetting.FOX.Icon);
        this.meatEater3.setScale(0.5);

        this.eat2Text = scene.add.text(0, 50, "EAT", {
            fontSize: '48px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add the standard text and icon elements next
        this.subContainer2.add([this.meatTitleText, this.meatEater1, this.meatEater2, this.meatEater3, this.eat2Text]);

        const meatList = FoodSpriteLibrary[FoodTypes.MEAT];
        //const spacing = 125; // Define pixels between sprites

        meatList.forEach((texture, index) => {
            // Calculate centered position for the group of food sprites
            const totalWidth = (meatList.length - 1) * spacing;
            const xPos = (index * spacing) - (totalWidth / 2);

            const foodSprite = scene.add.sprite(xPos, 150, texture);
            foodSprite.setScale(0.4);

            // Food sprites are added LAST, ensuring they render on top of the panel
            this.subContainer2.add(foodSprite);
        });

        // Initialize the container
        this.subContainer3 = scene.add.container(0, 500);

        // Create and add the background panel FIRST so it renders at the bottom
        this.subContainer3Panel = scene.add.rectangle(0, 0, 600, 300, 0x222222, 1);
        this.subContainer3Panel.setStrokeStyle(4, 0xffffff);
        this.subContainer3.add(this.subContainer3Panel);

        this.trashTitleText = scene.add.text(0, -75, "DO NOT EAT", {
            fontSize: '48px', color: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add the standard text element next
        this.subContainer3.add(this.trashTitleText);

        const junkList = FoodSpriteLibrary[FoodTypes.JUNK];

        junkList.forEach((texture, index) => {
            // Calculate centered position for the group of junk sprites
            const totalWidth = (junkList.length - 1) * spacing;
            const xPos = (index * spacing) - (totalWidth / 2);

            const junkSprite = scene.add.sprite(xPos, 25, texture);
            junkSprite.setScale(0.4);

            // Junk sprites are added LAST, ensuring they render on top of the panel
            this.subContainer3.add(junkSprite);
        });

        this.addElements([this.titleText, ...this.homeBtn, this.subContainer1, this.subContainer2, this.subContainer3]);
    }
    onHide() {
        this.scene.spawnFruit();
    }

    createButton(x, y, text, onClick) {
        const bg = this.scene.add.rectangle(x, y, 200, 60, 0x00aa00, 1).setInteractive({ useHandCursor: true });
        bg.setScale(1.5);
        const label = this.scene.add.text(x, y, text, {
            fontSize: '28px', fontStyle: 'bold'
        }).setOrigin(0.5);
        label.setScale(1.5);

        bg.on('pointerdown', onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg, label];
    }
}