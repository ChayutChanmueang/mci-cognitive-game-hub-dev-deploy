export function measureTextWidth(scene, text, style) {
    const textStyle = {
        fontSize: `${style.labelFontSize + 12}px`,
        fontFamily: style.fontFamily,
        fontStyle: style.fontStyle,
        color: style.color,
    };
    const temp = scene.add.text(0, 0, text, textStyle).setVisible(false);
    const width = temp.width;
    temp.destroy();
    return width;
}

export function createInlineSentence(scene, x, y, maxWidth, maxHeight, textParts, blankWord, style, options = {}) {
    const container = scene.add.container(x, y);
    const objects = [];
    const gap = 8;
    const edgePadding = 6;
    const lineLimit = Math.max(1, maxWidth - edgePadding);
    const origin = normalizeOrigin(options.origin, { x: 0, y: 0.5 });
    const textPaddingTop = Math.ceil((style.quizTextSize || maxHeight) * 0.25);
    const textPaddingBottom = Math.ceil((style.quizTextSize || maxHeight) * 0.16);
    const fontSize = style.quizTextSize || maxHeight;
    const lineHeight = Math.max(maxHeight, fontSize + textPaddingTop + textPaddingBottom) + 24;
    const slot = [];
    const slotLabel = [];
    const quizTextStyle = {
        fontSize: `${fontSize}px`,
        fontFamily: style.fontFamily,
        fontStyle: style.fontStyle,
        color: style.color,
    };

    let cursorX = 0;
    let cursorY = 0;
    let lineIndex = 0;

    for (let i = 0; i < textParts.length; i++) {
        const part = textParts[i];
        const firstSegment = getWordSegments(part).find((segment) => segment.trim().length > 0) ?? "";
        const firstSegmentWidth = firstSegment ? measureTextWidth(scene, firstSegment.trimStart(), quizTextStyle) : 0;

        if (cursorX > 0 && firstSegmentWidth > lineLimit - cursorX) {
            cursorX = 0;
            cursorY += lineHeight;
            lineIndex += 1;
        }

        const partChunks = splitTextForLayout(scene, part, quizTextStyle, lineLimit, cursorX);

        for (let chunkIndex = 0; chunkIndex < partChunks.length; chunkIndex++) {
            const chunk = partChunks[chunkIndex];
            const chunkWidth = measureTextWidth(scene, chunk, style);

            if (cursorX + chunkWidth > lineLimit && cursorX > 0) {
                cursorX = 0;
                cursorY += lineHeight;
                lineIndex += 1;
            }

            const textObj = scene.add.text(
                cursorX + (chunkWidth * origin.x),
                cursorY + (maxHeight * (origin.y - 0.5)),
                chunk,
                quizTextStyle
            ).setOrigin(origin.x, origin.y);
            textObj.setPadding(0, textPaddingTop, 0, textPaddingBottom);
            textObj.setData("lineIndex", lineIndex);

            objects.push(textObj);
            cursorX += chunkWidth;

            if (chunkIndex < partChunks.length - 1) {
                cursorX = 0;
                cursorY += lineHeight;
                lineIndex += 1;
            } else {
                cursorX += gap;
            }
        }

        if (i + 1 < textParts.length) {
            const answerWidth = measureTextWidth(scene, blankWord.text, style);

            if (cursorX + answerWidth > lineLimit && cursorX > 0) {
                cursorX = 0;
                cursorY += lineHeight;
                lineIndex += 1;
            }

            const slotCenterX = cursorX + (answerWidth * origin.x);

            const rect = scene.add.rectangle(
                slotCenterX,
                cursorY + (maxHeight * (origin.y - 0.5)),
                answerWidth,
                maxHeight,
                0xffffff,
                0.15
            ).setOrigin(origin.x, origin.y).setStrokeStyle(3, 0xffffff);

            rect.setData("slotId", `slot-${i}`);
            rect.setData("lineIndex", lineIndex);

            const textStyle = {
                fontSize: `${style.labelFontSize}px`,
                fontFamily: style.fontFamily,
                fontStyle: style.fontStyle,
                color: style.color,
            };
            const hint = scene.add.text(cursorX + (answerWidth / 2), cursorY, blankWord.isRender ? blankWord.text : "", textStyle).setOrigin(0.5, 0.5);
            hint.setPadding(0, 8, 0, 4);
            hint.setData("slotId", `slot-${i}`);
            hint.setData("lineIndex", lineIndex);

            objects.push(rect, hint);
            slot.push(rect);
            slotLabel.push(hint);
            cursorX += answerWidth + gap;
        }
    }

    container.add(objects);
    applyContainerOrigin(container, objects, origin);

    return {container, slot, slotLabel};
}

