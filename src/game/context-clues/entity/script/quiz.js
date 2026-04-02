import Phaser from "phaser";
import Entity from "../entity";
import {BlankWord} from "../../constants.js";
import {createInlineSentence} from "../../utils/auto-insert-layout.js";
import DragDropManager from "/src/core/drag-drop-manager.js";

export default class Quiz extends Entity{
    constructor(scene, x, y, textParts, answers, options, gameData, scale = 1){
        super(scene,x,y,null);

        this.scene = scene;
        this.options = options;
        this.gameData = gameData;
        this.textParts = textParts;
        this.answers = answers;
        this.scale = scale;
        this.ownedContainer = scene.add.container(x, y);
        this.dragDrop = new DragDropManager(scene);
        this.onAnswerCorrect = () => {};

        this.setScale(1.5);
        //this.refreshBody();
    }

    onCreateQuiz(){
        const textStyle = {
            fontSize: "48px",
            fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
            fontStyle: "bold",
            color: "#ffffff",
        };

        const quizBG = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            700,
            400,0x525252,1).setOrigin(0.5, 0.5);
        this.ownedContainer.add(quizBG);

        const bottonBG = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height,
            this.scene.scale.width,
            250,0xffffff,1).setOrigin(0.5, 1);
        this.ownedContainer.add(bottonBG);

        const { container: quizText, slot: slot, slotLabel: slotLabel } = createInlineSentence(
            this.scene,
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            600,
            50,
            this.textParts,
            BlankWord,
            textStyle,
            {
                origin: { x: 0.5, y: 0.5 }
            });
        this.scene.quizText = quizText;
        this.ownedContainer.add(quizText);

        this.scene.quizText.setDepth(100);
        this.answerBoxes = [];

        const items = this.options.map((word) => {
            const box = this.scene.add.container(0, 0);
            this.ownedContainer.add(box);

            const bg = this.scene.add.rectangle(0, 0, 140, 60, 0xffffff, 0.15)
                .setStrokeStyle(2, 0xa1a1a1)
                .setOrigin(0.5);

            const label = this.scene.add.text(0, 0, word, {
                fontSize: "28px",
                fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
                fontStyle: "bold",
                color: "#000000"
            }).setOrigin(0.5);

            box.add([bg, label]);
            box.setSize(140, 60);

            this.dragDrop.registerDraggable({
                handle: bg,
                target: box,
                data: { word: word, handle: bg, draggable: box },
                returnOnMiss: true,
                snapOnDrop: false,
                onDrop: ({ handle }) => {

                },
                onInvalidDrop: () => {
                    bg.setStrokeStyle(2, 0xff6666);
                    this.scene.time.delayedCall(120, () => {
                        bg.setStrokeStyle(2, 0xa1a1a1);
                    });
                }
            });

            this.answerBoxes.push({ box, bg });

            return box;
        });

        Phaser.Actions.GridAlign(items, {
            width: 3,
            cellWidth: 200,
            cellHeight: 120,
            x: this.scene.scale.width / 2 - 275,
            y: this.scene.scale.height - 215,
            position: Phaser.Display.Align.TOP_LEFT
        });

        for (const answerBox of this.answerBoxes) {
            this.dragDrop.setHome(answerBox.bg, answerBox.box.x, answerBox.box.y);
        }

        for (let i = 0; i < slot.length; i++) {
            this.dragDrop.registerDropZone({
                zone: slot[i],
                id: `slot-${i}`,
                snapTarget: slot[i],
                accepts: () => !slot[i].getData("filled"),
                onDrop: ({ data }) => {
                    const slotIndex = i;

                    console.log(`Check answer: ${this.answers[slotIndex]} | ${data.word}`);
                    if (this.answers[slotIndex] === data.word) {
                        data.draggable.setVisible(false);
                        data.handle.disableInteractive();
                        slotLabel[i].setText(data.word);
                        slot[i].setData("filled", true);
                        if (this.gameData) {
                            this.gameData.answers.push(data.word);
                        }

                        if (this.gameData.answers.length >= this.answers.length) {
                            this.onAnswerCorrect();
                        }
                    }else {
                        this.dragDrop.moveHome(data.handle);
                    }
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
        if(this.dragDrop){
            this.dragDrop.destroy();
            this.dragDrop = null;
        }
        if(this.ownedContainer){
            this.ownedContainer.destroy(true);
            this.ownedContainer = null;
        }
        super.destroy();
        if(this.onDestroy){
            this.onDestroy();
        }
    }
}
