import Phaser from "phaser";
import Entity from "../entity";
import {BlankWord, Config} from "../../constants.js";
import {createInlineSentence} from "../../utils/auto-insert-layout.js";
import DragDropManager from "/src/core/drag-drop-manager.js";

export default class Quiz extends Entity{
    constructor(scene, x, y, id, textParts, answers, options, gameData, setting = {
        scaleSlot: {x:150, y:75},
        quizTextSize: 48.0,
        labelFontSize: 36.0,
        slotFontSize: 36.0,
        quizBoxSize: {width: 700, height:450},
    }){
        super(scene,x,y,null);

        this.id = id;
        this.scene = scene;
        this.options = options;
        this.gameData = gameData;
        this.textParts = textParts;
        this.answers = answers;
        this.scaleSlotX = setting.scaleSlot.x;
        this.scaleSlotY = setting.scaleSlot.y;
        this.slotFontSize = setting.slotFontSize;
        this.labelFontSize = setting.labelFontSize;
        this.quizTextSize = setting.quizTextSize;
        this.boxWidth = setting.quizBoxSize.width;
        this.boxHeight = setting.quizBoxSize.height;
        this.ownedContainer = scene.add.container(x, y);
        this.dragDrop = new DragDropManager(scene);
        this.onAnswerCorrect = () => {};
        this.onAnswerIncorrect = () => {};

        this.setScale(1.5);
        //this.refreshBody();
    }

    onCreateQuiz(){
        const quizBG = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.boxWidth,
            this.boxHeight,0x525252,1).setOrigin(0.5, 0.5);
        this.ownedContainer.add(quizBG);

        const bottonBG = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height,
            this.scene.scale.width,
            250,0xffffff,1).setOrigin(0.5, 1);
        this.ownedContainer.add(bottonBG);

        const textStyle = {
            quizTextSize: this.quizTextSize,
            labelFontSize: this.labelFontSize,
            fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
            fontStyle: "bold",
            color: "#ffffff",
        };

        const { container: quizText, slot: slot, slotLabel: slotLabel } = createInlineSentence(
            this.scene,
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.boxWidth - 225,
            this.scaleSlotY,
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

            const bg = this.scene.add.rectangle(0, 0, 200, this.scaleSlotY, 0xffffff, 0.15)
                .setStrokeStyle(2, 0xa1a1a1)
                .setOrigin(0.5);

            const label = this.scene.add.text(0, 0, word, {
                fontSize: `${this.slotFontSize}px`,
                fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
                fontStyle: "bold",
                color: "#000000"
            }).setOrigin(0.5);

            box.add([bg, label]);
            box.setSize(200, this.scaleSlotY);

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
            cellWidth: 250,
            cellHeight: 110,
            x: this.scene.scale.width / 2 - 350,
            y: this.scene.scale.height - 217,
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
                    this.gameData.answerLogs.push(data.word);

                    if (this.answers[slotIndex] === data.word) {
                        data.draggable.setVisible(false);
                        data.handle.disableInteractive();
                        slotLabel[i].setText(data.word);
                        slot[i].setData("filled", true);
                        slot[i].setStrokeStyle(3, 0x00ff00);
                        if (this.gameData) {
                            this.gameData.answers.push(data.word);
                            this.gameData.increaseScore(Config.IncreaseScore[this.scene.levelMap])
                        }

                        if (this.gameData.answers.length >= this.answers.length) {
                            this.gameData.id = this.id;
                            console.log(`Score: (${this.gameData.score})`);
                            this.onAnswerCorrect();
                        }
                    }else {
                        this.gameData.decreaseScore(Config.DecreaseScore[this.scene.levelMap])
                        this.dragDrop.moveHome(data.handle);
                        this.onAnswerIncorrect();
                        slot[i].setStrokeStyle(3, 0xfe0000);
                    }
                },
                onDragEnter: () => {
                    slot[i].setStrokeStyle(3, 0xfffb00);
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
