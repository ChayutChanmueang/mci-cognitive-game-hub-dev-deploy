export function measureTextWidth(scene, text, style) {
    const temp = scene.add.text(0, 0, text, style).setVisible(false);
    const width = temp.width;
    temp.destroy();
    return width;
}

export function createInlineSentence(scene, x, y, maxWidth, maxHeight, textParts, blankWord, style) {
    const container = scene.add.container(x, y);
    const objects = [];
    const gap = 8;
    const textPaddingTop = Math.ceil((Number.parseFloat(style.fontSize) || maxHeight) * 0.25);
    const textPaddingBottom = Math.ceil((Number.parseFloat(style.fontSize) || maxHeight) * 0.16);
    const fontSize = Number.parseFloat(style.fontSize) || maxHeight;
    const lineHeight = Math.max(maxHeight, fontSize + textPaddingTop + textPaddingBottom) + 24;

    let cursorX = 0;
    let cursorY = 0;
    let lineIndex = 0;

    for (let i = 0; i < textParts.length; i++) {
        const part = textParts[i];
        const partWidth = measureTextWidth(scene, part, style);

        if (cursorX + partWidth > maxWidth && cursorX > 0) {
            cursorX = 0;
            cursorY += lineHeight;
            lineIndex += 1;
        }

        const textObj = scene.add.text(cursorX + (partWidth / 2), cursorY, part, style).setOrigin(0.5, 0.5);
        textObj.setPadding(0, textPaddingTop, 0, textPaddingBottom);
        textObj.setData("lineIndex", lineIndex);

        objects.push(textObj);
        cursorX += partWidth + gap;

        if (i + 1 < textParts.length) {
            const answerWidth = measureTextWidth(scene, blankWord.text, style);

            if (cursorX + answerWidth > maxWidth && cursorX > 0) {
                cursorX = 0;
                cursorY += lineHeight;
                lineIndex += 1;
            }

            const slotCenterX = cursorX + (answerWidth / 2);

            const rect = scene.add.rectangle(
                slotCenterX,
                cursorY,
                answerWidth,
                maxHeight,
                0xffffff,
                0.15
            ).setOrigin(0.5, 0.5).setStrokeStyle(3, 0xffffff);

            rect.setData("slotId", `slot-${i}`);
            rect.setData("lineIndex", lineIndex);

            const hint = scene.add.text(slotCenterX, cursorY, blankWord.isRender ? blankWord.text : "", {
                ...style,
                fontSize: "28px",
                color: "#ffff99"
            }).setOrigin(0.5, 0.5);
            hint.setPadding(0, 8, 0, 4);
            hint.setData("slotId", `slot-${i}`);
            hint.setData("lineIndex", lineIndex);

            objects.push(rect, hint);
            cursorX += answerWidth + gap;
        }
    }

    container.add(objects);

    return container;
}
