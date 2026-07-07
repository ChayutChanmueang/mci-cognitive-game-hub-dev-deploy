// US-E7-20 · Shared popup enter/leave transition (fade + scale, 0.5s).
//
// Every in-game popup builds an `.app-popup` overlay, appends it to <body>, and later
// removes it inside its own cleanup(). The ENTER animation is pure CSS (runs the moment
// the overlay is inserted — see `.app-popup` rules in public/style.css), so mounting needs
// no JS hook. The LEAVE animation, however, must delay the DOM removal + Promise resolve
// until it finishes — that timing is what this helper centralises.
//
//   dismissPopup(overlay) → adds `.app-popup--closing`, waits for the 0.5s leave animation,
//                           removes the node, and resolves. Callers resolve their own
//                           Promise in the `.then()` so the result lands AFTER the close.
//
// Honours prefers-reduced-motion: no wait, immediate removal (CSS also disables the anim).

const POPUP_ANIM_MS = 500;

function prefersReducedMotion() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Play the leave animation for an `.app-popup` overlay, then remove it.
 * @param {HTMLElement} overlay the `.app-popup` element
 * @returns {Promise<void>} resolves once the overlay has been removed
 */
export function dismissPopup(overlay) {
    if (!overlay) {
        return Promise.resolve();
    }

    if (prefersReducedMotion()) {
        overlay.remove();
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        let done = false;
        const finish = () => {
            if (done) {
                return;
            }
            done = true;
            overlay.remove();
            resolve();
        };

        // The content element (not the backdrop) carries the scale animation.
        const content = overlay.querySelector(":scope > :not(.app-popup__backdrop)");
        content?.addEventListener("animationend", finish, { once: true });
        overlay.classList.add("app-popup--closing");

        // Fallback: guarantee removal even if animationend never fires
        // (e.g. the element is display:none, or animations are stripped).
        setTimeout(finish, POPUP_ANIM_MS + 80);
    });
}

export default dismissPopup;
