// US-E7-30 · Check / Check_Circle / Uncheck_Circle (Figma 3305:445 / 3305:446 / 3305:447,
// page 1132:3 Export_Page). Ported from the verified demo (Check.vue, CheckCircle.vue,
// UncheckCircle.vue).
//
// The demo ships three separate components, but "checked" is just Check_Circle + Check
// composed together (the demo's own note: Check sits at a (16,23) offset inside the circle).
// Nothing in this app ever needs a bare Check floating on its own, so this exposes ONE
// component with a `checked` flag and positions the tick with CSS instead of the absolute
// canvas coordinates — a single element that can flip state without being re-rendered.
//
//   3305:446 Check_Circle   72x72, border 2.5 #83EB81, radius 104, fill #EDFFDE
//   3305:447 Uncheck_Circle 72x72, border 2.5 #D4D4D4, radius 104, fill #FAFAFA
//   3305:445 Check          stroke #83EB81 width 9, round caps, + drop shadow
//
// Per the project's CSS-first rule the circles are CSS (no image); only the tick is SVG,
// because it is a real vector path in Figma.
import { escapeText, escapeAttr } from "./escape.js";

// Figma exports the tick with a drop-shadow filter whose id must stay unique per document.
// It is identical for every instance, so it is defined once and referenced by all of them.
const CHECK_SVG = `
    <svg class="gh-check-circle__tick" width="56" height="43" viewBox="0 0 56 43" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g filter="url(#ghCheckIconShadow)">
        <path d="M8.5 17.5L21.5 30.5L47.5 4.5" stroke="#83EB81" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <defs>
        <filter id="ghCheckIconShadow" x="0" y="0" width="56" height="43" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.453962 0 0 0 0 0.723708 0 0 0 0 0.328957 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3305_445" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3305_445" result="shape" />
        </filter>
      </defs>
    </svg>`;

/**
 * The circle only. It is decorative: the real state lives on the input it sits next to,
 * and CSS drives the checked look off that input, so this never needs re-rendering.
 *
 * @param {object} [opts]
 * @param {string} [opts.className]
 */
export function renderCheckCircle({ className = "" } = {}) {
  const cls = `gh-check-circle${className ? ` ${className}` : ""}`;
  return `<span class="${cls}" aria-hidden="true">${CHECK_SVG}</span>`;
}

/**
 * A full option row: a real <input> (radio or checkbox) visually replaced by the Figma
 * circle, plus its label.
 *
 * The input stays in the DOM as a real control rather than being swapped for a styled
 * <div> — it keeps keyboard navigation, form semantics and screen-reader state for free,
 * which AC#6 requires. It is clipped, not `display:none`, so it remains focusable.
 *
 * @param {object} opts
 * @param {"radio"|"checkbox"} opts.type
 * @param {string} opts.name      groups radios together
 * @param {string} opts.value     surfaced as data-export-* by the caller's dataset attr
 * @param {string} opts.label
 * @param {boolean} [opts.checked]
 * @param {string} [opts.dataAttr] e.g. `data-export-option="player"`
 */
export function renderCheckOption({ type, name, value, label, checked = false, dataAttr = "" } = {}) {
  return `
    <label class="gh-check-option">
      <input
        class="gh-check-option__input"
        type="${escapeAttr(type)}"
        name="${escapeAttr(name)}"
        value="${escapeAttr(value)}"
        ${dataAttr}
        ${checked ? "checked" : ""}
      />
      ${renderCheckCircle()}
      <span class="gh-check-option__label">${escapeText(label)}</span>
    </label>`;
}

export default renderCheckCircle;
