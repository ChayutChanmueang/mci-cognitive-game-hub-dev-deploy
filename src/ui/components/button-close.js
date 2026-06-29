// Button_Close (Figma 3161:649). Ported from the verified demo (ButtonClose.vue). A red
// gradient pill (cancel/negative action), rendered as a real <button>. The Figma
// component carries no text, so a label span is added.
//
//   3161:650 base rgb(201,45,45), cornerRadius 62.171
//   3161:651 fill gradient rgb(252,106,106) -> rgb(242,50,50) (top-aligned; dark lip below)
import { escapeText, escapeAttr } from "./escape.js";

/**
 * @param {object} [opts]
 * @param {string} [opts.label]
 * @param {string} [opts.id]
 * @param {string} [opts.type]      default "button"
 * @param {boolean} [opts.disabled]
 * @param {string} [opts.className]
 */
export function renderButtonClose({ label = "", id, type = "button", disabled = false, className = "" } = {}) {
  const attrs = [
    `type="${escapeAttr(type)}"`,
    `class="gh-button-close${className ? ` ${className}` : ""}"`,
    id != null ? `id="${escapeAttr(id)}"` : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<button ${attrs}>
      <span class="gh-button-close__base"></span>
      <span class="gh-button-close__fill"></span>
      <span class="gh-button-close__label">${escapeText(label)}</span>
    </button>`;
}
