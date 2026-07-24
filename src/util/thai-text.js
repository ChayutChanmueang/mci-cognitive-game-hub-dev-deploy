/**
 * Default Thai font stack used by createThaiText().
 * You can reassign this at runtime via setThaiFontFamily()/setThaiGoogleFont().
 */
export let THAI_FONT_FAMILY = '"Noto Sans Thai Looped", sans-serif';

/**
 * Reusable style presets for common Thai text roles in this project.
 */
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
const DEFAULT_FONT_FALLBACKS = Object.freeze(["sans-serif"]);
const DEFAULT_GOOGLE_FONT_OPTIONS = Object.freeze({
  display: "swap",
  timeoutMs: 5000,
  testText: "ภาษาไทย",
  testFontSize: "24px"
});
const GENERIC_FONT_FAMILIES = new Set([
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

const loadedGoogleFontStylesheets = new Set();
const googleFontReadyPromises = new Map();

const wordSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter("th", { granularity: "word" })
  : null;

const graphemeSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter("th", { granularity: "grapheme" })
  : null;

/**
 * Get the current default Thai font stack.
 *
 * Usage:
 * const font = getThaiFontFamily();
 */
export function getThaiFontFamily() {
  return THAI_FONT_FAMILY;
}

/**
 * Set the default Thai font stack for future createThaiText() calls.
 * If a single font name is provided, fallback fonts are appended automatically.
 *
 * Usage:
 * setThaiFontFamily("Kanit", ["Sarabun", "sans-serif"]);
 */
export function setThaiFontFamily(fontFamily, fallbacks = DEFAULT_FONT_FALLBACKS) {
  const normalized = String(fontFamily ?? "").trim();

  if (!normalized) {
    throw new Error("fontFamily is required");
  }

  THAI_FONT_FAMILY = normalized.includes(",")
    ? normalized
    : createFontFamilyStack(normalized, fallbacks);

  return THAI_FONT_FAMILY;
}

/**
 * Load a Google Font and return a complete font-family stack string.
 * This function does not mutate THAI_FONT_FAMILY by itself.
 *
 * Usage:
 * const stack = await loadGoogleFont("Noto Sans Thai", { weights: [400, 700] });
 */
export async function loadGoogleFont(fontName, options = {}) {
  const normalizedName = normalizeGoogleFontName(fontName);
  const normalizedOptions = normalizeGoogleFontOptions(options);

  await ensureGoogleFontAvailable(normalizedName, normalizedOptions);

  return createFontFamilyStack(normalizedName, normalizedOptions.fallbacks);
}

/**
 * Load a Google Font then set it as the default THAI_FONT_FAMILY.
 *
 * Usage:
 * await setThaiGoogleFont("Noto Sans Thai", { weights: [400, 700] });
 */
export async function setThaiGoogleFont(fontName, options = {}) {
  THAI_FONT_FAMILY = await loadGoogleFont(fontName, options);
  return THAI_FONT_FAMILY;
}

/**
 * Ensure the current default Thai font (or explicit options.fontName) is loaded.
 * Useful to call once in a Scene before creating many text objects.
 *
 * Usage:
 * await ensureThaiFontLoaded({ weights: [400, 700] });
 */
export async function ensureThaiFontLoaded(options = {}) {
  const normalizedOptions = normalizeGoogleFontOptions(options);
  const requestedName = resolveGoogleFontNameFromOptions(THAI_FONT_FAMILY, normalizedOptions);

  if (!requestedName) {
    return THAI_FONT_FAMILY;
  }

  await ensureGoogleFontAvailable(requestedName, normalizedOptions);
  return THAI_FONT_FAMILY;
}

/**
 * Create Phaser Text with Thai-friendly defaults:
 * - default font from THAI_FONT_FAMILY (unless style.fontFamily is provided)
 * - Thai line spacing and padding tuning
 * - optional Thai wrap callback
 * - optional deferred Google Font reload
 *
 * Usage:
 * createThaiText(scene, 100, 100, "สวัสดี", { fontSize: "48px" }, { origin: 0.5, wrapWidth: 500 });
 */
export function createThaiText(scene, x, y, text, style = {}, options = {}) {
  const textStyle = getThaiTextStyle(style);
  const textObject = scene.add.text(x, y, text, textStyle);

  applyThaiTextSupport(textObject, options);
  applyTextOrigin(textObject, options.origin);
  applyDeferredGoogleFont(textObject, textStyle.fontFamily, options.googleFont);

  return textObject;
}

/**
 * Merge style with default Thai font fallback behavior.
 * If style.fontFamily is undefined/empty, THAI_FONT_FAMILY is used.
 *
 * Usage:
 * const style = getThaiTextStyle({ fontSize: "32px" });
 */
export function getThaiTextStyle(style = {}) {
  const styleObject = isPlainObject(style) ? style : {};
  const { fontFamily, ...restStyle } = styleObject;

  return {
    ...restStyle,
    fontFamily: resolveFontFamily(fontFamily)
  };
}

/**
 * Apply Thai text rendering helpers to an existing Phaser Text object.
 * Handles padding, line spacing and optional wrap callback.
 *
 * Usage:
 * applyThaiTextSupport(textObject, { wrapWidth: 400 });
 */
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

/**
 * Thai-aware word wrapping:
 * - split by words when possible (Intl.Segmenter)
 * - if a token is too long, split by grapheme clusters
 */
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
      const candidateWidth = measureTextWidth(textObject, candidateLine);

      if (currentLine && candidateWidth > maxWidth) {
        lines.push(currentLine.trimEnd());

        // Strip leading whitespace from the segment carried onto the new
        // line — otherwise a segment that is itself just a space (the one
        // that caused the overflow) becomes a stray leading space, since a
        // non-empty " " string is truthy and skips the line-start trim below.
        const carried = nextSegment.trimStart();

        if (!carried) {
          currentLine = "";
        } else if (measureTextWidth(textObject, carried) > maxWidth) {
          const brokenSegments = breakLongSegment(carried, textObject, maxWidth);
          lines.push(...brokenSegments.slice(0, -1));
          currentLine = brokenSegments[brokenSegments.length - 1] ?? "";
        } else {
          currentLine = carried;
        }

        continue;
      }

      if (!currentLine && candidateWidth > maxWidth) {
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

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function applyTextOrigin(textObject, origin) {
  if (origin === undefined) {
    return;
  }

  if (Array.isArray(origin)) {
    textObject.setOrigin(origin[0], origin[1]);
    return;
  }

  textObject.setOrigin(origin);
}

function segmentWords(text) {
  if (!text) {
    return [];
  }

  if (wordSegmenter) {
    const rawTokens = Array.from(
      wordSegmenter.segment(text),
      ({ segment, isWordLike }) => ({ segment, isWordLike })
    );
    return mergeKeepTogetherSegments(rawTokens).map((token) => token.segment);
  }

  return text.split(/(\s+)/).filter(Boolean);
}

const DIGIT_RE = /^[0-9]+$/;
const NUMERIC_JOIN_RE = /^[:,.]$/;

/**
 * Glue tokens that should never be split across a line break:
 * - numeric runs joined by ":" "," "." (e.g. "18" ":" "00" -> "18:00")
 * - a number plus its immediately following unit/classifier word, including
 *   an attached abbreviation dot and one "/word." extension for compound
 *   units (e.g. "18:00" " " "น" "." -> "18:00 น."; "80" " " "กม" "." "/" "ชม" "." -> "80 กม./ชม.")
 *
 * Only ever absorbs a single trailing word so it never swallows unrelated
 * words that happen to sit right after a classifier in space-less Thai text.
 */
function mergeKeepTogetherSegments(tokens) {
  const merged = [];
  let i = 0;

  while (i < tokens.length) {
    if (tokens[i].isWordLike && DIGIT_RE.test(tokens[i].segment)) {
      let j = i + 1;
      let combined = tokens[i].segment;

      while (
        j + 1 < tokens.length &&
        !tokens[j].isWordLike && NUMERIC_JOIN_RE.test(tokens[j].segment) &&
        tokens[j + 1].isWordLike && DIGIT_RE.test(tokens[j + 1].segment)
      ) {
        combined += tokens[j].segment + tokens[j + 1].segment;
        j += 2;
      }

      const glued = glueTrailingUnit(tokens, j, combined);
      merged.push({ segment: glued.segment, isWordLike: true });
      i = glued.nextIndex;
      continue;
    }

    merged.push(tokens[i]);
    i += 1;
  }

  return merged;
}

function glueTrailingUnit(tokens, index, numericSegment) {
  let segment = numericSegment;
  let i = index;
  let hasSpace = false;

  if (i < tokens.length && !tokens[i].isWordLike && tokens[i].segment === " ") {
    hasSpace = true;
    i += 1;
  }

  if (i < tokens.length && tokens[i].isWordLike) {
    let unit = tokens[i].segment;
    let k = i + 1;

    while (k < tokens.length && !tokens[k].isWordLike && tokens[k].segment === ".") {
      unit += tokens[k].segment;
      k += 1;

      if (
        k + 1 < tokens.length &&
        !tokens[k].isWordLike && tokens[k].segment === "/" &&
        tokens[k + 1].isWordLike
      ) {
        unit += tokens[k].segment + tokens[k + 1].segment;
        k += 2;
      }
    }

    segment += (hasSpace ? " " : "") + unit;
    i = k;
  }

  return { segment, nextIndex: i };
}

function breakLongSegment(text, textObject, maxWidth) {
  const graphemes = graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment)
    : Array.from(text);
  const segments = [];
  let currentSegment = "";

  for (const grapheme of graphemes) {
    const candidateSegment = currentSegment + grapheme;

    if (currentSegment && measureTextWidth(textObject, candidateSegment) > maxWidth) {
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

function measureTextWidth(textObject, text) {
  return textObject.context.measureText(text).width;
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
  const normalized = String(fontName ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error("Google font name is required");
  }

  return normalized;
}

function normalizeGoogleFontOptions(options = {}) {
  const source = isPlainObject(options) ? options : {};
  const timeoutMs = Number.isFinite(source.timeoutMs)
    ? Math.max(0, source.timeoutMs)
    : DEFAULT_GOOGLE_FONT_OPTIONS.timeoutMs;

  return {
    ...source,
    fontName: typeof source.fontName === "string" ? source.fontName.trim() : "",
    weights: normalizeWeights(source.weights),
    display: typeof source.display === "string" && source.display.trim()
      ? source.display.trim()
      : DEFAULT_GOOGLE_FONT_OPTIONS.display,
    fallbacks: normalizeFallbacks(source.fallbacks),
    timeoutMs,
    testText: typeof source.testText === "string" && source.testText
      ? source.testText
      : DEFAULT_GOOGLE_FONT_OPTIONS.testText,
    testFontSize: typeof source.testFontSize === "string" && source.testFontSize.trim()
      ? source.testFontSize.trim()
      : DEFAULT_GOOGLE_FONT_OPTIONS.testFontSize
  };
}

function normalizeFallbacks(fallbacks) {
  if (!Array.isArray(fallbacks) || !fallbacks.length) {
    return [...DEFAULT_FONT_FALLBACKS];
  }

  return fallbacks;
}

function buildGoogleFontCssUrl(fontName, weights, display) {
  const familyQuery = buildGoogleFontFamilyQuery(fontName, weights);
  const encodedFamily = encodeURIComponent(familyQuery).replace(/%20/g, "+");
  const encodedDisplay = encodeURIComponent(display || DEFAULT_GOOGLE_FONT_OPTIONS.display);
  return `${GOOGLE_FONTS_CSS_API}?family=${encodedFamily}&display=${encodedDisplay}`;
}

function buildGoogleFontFamilyQuery(fontName, weights) {
  const encodedName = fontName.replace(/\s+/g, " ").trim();

  if (!weights.length) {
    return encodedName;
  }

  return `${encodedName}:wght@${weights.join(";")}`;
}

function normalizeWeights(weights) {
  const source = Array.isArray(weights) ? weights : [weights];
  const values = source
    .map((weight) => Number.parseInt(weight, 10))
    .filter((weight) => Number.isFinite(weight) && weight > 0);

  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function resolveGoogleFontNameFromOptions(fontFamilyStack, options) {
  const requested = options.fontName || extractPrimaryFontName(fontFamilyStack);
  return requested && !isGenericFontFamily(requested) ? requested : "";
}

function extractPrimaryFontName(fontFamilyStack) {
  const stack = String(fontFamilyStack ?? "").trim();

  if (!stack) {
    return "";
  }

  const firstToken = stack.split(",")[0]?.trim() ?? "";
  return firstToken.replace(/^['"]|['"]$/g, "").trim();
}

function createFontFamilyStack(primaryFont, fallbacks = DEFAULT_FONT_FALLBACKS) {
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
  return GENERIC_FONT_FAMILIES.has(String(fontName).toLowerCase());
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

async function waitForGoogleFontReady(fontName, options) {
  if (typeof document === "undefined" || !document.fonts || typeof document.fonts.load !== "function") {
    return;
  }

  const fontQuery = `${options.testFontSize} "${fontName}"`;

  await Promise.race([
    Promise.all([document.fonts.load(fontQuery, options.testText), document.fonts.ready]),
    wait(options.timeoutMs)
  ]);
}

async function ensureGoogleFontAvailable(fontName, options = {}) {
  const normalizedName = normalizeGoogleFontName(fontName);
  const normalizedOptions = normalizeGoogleFontOptions(options);
  const cacheKey = `${normalizedName}|${normalizedOptions.weights.join(",")}|${normalizedOptions.display}`;

  if (googleFontReadyPromises.has(cacheKey)) {
    return googleFontReadyPromises.get(cacheKey);
  }

  const promise = (async () => {
    const cssUrl = buildGoogleFontCssUrl(normalizedName, normalizedOptions.weights, normalizedOptions.display);

    await loadGoogleFontStylesheet(cssUrl);
    await waitForGoogleFontReady(normalizedName, normalizedOptions);
  })();

  googleFontReadyPromises.set(cacheKey, promise);
  return promise;
}

function applyDeferredGoogleFont(textObject, fontFamily, googleFontOptions) {
  if (googleFontOptions === false) {
    return;
  }

  const options = normalizeGoogleFontOptions(googleFontOptions);

  if (options.autoLoad === false) {
    return;
  }

  const targetFontName = resolveGoogleFontNameFromOptions(fontFamily, options);

  if (!targetFontName) {
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
