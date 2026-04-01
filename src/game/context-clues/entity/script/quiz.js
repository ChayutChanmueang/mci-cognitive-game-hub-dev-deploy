import Entity from "../entity";
import {BlankWord} from "../../constants.js";
import {createInlineSentence} from "../../utils/auto-insert-layout.js";
import DragDropManager from "/src/core/drag-drop-manager.js";

export default class Quiz extends Entity{
    constructor(scene,x,y,textParts,answers, gameData, scale = 1){
        super(scene,x,y,null);

        this.scale = scale;
        this.ownedContainer = scene.add.container(x, y);
        this.dragDrop = new DragDropManager(this);

        this.setScale(1.5);
        //this.refreshBody();

        const textStyle = {
            fontSize: "48px",
            fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
            fontStyle: "bold",
            color: "#ffffff",
        };

        const quizBG = scene.add.rectangle(
            scene.scale.width / 2,
            scene.scale.height / 2,
            700,
            400,0x525252,1).setOrigin(0.5, 0.5);
        this.ownedContainer.add(quizBG);

        const bottonBG = scene.add.rectangle(
            scene.scale.width / 2,
            scene.scale.height,
            scene.scale.width,
            250,0xffffff,1).setOrigin(0.5, 1);
        this.ownedContainer.add(bottonBG);

        const { container: quizText, slot: slot, slotLabel: slotLabel } = createInlineSentence(
            scene,
            scene.scale.width / 2,
            scene.scale.height / 2,
            600,
            50,
            textParts,
            BlankWord,
            textStyle,
            {
                origin: { x: 0.5, y: 0.5 }
            });
        scene.quizText = quizText;
        this.ownedContainer.add(quizText);

        scene.quizText.setDepth(100);

        const items = answers.map((word) => {
            const box = scene.add.container(0, 0);
            this.ownedContainer.add(box);

            const bg = scene.add.rectangle(0, 0, 140, 60, 0xffffff, 0.15)
                .setStrokeStyle(2, 0xa1a1a1)
                .setOrigin(0.5);
            this.ownedContainer.add(box);

            const label = scene.add.text(0, 0, word, {
                fontSize: "28px",
                fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
                fontStyle: "bold",
                color: "#000000"
            }).setOrigin(0.5);
            this.ownedContainer.add(label);

            box.add([bg, label]);

            bg.setInteractive({ draggable: true });
            scene.input.setDraggable(bg);

            bg.on("drag", (pointer, dragX, dragY) => {
                box.x = dragX;
                box.y = dragY;
            });

            return box;
        });

        Phaser.Actions.GridAlign(items, {
            width: 3,
            cellWidth: 200,
            cellHeight: 120,
            x: scene.scale.width / 2 - 200,
            y: scene.scale.height - 175,
            position: Phaser.Display.Align.TOP_LEFT
        });

        for (let i = 0; i < slot.length; i++) {
            this.dragDrop.registerDropZone({
                zone: slot[i],
                id: `slot-${i}`,
                snapTarget: slot[i],
                accepts: ({ data }) => data.word === "หวาน",
                onDrop: ({ data }) => {
                    slotLabel[i].setText(data.word);

                },
                onDragEnter: () => {
                    slot[i].setStrokeStyle(3, 0x00ff00);
                },
                onDragLeave: () => {
                    slot[i].setStrokeStyle(3, 0xffffff);
                }
            });
        }
    }
    destroy(){
        super.destroy();
        if(this.onDestroy){
            this.ownedContainer.destroy(true);
            this.onDestroy();
        }
    }
}