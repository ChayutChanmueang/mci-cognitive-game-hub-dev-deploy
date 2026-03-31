export const THAI_FONT_FAMILY = '"Noto Sans Thai", "Sarabun", "Prompt", "Kanit", "Leelawadee UI", sans-serif';

export const ThaiTextPresets = Object.freeze({
  menuTitle: Object.freeze({
    fontSize: "96px",
    fontStyle: "bold"
  }),
  gameplayTitle: Object.freeze({
    fontSize: "72px",
    fontStyle: "bold",
    align: "center"
  }),
  panelTitle: Object.freeze({
    fontSize: "48px",
    fontStyle: "bold"
  }),
  panelBody: Object.freeze({
    fontSize: "48px",
    fontStyle: "bold"
  }),
  buttonLabel: Object.freeze({
    fontSize: "28px",
    fontStyle: "bold"
  }),
  hud: Object.freeze({
    fontSize: "64px",
    fontStyle: "bold"
  })
});

const wordSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter("th", { granularity: "word" })
  : null;

const graphemeSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter("th", { granularity: "grapheme" })
  : null;

export function createThaiText(scene, x, y, text, style = {}, options = {}) {
  const textObject = scene.add.text(x, y, text, getThaiTextStyle(style));

  applyThaiTextSupport(textObject, options);

  if (options.origin !== undefined) {
    if (Array.isArray(options.origin)) {
      textObject.setOrigin(options.origin[0], options.origin[1]);
    } else {
      textObject.setOrigin(options.origin);
    }
  }

  return textObject;
}

export function getThaiTextStyle(style = {}) {
  return {
    fontFamily: THAI_FONT_FAMILY,
    ...style
  };
}

export function applyThaiTextSupport(textObject, options = {}) {
  const fontSize = parseFontSize(textObject.style.fontSize);
  const padding = options.padding ?? getDefaultPadding(fontSize);
  const lineSpacing = options.lineSpacing ?? getDefaultLineSpacing(textObject.text, options.wrapWidth, fontSize);

  textObject.setPadding(padding);
  textObject.setLineSpacing(lineSpacing);

  if (options.wrapWidth) {
    textObject.setWordWrapCallback((text) => wrapThaiText(text, textObject, options.wrapWidth));
  }

  return textObject;
}

export function wrapThaiText(text, textObject, maxWidth) {
  const lines = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const segments = segmentWords(rawLine);

    if (!segments.length) {
      lines.push("");
      continue;
    }

    let currentLine = "";

    for (const segment of segments) {
      const nextSegment = currentLine ? segment : segment.trimStart();

      if (!nextSegment) {
        continue;
      }

      const candidateLine = currentLine + nextSegment;

      if (currentLine && textObject.context.measureText(candidateLine).width > maxWidth) {
        lines.push(currentLine.trimEnd());

        if (textObject.context.measureText(nextSegment).width > maxWidth) {
          const brokenSegments = breakLongSegment(nextSegment, textObject, maxWidth);

          lines.push(...brokenSegments.slice(0, -1));
          currentLine = brokenSegments[brokenSegments.length - 1] ?? "";
        } else {
          currentLine = nextSegment;
        }

        continue;
      }

      if (!currentLine && textObject.context.measureText(nextSegment).width > maxWidth) {
        const brokenSegments = breakLongSegment(nextSegment, textObject, maxWidth);

        lines.push(...brokenSegments.slice(0, -1));
        currentLine = brokenSegments[brokenSegments.length - 1] ?? "";
        continue;
      }

      currentLine = candidateLine;
    }

    if (currentLine) {
      lines.push(currentLine.trimEnd());
    }
  }

  return lines.length ? lines : [""];
}

function segmentWords(text) {
  if (!text) {
    return [];
  }

  if (wordSegmenter) {
    return Array.from(wordSegmenter.segment(text), ({ segment }) => segment);
  }

  return text.split(/(\s+)/).filter(Boolean);
}

function breakLongSegment(text, textObject, maxWidth) {
  const graphemes = graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment)
    : Array.from(text);
  const segments = [];
  let currentSegment = "";

  for (const grapheme of graphemes) {
    const candidateSegment = currentSegment + grapheme;

    if (currentSegment && textObject.context.measureText(candidateSegment).width > maxWidth) {
      segments.push(currentSegment);
      currentSegment = grapheme;
      continue;
    }

    currentSegment = candidateSegment;
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

function parseFontSize(fontSize) {
  const parsed = Number.parseFloat(fontSize);

  return Number.isFinite(parsed) ? parsed : 32;
}

function getDefaultPadding(fontSize) {
  return {
    left: Math.max(6, Math.ceil(fontSize * 0.08)),
    right: Math.max(6, Math.ceil(fontSize * 0.08)),
    top: Math.max(10, Math.ceil(fontSize * 0.35)),
    bottom: Math.max(8, Math.ceil(fontSize * 0.22))
  };
}

function getDefaultLineSpacing(text, wrapWidth, fontSize) {
  if (!wrapWidth && !text.includes("\n")) {
    return 0;
  }

  return Math.max(6, Math.ceil(fontSize * 0.14));
}
