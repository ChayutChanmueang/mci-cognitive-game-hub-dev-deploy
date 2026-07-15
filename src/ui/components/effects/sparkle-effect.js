// Sparkle particle burst for DOM/hub surfaces — rainbow, random, gradually spreading outward.
//
// Inspired by Minecraft's bone-meal sparkles, but: random rainbow colours (not green) that
// drift out and up from an anchor element, twinkle, and fade. Generic & reusable — it animates
// nothing consumer-specific, only its own particles around a given anchor.
//
// Mounts a `position: fixed` overlay (immune to scroll, above popups) and emits star-shaped
// particles via the Web Animations API. Returns a `{ cancel }` handle for early teardown.

// 4-point "twinkle" star with concave curved sides. Cubic-bezier path where every control
// point sits at the centre (0,0) so each edge bows inward — adapted from a p5.js bezierVertex
// star. viewBox is -100..100 on both axes, so the SVG scales to the particle's box.
const STAR_PATH =
    "M0 -100 C0 0 0 0 100 0 C0 0 0 0 0 100 C0 0 0 0 -100 0 C0 0 0 0 0 -100 Z";

function starSvg(color) {
    return `<svg viewBox="-100 -100 200 200" width="100%" height="100%" `
        + `xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`
        + `<path d="${STAR_PATH}" fill="${color}"/></svg>`;
}

// Resolve the per-particle colour from the `color` option:
//   null / "random"        → a fresh random rainbow hue every particle
//   string (e.g. "#ffd700") → that exact colour for every particle
//   string[] (e.g. ["#f00","#0f0"]) → a random pick from the list per particle
function resolveColor(color) {
    if (Array.isArray(color) && color.length > 0) {
        return color[Math.floor(Math.random() * color.length)];
    }
    if (typeof color === "string" && color !== "random") {
        return color;
    }
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 95%, 62%)`;
}

function prefersReducedMotion() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function centerOf(anchor, sRadius = 1 /*0.6*/) {
    if (anchor && typeof anchor.getBoundingClientRect === "function") {
        const r = anchor.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, spread: Math.max(r.width, r.height) * sRadius };
        }
    }
    // Fallback: viewport centre.
    const w = typeof window !== "undefined" ? window.innerWidth : 360;
    const h = typeof window !== "undefined" ? window.innerHeight : 640;
    return { x: w / 2, y: h / 2, spread: Math.min(w, h) * 0.3 };
}

/**
 * Emit a rainbow sparkle burst around an anchor element.
 *
 * @param {Object} [options]
 * @param {Element|null} [options.anchor=null]  Element to centre the sparkles on (e.g. the tree).
 * @param {Element} [options.mount=document.body] Where to append the overlay.
 * @param {number}  [options.count=48]          Number of sparkle particles.
 * @param {number}  [options.zIndex=2001]       Stacking; default sits above `.app-popup` (2000).
 * @param {number|null} [options.spread=null]   Spread radius in px (null = derived from anchor).
 * @param {{min:number,max:number}} [options.sMinMax={min:25,max:50}] Per-particle star size range in px.
 * @param {string|string[]|null} [options.color=null] Particle colour: `null`/`"random"` = random
 *   rainbow hue per particle; a CSS colour string = that static colour; an array of colour strings
 *   = a random pick from the list per particle. Any CSS colour syntax works (hex, rgb, hsl, names).
 * @returns {{ cancel: () => void }} Handle to stop the effect early.
 */
export function showSparkleEffect(options = {}) {
    const {
        anchor = null,
        mount = document.body,
        count = 6,
        zIndex = 2001,
        spread = null,
        sMinMax = {min: 60, max: 90},
        color = null
    } = options;

    const reduced = prefersReducedMotion();
    const { x: cx, y: cy, spread: autoSpread } = centerOf(anchor);
    const radius = spread ?? autoSpread;
    const total = reduced ? Math.min(8, count) : count;

    const container = document.createElement("div");
    Object.assign(container.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: String(zIndex),
    });
    (mount || document.body).appendChild(container);

    const animations = [];
    let remaining = total;
    let cancelled = false;

    const cancel = () => {
        if (cancelled) {
            return;
        }
        cancelled = true;
        animations.forEach((a) => a.cancel?.());
        container.remove();
    };

    const finishOne = () => {
        remaining -= 1;
        if (remaining <= 0 && !cancelled) {
            cancel();
        }
    };

    for (let i = 0; i < total; i++) {
        const size = sMinMax.min + (Math.random() * (sMinMax.max / 2));
        const particleColor = resolveColor(color);

        const sparkle = document.createElement("div");
        Object.assign(sparkle.style, {
            position: "fixed",
            left: `${cx}px`,
            top: `${cy}px`,
            width: `${size}px`,
            height: `${size}px`,
            marginLeft: `${-size / 2}px`,
            marginTop: `${-size / 2}px`,
            // Glow follows the star silhouette (drop-shadow respects the SVG alpha).
            filter: `drop-shadow(0 0 ${size * 0.45}px ${particleColor})`,
            opacity: "0",
            willChange: "transform, opacity",
        });
        sparkle.innerHTML = starSvg(particleColor);
        container.appendChild(sparkle);

        // Spread outward in a random direction, biased upward (like rising sparkles).
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * (0.5 + Math.random() * 0.8);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - (20 + Math.random() * 40);
        const spin = (Math.random() - 0.5) * 180;

        const life = 700 + Math.random() * 600;
        const delay = Math.random() * 500; // staggered → gradual spread

        const anim = sparkle.animate(
            [
                { transform: "translate(0, 0) scale(0) rotate(0deg)", opacity: 0, offset: 0 },
                { transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1) rotate(${spin * 0.4}deg)`, opacity: 1, offset: 0.3 },
                { transform: `translate(${dx}px, ${dy}px) scale(0.2) rotate(${spin}deg)`, opacity: 0, offset: 1 },
            ],
            {
                duration: life,
                delay,
                easing: "ease-out",
                fill: "forwards",
            },
        );
        anim.onfinish = () => {
            sparkle.remove();
            finishOne();
        };
        animations.push(anim);
    }

    return { cancel };
}
