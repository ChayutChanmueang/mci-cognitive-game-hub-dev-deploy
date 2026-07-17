// Button_OK_Stroke (Figma 3204:29). Ported from the verified demo
// (test-figma-export/src/components/ButtonOkStroke.vue). A green gradient pill
// with a thick white OUTSIDE stroke (the "_Stroke" variant) and baked-in Thai
// label "เริ่มต้น" (confirm/positive action), rendered as a real <button>.
//
//   3204:21 base 353.75 x 182.32984924316406 rgb(65,134,29), cornerRadius
//           77.71435546875, white OUTSIDE stroke 10.4615478515625 (box-shadow spread)
//   3204:22 fill 353.75 x 175.6045379638672 gradient rgb(125,215,76) ->
//           rgb(74,157,29) vertical (top-aligned; dark base shows a lip below);
//           its own white stroke is visible:false -> not rendered
//   3204:24 TEXT "เริ่มต้น" #fff Noto Looped Thai Bold 65.14302062988281;
//           orange stroke visible:false -> not rendered
import { escapeText, escapeAttr } from "./escape.js";

/**
 * @param {object} [opts]
 * @param {string} [opts.label]     button text (Figma default: "เริ่มต้น")
 * @param {string} [opts.id]
 * @param {string} [opts.type]      default "button"
 * @param {boolean} [opts.disabled]
 * @param {string} [opts.className]
 */
export function renderButtonOkStroke({ label = "เริ่มต้น", id, type = "button", disabled = false, className = "" } = {}) {
  const attrs = [
    `type="${escapeAttr(type)}"`,
    `class="gh-button-ok-stroke${className ? ` ${className}` : ""}"`,
    id != null ? `id="${escapeAttr(id)}"` : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<button ${attrs}>
      <span class="gh-button-ok-stroke__base"></span>
      <span class="gh-button-ok-stroke__fill"></span>
      <span class="gh-button-ok-stroke__label">${escapeText(label)}</span>
    </button>`;
}
