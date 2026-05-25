export function measureTextWidth(scene, text, style) {
    const temp = scene.add.text(0, 0, text, normalizeTextStyle(style)).setVisible(false);
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
    const quizTextStyle = normalizeTextStyle(style, "quiz");
    const labelTextStyle = normalizeTextStyle(style, "label");
    const fontSize = parseFontSize(quizTextStyle.fontSize, maxHeight);
    const textPaddingTop = Math.ceil(fontSize * 0.25);
    const textPaddingBottom = Math.ceil(fontSize * 0.16);
    const lineHeight = Math.max(maxHeight, fontSize + textPaddingTop + textPaddingBottom) + 24;
    const minSlotWidth = Math.max(0, Number(style.slotWidth) || 0);
    const slotStrokeColor = style.slotStrokeColor ?? 0xffffff;
    const slotStrokeWidth = style.slotStrokeWidth ?? 3;
    const slotFillColor = style.slotFillColor ?? 0xffffff;
    const slotFillAlpha = style.slotFillAlpha ?? 0.15;
    const slot = [];
    const slotLabel = [];
    const slotBorder = [];

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
            const chunkWidth = measureTextWidth(scene, chunk, quizTextStyle);

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
            const answerWidth = Math.max(
                minSlotWidth,
                measureTextWidth(scene, blankWord.text || " ", labelTextStyle)
            );

            if (cursorX + answerWidth > lineLimit && cursorX > 0) {
                cursorX = 0;
                cursorY += lineHeight;
                lineIndex += 1;
            }

            const slotCenterX = cursorX + (answerWidth * origin.x);

            // Dashed border visual — canvas texture (white dashes), tinted to slotStrokeColor
            const borderTexKey = createDashedSlotTexture(scene, answerWidth, maxHeight, slotStrokeWidth);
            const borderImg = scene.add.image(
                slotCenterX,
                cursorY + (maxHeight * (origin.y - 0.5)),
                borderTexKey
            ).setOrigin(origin.x, origin.y).setTint(slotStrokeColor);

            // Drop zone rect — invisible, used only for DragDrop interaction
            const rect = scene.add.rectangle(
                slotCenterX,
                cursorY + (maxHeight * (origin.y - 0.5)),
                answerWidth,
                maxHeight,
                slotFillColor,
                slotFillAlpha
            ).setOrigin(origin.x, origin.y);

            rect.setData("slotId", `slot-${i}`);
            rect.setData("lineIndex", lineIndex);

            const hint = scene.add.text(
                cursorX + (answerWidth / 2),
                cursorY,
                blankWord.isRender ? blankWord.text : "",
                labelTextStyle
            ).setOrigin(0.5, 0.5);
            hint.setPadding(0, 8, 0, 4);
            hint.setData("slotId", `slot-${i}`);
            hint.setData("lineIndex", lineIndex);

            objects.push(borderImg, rect, hint);
            slot.push(rect);
            slotLabel.push(hint);
            slotBorder.push(borderImg);
            cursorX += answerWidth + gap;
        }
    }

    container.add(objects);
    applyContainerOrigin(container, objects, origin);
    fitContainerToLayoutBounds(container, {
        maxWidth,
        maxHeight: options.maxLayoutHeight,
        minScale: options.minScale,
        enabled: options.fitToBounds,
    });

    return {container, slot, slotLabel, slotBorder};
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

function normalizeTextStyle(style, kind = "quiz") {
    const fallbackFontSize = kind === "label"
        ? (style.labelFontSize ?? 28)
        : (style.quizTextSize ?? style.fontSize ?? 48);
    const fontSize = typeof fallbackFontSize === "number"
        ? `${fallbackFontSize}px`
        : `${parseFontSize(fallbackFontSize, kind === "label" ? 28 : 48)}px`;

    return {
        fontSize,
        fontFamily: style.fontFamily,
        fontStyle: style.fontStyle,
        color: style.color
    };
}

function parseFontSize(fontSize, fallback) {
    if (typeof fontSize === "number") {
        return fontSize;
    }

    const parsed = Number.parseFloat(fontSize);

    return Number.isFinite(parsed) ? parsed : fallback;
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

// Creates a canvas texture of a dashed rounded rectangle using white strokes.
// Tint the resulting image to apply any color — white base allows full tint control.
function createDashedSlotTexture(scene, width, height, strokeWidth) {
    const w = Math.ceil(width);
    const h = Math.ceil(height);
    const key = `dashed-slot-${w}-${h}-${strokeWidth}`;

    if (scene.textures.exists(key)) {
        return key;
    }

    const tex = scene.textures.createCanvas(key, w, h);
    const ctx = tex.getContext();
    const inset = strokeWidth / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.setLineDash([10, 7]);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, 10);
    ctx.stroke();

    tex.refresh();
    return key;
}

function fitContainerToLayoutBounds(container, {
    maxWidth,
    maxHeight,
    minScale = 0.1,
    enabled = false,
} = {}) {
    if (!enabled) {
        return;
    }

    const parsedMaxWidth = Number(maxWidth);
    const parsedMaxHeight = Number(maxHeight);
    const bounds = container.getBounds();
    const widthScale = Number.isFinite(parsedMaxWidth) && parsedMaxWidth > 0 && bounds.width > 0
        ? parsedMaxWidth / bounds.width
        : 1;
    const heightScale = Number.isFinite(parsedMaxHeight) && parsedMaxHeight > 0 && bounds.height > 0
        ? parsedMaxHeight / bounds.height
        : 1;
    const parsedMinScale = Number.isFinite(Number(minScale))
        ? Math.min(1, Math.max(0.1, Number(minScale)))
        : 0.1;
    const nextScale = Math.max(parsedMinScale, Math.min(1, widthScale, heightScale));

    container.setScale(nextScale);
}
