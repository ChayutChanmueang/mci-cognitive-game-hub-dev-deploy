// US-E7-27 · Offline / no-internet notification popup.
//
// Based on the day-completion popups (day-completion-popup.js): it reuses the same
// Figma Frame_Form_Panel + green Start-Game-Button skeleton via renderFramePopupMarkup,
// so the look stays consistent. Styling is isolated behind the `gh-popup--offline`
// variant class and only OVERRIDES the shared `--popup-*` knobs (see components.css →
// "Per-popup overrides"), so configuring/customizing this popup never affects the base
// popups (rest-day / program-complete / check-in).
import { renderFramePopupMarkup } from "./components/frame-popup.js";
import { dismissPopup } from "./transition/popup-transition.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// Marks the overlay so we can enforce a single offline popup at a time (US-E7-27 AC#6).
const OFFLINE_POPUP_CLASS = "app-popup--offline";

const CHARACTER_IMAGE_BASE = "/assets/common/character";

// Gender-specific character (คุณตา/คุณยาย หาสัญญาณอินเทอร์เน็ต). DB gender is
// "male"/"female" (see signup-screen.js); anything else falls back to the man set.
// Art: `*_internet_loss.png`; degrades to `*_profile.png` if the file is ever missing.
function getOfflineCharacter(gender) {
    const isFemale = String(gender || "").trim().toLowerCase() === "female";
    const prefix = isFemale ? "female/OldWoman" : "man/OldMan";
    return {
        src: `${CHARACTER_IMAGE_BASE}/${prefix}_internet_loss.png`,
        fallbackSrc: `${CHARACTER_IMAGE_BASE}/${prefix}_profile.png`,
        alt: isFemale ? "คุณยายกำลังหาสัญญาณอินเทอร์เน็ต" : "คุณตากำลังหาสัญญาณอินเทอร์เน็ต",
    };
}

// In-memory buffer of the offline art encoded as `data:` URLs. The whole point of this popup
// is to render WHILE OFFLINE — when the connection is gone, an `<img src="/assets/...">`
// can't be fetched (the network-first service worker returns 503), so the image breaks.
// We work around this by fetching + encoding the art WHILE ONLINE and rendering the cached
// data URL (which needs zero network) once offline. The buffer is per-session (cleared on
// reload), which is fine: the app always loads online first, so `preloadOfflineArt()` runs
// before any disconnect. Keyed by the original asset URL.
const artDataUrlCache = new Map();

async function bufferImageAsDataUrl(url) {
    if (!url) return null;
    if (artDataUrlCache.has(url)) return artDataUrlCache.get(url);
    if (typeof fetch === "undefined") return null;
    try {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) {
            throw new Error(`unexpected status ${response.status}`);
        }
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
            reader.readAsDataURL(blob);
        });
        if (dataUrl) {
            artDataUrlCache.set(url, dataUrl);
        }
        return dataUrl;
    } catch (error) {
        console.warn("[offline-popup] failed to buffer offline art:", url, error);
        return null;
    }
}

/**
 * Preload + buffer the offline character art (both the `*_internet_loss.png` and its
 * `*_profile.png` fallback) for a given gender. MUST be called WHILE ONLINE (e.g. by the
 * internet manager right after the player's gender is resolved) so the images are available
 * to render the moment the connection drops.
 * @param {string} gender "male" | "female"
 */
export function preloadOfflineArt(gender) {
    const character = getOfflineCharacter(gender);
    return Promise.all([
        bufferImageAsDataUrl(character.src),
        bufferImageAsDataUrl(character.fallbackSrc),
    ]);
}

// The single mounted offline popup's cleanup fn (or null). Lets callers dismiss it
// programmatically — e.g. the internet manager auto-closing it when the connection
// is restored (US-E7-27 AC#6).
let activeCleanup = null;

