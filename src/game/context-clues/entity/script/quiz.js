import Phaser from "phaser";
import Entity from "../entity";
import {BlankWord, Config} from "../../constants.js";
import {createInlineSentence} from "../../utils/auto-insert-layout.js";
import DragDropManager from "/src/core/drag-drop-manager.js";
import { createThaiText, getThaiFontFamily } from "../../../../util/thai-text.js";
import { ShadowRoundedPanel } from "../../../../util/layout/index.js";

export default class Quiz extends Entity{
    constructor(scene, x, y, id, textParts, answers, options, gameData, setting = {
        scaleSlot: {x:150, y:75},
        quizTextSize: 42.0,
        labelFontSize: 38.0,
        slotFontSize: 38.0,
        slotWidth: 240,
    }, quizBoxSize = {
        width: 700,
        height:650
    }, paddingBoxQuestion = {
        paddingX: 32,
        paddingY: 32,
    }){
        super(scene,x,y,null);

        this.setVisible(false);

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
        this.slotWidth = setting.slotWidth ?? setting.scaleSlot.x;
        // Answer choice box: visible size, plus an independently tunable collision
        // (hit) area + offset (US-E7-23). Falls back to the previous hardcoded values
        // and to the visible size when hitArea/hitOffset are not configured.
        this.answerBoxSize = setting.answerBox?.size ?? { x: 455, y: 145 };
        this.answerHitArea = setting.answerBox?.hitArea ?? this.answerBoxSize;
        this.answerHitOffset = setting.answerBox?.hitOffset ?? { x: 0, y: 0 };
        // Blank "วางคำ" drop slot in the sentence: configurable visible size, an
        // independently tunable drop/collision area, and a position offset (US-E7-23).
        // Passed straight through to createInlineSentence via textStyle below.
        this.blankSlot = setting.blankSlot ?? null;
        this.boxWidth = quizBoxSize.width;
        this.boxHeight = quizBoxSize.height;
        this.boxPaddingX = paddingBoxQuestion.paddingX;
        this.boxPaddingY = paddingBoxQuestion.paddingY;
        this.ownedContainer = scene.add.container(x, y);
        this.ownedContainer.setDepth(20);
        this.dragDrop = new DragDropManager(scene);
        this.onAnswerItemCorrect = (answer) => {};
        this.onAnswerCorrect = (answer) => {};
        this.onAnswerIncorrect = (answer) => {};

        this.setScale(1.5);
        //this.refreshBody();
    }

    onCreateQuiz(){
        const sceneWidth = this.scene.scale.width;
        const sceneHeight = this.scene.scale.height;
        const bottomPanelHeight = 590;
        const questionPanel = this.getQuestionPanelLayout(sceneWidth);

        const quizBG = new ShadowRoundedPanel(
            this.scene,
            questionPanel.x,
            questionPanel.y,
            questionPanel.width,
            questionPanel.height,
            {
                fillColor: 0xffffff,
                fillAlpha: 0.98,
                strokeColor: 0xffb0ca,
                strokeWidth: 6,
                radius: 54,
                depth: 10,
                shadows: [
                    {
                        offsetY: 22,
                        spread: 6,
                        color: 0x6c214b,
                        alpha: 0.1
                    },
                    {
                        offsetY: 12,
                        color: 0x6c214b,
                        alpha: 0.24
                    }
                ]
            }
        );
        this.ownedContainer.add(quizBG);

        // Bottom answer area overlay — black fade (#000000) to visually separate the answer choices from the question
        const bottonBG = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height,
            this.scene.scale.width,
            bottomPanelHeight,
            0x000000,
            0.1
        ).setOrigin(0.5, 1);
        this.ownedContainer.add(bottonBG);

        const textStyle = {
            quizTextSize: this.quizTextSize,
            labelFontSize: this.labelFontSize,
            slotWidth: this.slotWidth,
            blankSlot: this.blankSlot,
            slotStrokeColor: 0xffb0ca,
            slotStrokeWidth: 6,
            slotFillColor: 0xffffff,
            slotFillAlpha: 0,
            fontFamily: getThaiFontFamily(),
            fontStyle: "bold",
            color: "#7a4699",
        };

