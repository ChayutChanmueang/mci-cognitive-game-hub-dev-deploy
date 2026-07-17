// Button_OK (Figma 3161:643). Ported from the verified demo (ButtonOk.vue). A green
// gradient pill (confirm/positive action), rendered as a real <button>. The Figma
// component carries no text, so a label span is added.
//
//   3161:644 base rgb(65,134,29), cornerRadius 62.171
//   3161:645 fill gradient rgb(125,215,76) -> rgb(74,157,29) (top-aligned; dark lip below)
import { escapeText, escapeAttr } from "./escape.js";

/**
 * @param {object} [opts]
 * @param {string} [opts.label]
 * @param {string} [opts.id]
 * @param {string} [opts.type]      default "button"
 * @param {boolean} [opts.disabled]
 * @param {string} [opts.className]
 */
export function renderButtonOk({ label = "", id, type = "button", disabled = false, className = "" } = {}) {
  const attrs = [
    `type="${escapeAttr(type)}"`,
    `class="gh-button-ok${className ? ` ${className}` : ""}"`,
    id != null ? `id="${escapeAttr(id)}"` : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<button ${attrs}>
      <span class="gh-button-ok__base"></span>
      <span class="gh-button-ok__fill"></span>
      <span class="gh-button-ok__label">${escapeText(label)}</span>
    </button>`;
}
