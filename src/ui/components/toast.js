// US-E7-18 · Android-style Toast — a single floating message, bottom-center of the screen,
// that auto-dismisses. Replaces the old inline `<p>` feedback under form fields so status /
// error messages read consistently across screens without pushing the layout around.
//
//   showToast(message, { type = "info", duration = 3000 })
//       type:     "info" | "success" | "error"  (error → assertive a11y + red)
//       duration: ms before auto-dismiss; 0 (or Infinity) = sticky until replaced/cleared
//       returns:  a handle (opaque) — mostly you just call clearToast()
//   clearToast()  → dismiss the current toast (e.g. once a loading step succeeds)
//
// Only ONE toast shows at a time: a new one REPLACES the current (Android-like), which suits
// the "status… → error / done" flow. Styles live in public/components.css (`.gh-toast*`).
// Honours prefers-reduced-motion (no fade/slide).

const FADE_MS = 200;

let container = null;
let current = null; // { el, timer, removed }

function prefersReducedMotion() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ensureContainer() {
    if (container && container.isConnected) {
        return container;
    }
    container = document.createElement("div");
    container.className = "gh-toast-container";
    document.body.appendChild(container);
    return container;
}

function removeToast(entry, instant = false) {
    if (!entry || entry.removed) {
        return;
    }
    entry.removed = true;
    if (entry.timer) {
        clearTimeout(entry.timer);
        entry.timer = null;
    }
    if (current === entry) {
        current = null;
    }

    if (instant || prefersReducedMotion()) {
        entry.el.remove();
        return;
    }
    entry.el.classList.add("gh-toast--leaving");
    entry.el.classList.remove("gh-toast--visible");
    setTimeout(() => entry.el.remove(), FADE_MS);
}

/** Dismiss the current toast, if any. */
export function clearToast() {
    if (current) {
        removeToast(current);
    }
}

/**
 * Show a toast (replacing any current one).
 * @param {string} message
 * @param {{ type?: "info"|"success"|"error", duration?: number }} [opts]
 */
export function showToast(message, { type = "info", duration = 3000 } = {}) {
    if (typeof document === "undefined" || !String(message ?? "").trim()) {
        return null;
    }

    // Replace the current toast instantly so the two never overlap at bottom-center.
    if (current) {
        removeToast(current, true);
    }

    const el = document.createElement("div");
    el.className = `gh-toast gh-toast--${type}`;
    const isError = type === "error";
    el.setAttribute("role", isError ? "alert" : "status");
    el.setAttribute("aria-live", isError ? "assertive" : "polite");
    el.textContent = String(message);

    ensureContainer().appendChild(el);

    const entry = { el, timer: null, removed: false };
    current = entry;

    // Animate in on the next frame so the initial hidden state is painted first.
    requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add("gh-toast--visible");
    }));

    if (Number.isFinite(duration) && duration > 0) {
        entry.timer = setTimeout(() => removeToast(entry), duration);
    }

    return entry;
}

export default showToast;