/** True while an offline popup is currently mounted. */
export function isOfflinePopupOpen() {
    return typeof document !== "undefined" && Boolean(document.querySelector(`.${OFFLINE_POPUP_CLASS}`));
}

/** Programmatically dismiss the offline popup, if one is open. */
export function dismissOfflinePopup(result = false) {
    if (typeof activeCleanup === "function") {
        activeCleanup(result);
    }
}

/**
 * Show the "อินเทอร์เน็ตหายไปแล้ว" popup.
 *
 * @param {object}  [options]
 * @param {string}  [options.gender]       "male" | "female" (for the character art)
 * @param {string}  [options.title]        header text
 * @param {string}  [options.message]      body message
 * @param {string}  [options.buttonLabel]  action button label
 * @param {boolean} [options.dismissible]  allow Esc / backdrop close (default false)
 * @param {Function}[options.onRetry]      called when the action button is pressed
 * @returns {Promise<boolean>} resolves true when "ลองอีกครั้ง" was pressed, false if dismissed
 */
export function showOfflinePopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    // Singleton: never stack multiple offline popups (US-E7-27 AC#6).
    if (isOfflinePopupOpen()) {
        return Promise.resolve(false);
    }

    const {
        gender = "",
        title = "อินเทอร์เน็ตหายไปแล้ว",
        message = "ตรวจสอบอินเทอร์เน็ต แล้วลองปิดเปิดเกมใหม่นะ",
        buttonLabel = "ลองอีกครั้ง",
        dismissible = false,
        onRetry = null,
    } = options;

    return new Promise((resolve) => {
        const character = getOfflineCharacter(gender);
        // Prefer the in-memory data URL buffered while online (renders with no network);
        // fall back to the plain asset URL if it wasn't buffered in time.
        const primarySrc = artDataUrlCache.get(character.src) || character.src;
        const fallbackSrc = artDataUrlCache.get(character.fallbackSrc) || character.fallbackSrc;
        const overlay = document.createElement("div");
        overlay.className = `app-popup ${OFFLINE_POPUP_CLASS}`;
        overlay.innerHTML = renderFramePopupMarkup({
            variant: "offline",
            title,
            ariaLabel: title,
            buttonLabel,
            body: `
                <div class="gh-popup__character">
                    <img class="gh-popup__character-img" src="${primarySrc}" alt="${escapeHtml(character.alt)}" draggable="false" />
                    <span class="character-shadow gh-popup__character-shadow" aria-hidden="true"></span>
                </div>
                <p class="gh-popup__message">${escapeHtml(message)}</p>
            `,
        });

        // Graceful art fallback: the internet-loss art is buffered as a data URL while online
        // (see preloadOfflineArt) so it renders offline. If that ever fails, degrade to the
        // profile image (also buffered) instead of showing a broken image.
        const characterImg = overlay.querySelector(".gh-popup__character-img");
        if (characterImg && fallbackSrc && fallbackSrc !== primarySrc) {
            characterImg.addEventListener(
                "error",
                () => {
                    characterImg.src = fallbackSrc;
                },
                { once: true },
            );
        }

        let settled = false;
        const cleanup = (result) => {
            if (settled) return;
            settled = true;
            activeCleanup = null;
            document.removeEventListener("keydown", onKeyDown);
            // Play the leave animation, then remove + resolve (US-E7-20).
            dismissPopup(overlay).then(() => resolve(result));
        };
        activeCleanup = cleanup;

        function onKeyDown(event) {
            if (event.key === "Escape" && dismissible) cleanup(false);
        }

        overlay.querySelector(".gh-start-button")?.addEventListener("click", () => {
            if (typeof onRetry === "function") {
                try {
                    onRetry();
                } catch (error) {
                    console.error("[offline-popup] onRetry handler failed:", error);
                }
            }
            cleanup(true);
        });

        if (dismissible) {
            overlay.querySelector(".app-popup__backdrop")?.addEventListener("click", () => cleanup(false));
        }

        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
    });
}
