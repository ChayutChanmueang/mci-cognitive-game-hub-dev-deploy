// Celebration confetti burst for DOM/hub surfaces (e.g. the check-in "เก่งมาก !!!" popup).
//
// This is the DOM/hub-friendly sibling of the Phaser-side
// `src/game/common/ui-elements/scripts/level-complete-effect.js`. It is intentionally
// kept separate so the 6 minigames that import the original stay untouched.
//
// Scope: this component does ONE generic thing — a confetti burst overlay. It deliberately
// does NOT animate any consumer-specific element (e.g. the check-in character); screen-specific
// animations belong in that screen's own module so this stays reusable and unsurprising.
//
// Differences from the Phaser version:
// - Mounts on `document.body` (NOT `#game-container`, which is `display:none` in hub mode).
// - Uses `position: fixed` so it is immune to page scroll and sits above popups.
// - Big celebration text is OPTIONAL (a popup usually shows its own heading).
// - No hard audio dependency: sound is opt-in and routed through the central AudioManager.

import AudioManager from "../../core/audio-manager.js";

const CONFETTI_COLORS = ["#FFC700", "#FF0055", "#00F0FF", "#00FF66", "#9D00FF"];

function prefersReducedMotion() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Show a celebration confetti burst on a DOM surface.
 *
 * @param {Object} [options]
 * @param {Element} [options.mount=document.body]  Where to append the overlay.
 * @param {number}  [options.zIndex=2001]          Stacking; default sits above `.app-popup` (2000).
 * @param {string|null} [options.text=null]        Optional big headline (null = none).
 * @param {number}  [options.particleCount=80]     Number of confetti pieces.
 * @param {number}  [options.duration=1500]        Confetti lifetime in ms.
 * @param {string|null} [options.sound=null]       Optional AudioManager SFX key (e.g. "ui:popup").
 * @returns {{ cancel: () => void }} Handle to stop the effect early (e.g. if the popup closes).
 */
export function showCelebrationEffect(options = {}) {
    const {
        mount = document.body,
        zIndex = 2001,
        text = null,
        particleCount = 80,
        duration = 1500,
        sound = null,
    } = options;

    const reduced = prefersReducedMotion();

    // Opt-in sound, routed through the central manager (respects mute/master volume).
    if (sound) {
        try {
            AudioManager.play(sound);
        } catch (err) {
            // Audio is non-essential; never let it break the visual.
            console.warn("[celebration-effect] sound failed:", err);
        }
    }

    const container = document.createElement("div");
    Object.assign(container.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: String(zIndex),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    });

    // Optional headline (off by default — popups usually have their own heading).
    let textEl = null;
    if (text) {
        textEl = document.createElement("h1");
        textEl.textContent = text;
        Object.assign(textEl.style, {
            fontFamily: '"Kanit", "Inter", sans-serif',
            fontSize: "6rem",
            fontWeight: "900",
            color: "#ffffff",
            textShadow: "0px 10px 20px rgba(0,0,0,0.5), 0 0 30px #FFD700, 0 0 60px #FF8C00",
            transform: "scale(0) translateY(50px)",
            transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            margin: "0",
            textAlign: "center",
            letterSpacing: "2px",
        });
        container.appendChild(textEl);
    }

    // Confetti particles (physics ported from level-complete-effect.js).
    const count = reduced ? Math.min(24, particleCount) : particleCount;
    const confettiElements = [];
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement("div");
        Object.assign(confetti.style, {
            position: "absolute",
            width: `${Math.random() * 10 + 8}px`,
            height: `${Math.random() * 20 + 10}px`,
            backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            top: "50%",
            left: "50%",
            borderRadius: Math.random() > 0.5 ? "50%" : "4px",
            opacity: "0",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        });

        const angle = Math.random() * Math.PI * 2;
        const velocity = 15 + Math.random() * 25;
        confetti.dataset.dx = String(Math.cos(angle) * velocity);
        confetti.dataset.dy = String(Math.sin(angle) * velocity - 10); // bias upward
        confetti.dataset.x = "0";
        confetti.dataset.y = "0";
        confetti.dataset.rotation = String(Math.random() * 360);
        confetti.dataset.rotationSpeed = String((Math.random() - 0.5) * 20);

        container.appendChild(confetti);
        confettiElements.push(confetti);
    }

    (mount || document.body).appendChild(container);

    if (textEl) {
        requestAnimationFrame(() => {
            textEl.style.transform = "scale(1) translateY(0px)";
        });
    }

    let animationFrameId = null;
    let cancelled = false;
    const start = performance.now();

    const cancel = () => {
        if (cancelled) {
            return;
        }
        cancelled = true;
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
        }
        container.remove();
    };

    const tick = (time) => {
        if (cancelled) {
            return;
        }
        const elapsed = time - start;
        if (elapsed > duration) {
            cancel();
            return;
        }
        const progress = elapsed / duration;

        confettiElements.forEach((c) => {
            let x = parseFloat(c.dataset.x);
            let y = parseFloat(c.dataset.y);
            const dy = parseFloat(c.dataset.dy);

            x += parseFloat(c.dataset.dx) * Math.max(0, 1 - progress * 2); // ease horizontal
            y += dy;
            c.dataset.dy = String(dy + 0.8); // gravity
            c.dataset.x = String(x);
            c.dataset.y = String(y);

            const rotation = parseFloat(c.dataset.rotation) + parseFloat(c.dataset.rotationSpeed);
            c.dataset.rotation = String(rotation);

            let opacity = 1;
            if (progress < 0.1) opacity = progress * 10;
            if (progress > 0.7) opacity = 1 - (progress - 0.7) / 0.3;

            c.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg)`;
            c.style.opacity = String(opacity);
        });

        if (textEl) {
            const textY = Math.sin(elapsed / 150) * 5;
            if (progress > 0.1 && progress < 0.8) {
                textEl.style.transform = `scale(1) translateY(${textY}px)`;
            } else if (progress >= 0.8) {
                textEl.style.opacity = String(1 - (progress - 0.8) / 0.2);
                textEl.style.transform = `scale(${1 + (progress - 0.8)}) translateY(${textY}px)`;
            }
        }

        animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return { cancel };
}
