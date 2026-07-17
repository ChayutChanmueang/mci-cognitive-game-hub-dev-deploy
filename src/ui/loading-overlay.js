// US-E7-20 · In-app loading overlay — shown when entering the Game Hub or a minigame.
//
// ⚠️ THERE ARE INTENTIONALLY TWO COPIES OF THIS LOADING SCREEN. Keep both in sync:
//
//   1. BOOT overlay — hard-coded markup + critical INLINE styles in `index.html`
//      (`#app-loading`). It lives inline on purpose so it paints the instant the page
//      loads, BEFORE this JS bundle and style.css arrive — that's what prevents the
//      white flash on cold start (BUG-005 / PB-01-01). It is faded + removed exactly
//      once by `main.js#finishBootLoading()` when the first screen is ready.
//
//   2. THIS component — the same art rebuilt in JS so it can be shown/hidden on demand
//      for LATER navigations (opening the Game Hub or a minigame), by which point the
//      boot overlay has already been removed and can't be reused.
//
// Both share the visual styles in `public/style.css` (`.app-loading__logo`,
// `.dotted-loader`, `@keyframes dot-*`). The component's own box/position/z-index live
// under `.app-loading--component` there. If you change the look (logo, dots, background),
// update BOTH the inline markup in index.html AND the `build()` markup below.

const LOADING_FADE_MS = 350;

let node = null;
let hideTimer = null;

function build() {
    const el = document.createElement("div");
    el.className = "app-loading app-loading--component";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "กำลังโหลด");
    el.innerHTML = `
        <img class="app-loading__logo" src="/Logo.png" alt="Game Logo" width="360" height="327" decoding="async" />
        <div class="dotted-loader" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
        </div>
    `;
    return el;
}

/** Show the loading overlay (idempotent). */
export function showLoadingOverlay() {
    if (typeof document === "undefined") {
        return;
    }
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    if (!node) {
        node = build();
    }
    if (!node.isConnected) {
        document.body.appendChild(node);
    }
    // Force the hidden state + reflow so removing it fades in from opacity 0.
    node.classList.add("app-loading--hidden");
    void node.offsetWidth;
    node.classList.remove("app-loading--hidden");
}

/** Fade out and remove the loading overlay (idempotent). */
export function hideLoadingOverlay() {
    if (!node) {
        return;
    }
    node.classList.add("app-loading--hidden");
    if (hideTimer) {
        clearTimeout(hideTimer);
    }
    hideTimer = setTimeout(() => {
        node?.remove();
        hideTimer = null;
    }, LOADING_FADE_MS);
}

export default { showLoadingOverlay, hideLoadingOverlay };
