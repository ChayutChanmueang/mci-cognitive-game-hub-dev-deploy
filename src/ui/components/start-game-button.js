// Part 4 · Start-Game-Button (Figma 3108:68). Ported from the verified demo
// (StartGameButton.vue). Rendered as a real <button> so it keeps production
// interactivity + a11y; the parent game-hub-screen.js bind() wires the click via
// the data-node-action hook (DOM Contract).
//
//   3108:63 base 540.3278 x 186.7422 fill rgb(66,134,29), white OUTSIDE stroke
//           10.714716 (box-shadow spread), cornerRadius 79.595
//   3108:64 gradient 540.3278 x 179.8542 vertical rgb(125,215,76)->rgb(74,157,29)
//           (top-aligned; dark base shows a ~6.888px lip at the bottom)
//   3108:66 TEXT label rgb #fff Noto Looped Thai Bold 66.719
import { escapeText, escapeAttr } from "./escape.js";

/**
 * @param {object} [opts]
 * @param {string} [opts.label]    button text (Figma: "เริ่มเล่นเกม")
 * @param {string} [opts.nodeId]   -> data-node-id (DOM Contract; set when wiring)
 * @param {number|string} [opts.day] -> data-day
 * @param {boolean} [opts.disabled] disable + dim (program ended)
 */
export function renderStartGameButton({ label = "เริ่มเล่นเกม", nodeId, day, disabled = false } = {}) {
  const attrs = [
    'type="button"',
    'class="gh-start-button"',
    "data-node-action",
    nodeId != null ? `data-node-id="${escapeAttr(nodeId)}"` : "",
    day != null ? `data-day="${escapeAttr(day)}"` : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<button ${attrs}>
      <span class="gh-start-button__base"></span>
      <span class="gh-start-button__fill"></span>
      <span class="gh-start-button__label">${escapeText(label)}</span>
    </button>`;
}
