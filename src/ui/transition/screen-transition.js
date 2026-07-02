// US-E7-20 · Screen (page) fade transition for DOM screens rendered into #ui-root:
// welcome / login / signup / admin-login / player-info / leaderboard / check-in /
// daily-preset tools. The Game Hub and minigames do NOT use this — they show the
// loading overlay instead (see src/ui/loading-overlay.js).
//
//   renderWithFade(uiRoot, renderFn):
//     1. fade the outgoing screen out (skipped when #ui-root is empty or reduced-motion)
//     2. run renderFn() — the show* function that swaps #ui-root's content (sync or async)
//     3. fade the incoming screen in
//
// renderFn may itself redirect (navigateTo replace); route-race guarding is the caller's
// job (main.js tracks routeRenderVersion). This helper only owns the visual fade.

const FADE_MS = 220;

function prefersReducedMotion() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {HTMLElement} uiRoot the #ui-root container
 * @param {() => (void | Promise<any>)} renderFn renders the new screen into uiRoot
 * @returns {Promise<any>} the result of renderFn
 */
export async function renderWithFade(uiRoot, renderFn) {
    if (!uiRoot || prefersReducedMotion()) {
        return renderFn();
    }

    // Fade the outgoing screen out — only if there's something visible to fade.
    if (uiRoot.childElementCount > 0 && !uiRoot.hidden) {
        uiRoot.classList.add("ui-root--leaving");
        await wait(FADE_MS);
    }

    const result = await renderFn();

    // Start the incoming screen hidden, then release it next frame so opacity
    // transitions 0 → 1 (removing --leaving in the same tick avoids a flash).
    uiRoot.classList.remove("ui-root--leaving");
    uiRoot.classList.add("ui-root--entering");
    requestAnimationFrame(() => {
        requestAnimationFrame(() => uiRoot.classList.remove("ui-root--entering"));
    });

    return result;
}

export default renderWithFade;