function splitTextForLayout(scene, text, style, maxWidth, startX = 0) {
    if (!text) {
        return [""];
    }

    const chunks = [];
    const wordSegments = getWordSegments(text);
    let currentChunk = "";
    let availableWidth = Math.max(1, maxWidth - startX);

    for (const segment of wordSegments) {
        const candidate = currentChunk + segment;
        const candidateWidth = measureTextWidth(scene, candidate, style);

        if (candidateWidth <= availableWidth) {
            currentChunk = candidate;
            continue;
        }

        if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = "";
            availableWidth = maxWidth;
        }

        const segmentWidth = measureTextWidth(scene, segment, style);

        if (segmentWidth <= availableWidth) {
            currentChunk = segment.trimStart();
            continue;
        }

        const brokenSegments = breakSegmentByGrapheme(scene, segment, style, availableWidth, maxWidth);

        if (brokenSegments.length > 0) {
            chunks.push(...brokenSegments.slice(0, -1));
            currentChunk = brokenSegments[brokenSegments.length - 1];
            availableWidth = maxWidth;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks.length ? chunks : [text];
}

function getWordSegments(text) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
        return Array.from(
            new Intl.Segmenter("th", { granularity: "word" }).segment(text),
            ({ segment }) => segment
        );
    }

    return text.split(/(\s+)/).filter(Boolean);
}

function breakSegmentByGrapheme(scene, text, style, firstWidth, fullWidth) {
    const graphemes = typeof Intl !== "undefined" && Intl.Segmenter
        ? Array.from(new Intl.Segmenter("th", { granularity: "grapheme" }).segment(text), ({ segment }) => segment)
        : Array.from(text);
    const chunks = [];
    let currentChunk = "";
    let limit = firstWidth;

    for (const grapheme of graphemes) {
        const candidate = currentChunk + grapheme;
        const candidateWidth = measureTextWidth(scene, candidate, style);

        if (candidateWidth <= limit) {
            currentChunk = candidate;
            continue;
        }

        if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = grapheme;
            limit = fullWidth;
            continue;
        }

        chunks.push(grapheme);
        limit = fullWidth;
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

function normalizeOrigin(origin, fallback) {
    if (Array.isArray(origin)) {
        return {
            x: origin[0] ?? fallback.x,
            y: origin[1] ?? fallback.y
        };
    }

    if (typeof origin === "number") {
        return { x: origin, y: origin };
    }

    if (origin && typeof origin === "object") {
        return {
            x: origin.x ?? fallback.x,
            y: origin.y ?? fallback.y
        };
    }

    return fallback;
}

function applyContainerOrigin(container, objects, origin) {
    if (objects.length === 0) {
        return;
    }

    const bounds = container.getBounds();
    const localMinX = bounds.x - container.x;
    const localMinY = bounds.y - container.y;
    const offsetX = -(localMinX + (bounds.width * origin.x));
    const offsetY = -(localMinY + (bounds.height * origin.y));

    for (const object of objects) {
        object.x += offsetX;
        object.y += offsetY;
    }
}