        const { container: quizText, slot, slotLabel, slotBorder } = createInlineSentence(
            this.scene,
            questionPanel.x,
            questionPanel.y,
            questionPanel.contentWidth,
            this.scaleSlotY,
            this.textParts,
            { ...BlankWord, text: "", isRender: false },
            textStyle,
            {
                origin: { x: 0.5, y: 0.5 },
                // Keeps long wrapped sentences inside the white question panel.
                fitToBounds: true,
                maxLayoutHeight: questionPanel.contentHeight,
                minScale: 0.1,
            });
        this.scene.quizText = quizText;
        this.ownedContainer.add(quizText);

        this.scene.quizText.setDepth(100);
        const instructionY = Math.min(
            questionPanel.y + (questionPanel.height / 2) + 82,
            sceneHeight - bottomPanelHeight - 56
        );
        const dragInstruction = createThaiText(
            this.scene,
            sceneWidth / 2,
            instructionY,
            `${Config.defaultGuide}`,
            {
                fontSize: `${Config.fontSize_Guide}`,
                fontFamily: getThaiFontFamily(),
                fontStyle: "bold",
                color: "#ffffff",
                stroke: "#cc4177",
                strokeThickness: 3,
                align: "center",
            },
            { origin: 0.5 }
        );
        dragInstruction.setShadow(0, 4, "rgba(108, 33, 75, 0.35)", 6);
        dragInstruction.setDepth(100);
        this.ownedContainer.add(dragInstruction);

        this.answerBoxes = [];
        const choiceWidth = this.answerBoxSize.x;
        const choiceHeight = this.answerBoxSize.y;
        const choiceGapX = 62;
        const choiceGapY = 62;
        const choiceTopY = sceneHeight - bottomPanelHeight + 150;
        const choiceColor = 0xffffff;
        const choiceTextColor = "#b967df";

        const items = this.options.map((word) => {
            const box = this.scene.add.container(0, 0);
            this.ownedContainer.add(box);

            const card = this.scene.add.graphics();
            this.drawChoiceCard(card, choiceWidth, choiceHeight, 8, 0xffffff, 0xffb0ca);

            // Invisible rectangle used purely as the drag handle + grab/collision area.
            // Sized to answerHitArea (≥ the visible card) and nudged by answerHitOffset,
            // so the tap target can be widened without changing the card's look (US-E7-23).
            const bg = this.scene.add.rectangle(this.answerHitOffset.x, this.answerHitOffset.y, this.answerHitArea.x, this.answerHitArea.y, choiceColor, 0.001)
                .setStrokeStyle(6, 0xffb0ca, 0)
                .setOrigin(0.5);

            const label = createThaiText(this.scene, 0, 0, word, {
                fontSize: `${this.slotFontSize}px`,
                fontFamily: getThaiFontFamily(),
                fontStyle: "bold",
                color: choiceTextColor,
                align: "center"
            }, { origin: 0.5, wrapWidth: choiceWidth - 60 });

            box.add([card, bg, label]);
            box.setSize(choiceWidth, choiceHeight);

            this.dragDrop.registerDraggable({
                handle: bg,
                target: box,
                data: { word: word, handle: bg, draggable: box },
                returnOnMiss: true,
                snapOnDrop: false,
                onDrop: ({ handle }) => {

                },
                onInvalidDrop: () => {
                    this.drawChoiceCard(card, choiceWidth, choiceHeight, 8, 0xffffff, 0xff6666);
                    this.scene.time.delayedCall(120, () => {
                        this.drawChoiceCard(card, choiceWidth, choiceHeight, 8, 0xffffff, 0xffffff);
                    });
                }
            });

            this.answerBoxes.push({ box, bg });

            return box;
        });

