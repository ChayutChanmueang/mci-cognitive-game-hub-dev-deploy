export let THAI_FONT_FAMILY = '"Noto Sans Thai Looped", sans-serif';

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

const GOOGLE_FONTS_CSS_API = "https://fonts.googleapis.com/css2";
const loadedGoogleFontStylesheets = new Set();
const googleFontReadyPromises = new Map();

const wordSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter("th", { granularity: "word" })
  : null;

const graphemeSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter("th", { granularity: "grapheme" })
  : null;

export function getThaiFontFamily() {
  return THAI_FONT_FAMILY;
}

export function setThaiFontFamily(fontFamily, fallbacks = ["sans-serif"]) {
  const normalized = String(fontFamily ?? "").trim();

  if (!normalized) {
    throw new Error("fontFamily is required");
  }

  THAI_FONT_FAMILY = normalized.includes(",")
    ? normalized
    : createFontFamilyStack(normalized, fallbacks);

  return THAI_FONT_FAMILY;
}

export async function loadGoogleFont(fontName, options = {}) {
  const normalizedName = normalizeGoogleFontName(fontName);
  await ensureGoogleFontAvailable(normalizedName, options);

  return createFontFamilyStack(normalizedName, options.fallbacks ?? ["sans-serif"]);
}

export async function setThaiGoogleFont(fontName, options = {}) {
  THAI_FONT_FAMILY = await loadGoogleFont(fontName, options);
  return THAI_FONT_FAMILY;
}

export async function ensureThaiFontLoaded(options = {}) {
  const requestedName = typeof options.fontName === "string"
    ? options.fontName
    : extractPrimaryFontName(THAI_FONT_FAMILY);

  if (!requestedName || isGenericFontFamily(requestedName)) {
    return THAI_FONT_FAMILY;
  }

  await ensureGoogleFontAvailable(requestedName, options);
  return THAI_FONT_FAMILY;
}

export function createThaiText(scene, x, y, text, style = {}, options = {}) {
  const textStyle = getThaiTextStyle(style);
  const textObject = scene.add.text(x, y, text, textStyle);

  applyThaiTextSupport(textObject, options);

  if (options.origin !== undefined) {
    if (Array.isArray(options.origin)) {
      textObject.setOrigin(options.origin[0], options.origin[1]);
    } else {
      textObject.setOrigin(options.origin);
    }
  }

  applyDeferredGoogleFont(textObject, textStyle.fontFamily, options.googleFont);

  return textObject;
}