        this.layoutAnswerChoices(items, {
            sceneWidth,
            choiceWidth,
            choiceHeight,
            choiceGapX,
            choiceGapY,
            choiceTopY,
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
                        slotBorder[i].setTint(0x00ff00); // correct answer — green tint
                        if (this.gameData) {
                            this.gameData.answers.push(data.word);
                            this.gameData.increaseScore(Config.IncreaseScore[this.scene.levelMap])
                        }
                        this.onAnswerItemCorrect(data.word);

                        if (this.gameData.answers.length >= this.answers.length) {
                            this.gameData.id = this.id;
                            console.log(`Score: (${this.gameData.score})`);
                            this.onAnswerCorrect(data.word);
                        }
                    }else {
                        this.gameData.decreaseScore(Config.DecreaseScore[this.scene.levelMap])
                        this.dragDrop.moveHome(data.handle);
                        this.onAnswerIncorrect(data.word);
                        slotBorder[i].setTint(0xfe0000); // wrong answer — red tint, then reset
                        this.scene.time.delayedCall(300, () => slotBorder[i].setTint(0xffb0ca));
                    }
                },
                onDragEnter: () => {
                    slotBorder[i].setTint(0x4287f5); // drag hover — blue tint
                },
                onDragLeave: () => {
                    slotBorder[i].setTint(0xffb0ca); // reset to default pink
                }
            });
        }
    }

    getQuestionPanelLayout(sceneWidth) {
        // The white question panel is controlled by QuizUI_Setting.quizBoxSize.
        // width/height: visible panel size.
        // y: vertical center of the panel on the Phaser canvas.
        // paddingX/paddingY: inner safe area for sentence text and blank slots.
        // contentWidth/contentHeight: available area before text auto-scales down.
        const width = this.boxWidth;
        const height = this.boxHeight;
        const paddingX = this.boxPaddingX;
        const paddingY = this.boxPaddingY;

        return {
            x: sceneWidth / 2,
            y: 815,
            width,
            height,
            contentWidth: Math.max(1, width - (paddingX * 2)),
            contentHeight: Math.max(1, height - (paddingY * 2)),
        };
    }

    drawChoiceCard(graphics, width, height, strokeSize, fillColor = 0xffffff, strokeColor = 0xffffff) {
        graphics.clear();
        graphics.fillStyle(fillColor, 1);
        graphics.lineStyle(strokeSize, strokeColor, 1);
        graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 46);
        graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 46);
    }

    layoutAnswerChoices(items, {
        sceneWidth,
        choiceWidth,
        choiceHeight,
        choiceGapX,
        choiceGapY,
        choiceTopY,
    }) {
        const centerX = sceneWidth / 2;

        if (items.length === 3) {
            items[0].setPosition(centerX, choiceTopY);
            items[1].setPosition(centerX - (choiceWidth + choiceGapX) / 2, choiceTopY + choiceHeight + choiceGapY);
            items[2].setPosition(centerX + (choiceWidth + choiceGapX) / 2, choiceTopY + choiceHeight + choiceGapY);
            return;
        }

        const columnCount = Math.min(2, Math.max(1, items.length));
        const rowCount = Math.ceil(items.length / columnCount);
        const totalHeight = (rowCount * choiceHeight) + ((rowCount - 1) * choiceGapY);
        const startY = choiceTopY + (items.length <= 2 ? (choiceHeight + choiceGapY) / 2 : 0);

        items.forEach((item, index) => {
            const row = Math.floor(index / columnCount);
            const column = index % columnCount;
            const itemsInRow = row === rowCount - 1
                ? items.length - (row * columnCount)
                : columnCount;
            const rowWidth = (itemsInRow * choiceWidth) + ((itemsInRow - 1) * choiceGapX);
            const x = centerX - (rowWidth / 2) + (choiceWidth / 2) + (column * (choiceWidth + choiceGapX));
            const y = startY + (row * (choiceHeight + choiceGapY));

            item.setPosition(x, y);
        });
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