export function getThaiTextStyle(style = {}) {
  const styleObject = style && typeof style === "object" ? style : {};
  const { fontFamily, ...restStyle } = styleObject;
  const resolvedFontFamily = resolveFontFamily(fontFamily);

  return {
    ...restStyle,
    fontFamily: resolvedFontFamily
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

function resolveFontFamily(fontFamily) {
  if (typeof fontFamily !== "string") {
    return THAI_FONT_FAMILY;
  }

  const normalized = fontFamily.trim();
  return normalized ? normalized : THAI_FONT_FAMILY;
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

function normalizeGoogleFontName(fontName) {
  const normalized = String(fontName ?? "").trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error("Google font name is required");
  }

  return normalized;
}

function buildGoogleFontCssUrl(fontName, weights = [], display = "swap") {
  const familyQuery = buildGoogleFontFamilyQuery(fontName, weights);
  const encodedFamily = encodeURIComponent(familyQuery).replace(/%20/g, "+");
  const encodedDisplay = encodeURIComponent(display || "swap");
  return `${GOOGLE_FONTS_CSS_API}?family=${encodedFamily}&display=${encodedDisplay}`;
}

function buildGoogleFontFamilyQuery(fontName, weights) {
  const encodedName = fontName.replace(/\s+/g, " ").trim();
  const normalizedWeights = normalizeWeights(weights);

  if (!normalizedWeights.length) {
    return encodedName;
  }

  return `${encodedName}:wght@${normalizedWeights.join(";")}`;
}

function normalizeWeights(weights) {
  const source = Array.isArray(weights) ? weights : [weights];
  const values = source
    .map((weight) => Number.parseInt(weight, 10))
    .filter((weight) => Number.isFinite(weight) && weight > 0);

  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function extractPrimaryFontName(fontFamilyStack) {
  const stack = String(fontFamilyStack ?? "").trim();

  if (!stack) {
    return "";
  }

  const firstToken = stack.split(",")[0]?.trim() ?? "";
  const unquoted = firstToken.replace(/^['"]|['"]$/g, "").trim();
  return unquoted;
}

function createFontFamilyStack(primaryFont, fallbacks = ["sans-serif"]) {
  const normalizedPrimary = normalizeFontToken(primaryFont);
  const fallbackList = Array.isArray(fallbacks) ? fallbacks : [fallbacks];
  const normalizedFallbacks = fallbackList
    .map((fallback) => normalizeFontToken(fallback))
    .filter(Boolean);

  return [normalizedPrimary, ...normalizedFallbacks].join(", ");
}

function normalizeFontToken(fontName) {
  const raw = String(fontName ?? "").trim();

  if (!raw) {
    return "";
  }

  if (raw.includes(",")) {
    return raw;
  }

  const unquoted = raw.replace(/^['"]|['"]$/g, "");
  return isGenericFontFamily(unquoted) ? unquoted : `"${unquoted}"`;
}

function isGenericFontFamily(fontName) {
  const genericFamilies = new Set([
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-sans-serif",
    "ui-serif",
    "ui-monospace",
    "emoji",
    "math",
    "fangsong"
  ]);

  return genericFamilies.has(String(fontName).toLowerCase());
}

async function loadGoogleFontStylesheet(href) {
  if (typeof document === "undefined") {
    return;
  }

  if (loadedGoogleFontStylesheets.has(href)) {
    return;
  }

  const existingLink = Array
    .from(document.querySelectorAll('link[rel="stylesheet"]'))
    .find((node) => node.href === href);

  if (existingLink) {
    loadedGoogleFontStylesheets.add(href);
    return;
  }

  await new Promise((resolve, reject) => {
    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => {
      loadedGoogleFontStylesheets.add(href);
      resolve();
    };
    link.onerror = () => {
      reject(new Error(`Unable to load Google Font stylesheet: ${href}`));
    };

    document.head.appendChild(link);
  });
}

async function waitForGoogleFontReady(fontName, options = {}) {
  if (typeof document === "undefined" || !document.fonts || typeof document.fonts.load !== "function") {
    return;
  }

  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 5000;
  const text = String(options.testText ?? "ภาษาไทย");
  const fontSize = String(options.testFontSize ?? "24px");
  const fontQuery = `${fontSize} "${fontName}"`;

  await Promise.race([
    Promise.all([document.fonts.load(fontQuery, text), document.fonts.ready]),
    wait(timeoutMs)
  ]);
}

async function ensureGoogleFontAvailable(fontName, options = {}) {
  const normalizedName = normalizeGoogleFontName(fontName);
  const cacheKey = `${normalizedName}|${(options.weights ?? []).toString()}|${options.display ?? "swap"}`;

  if (googleFontReadyPromises.has(cacheKey)) {
    return googleFontReadyPromises.get(cacheKey);
  }

  const promise = (async () => {
    const cssUrl = buildGoogleFontCssUrl(normalizedName, options.weights, options.display);

    await loadGoogleFontStylesheet(cssUrl);
    await waitForGoogleFontReady(normalizedName, {
      timeoutMs: options.timeoutMs,
      testText: options.testText,
      testFontSize: options.testFontSize
    });
  })();

  googleFontReadyPromises.set(cacheKey, promise);
  return promise;
}

function applyDeferredGoogleFont(textObject, fontFamily, googleFontOptions) {
  if (googleFontOptions === false) {
    return;
  }

  const options = googleFontOptions && typeof googleFontOptions === "object" ? googleFontOptions : {};
  const autoLoad = options.autoLoad !== false;

  if (!autoLoad) {
    return;
  }

  const targetFontName = typeof options.fontName === "string" && options.fontName.trim()
    ? options.fontName.trim()
    : extractPrimaryFontName(fontFamily);

  if (!targetFontName || isGenericFontFamily(targetFontName)) {
    return;
  }

  ensureGoogleFontAvailable(targetFontName, options)
    .then(() => {
      if (!textObject || textObject.scene?.sys?.isDestroyed || textObject.active === false) {
        return;
      }

      if (typeof textObject.setFontFamily === "function") {
        textObject.setFontFamily(fontFamily);
      }

      if (typeof textObject.updateText === "function") {
        textObject.updateText();
      }
    })
    .catch(() => {
      // Keep fallback font when Google Font is unavailable.
    });
}

function wait(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, durationMs));
  });
}
