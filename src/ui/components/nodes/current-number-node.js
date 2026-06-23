// Part 1 · Current-Node-With-Number (Figma 3108:113) — "Current" state: the game
// the player is on right now. Larger + blue vs Next/Pass.
//
// Ported from the verified demo (CurrentNodeWithNumber.vue).
//   3108:95 Ellipse 35  white base + DROP_SHADOW rgba(33,121,25,0.25)
//   3108:96 Ellipse 34  blue mid     fill rgb(108,133,237)
//   3108:97 Ellipse 33  blue top     fill rgb(117,168,255) + INNER_SHADOW
//   3108:111 TEXT       number (white + inner shadow) — see number-glyph.js
import { renderNumberGlyph } from "./number-glyph.js";

export function renderCurrentNumberNode(number = 1) {
  return `
    <div class="gh-current-node">
      <div class="gh-current-node__base"></div>
      <div class="gh-current-node__mid"></div>
      <div class="gh-current-node__top"></div>
      ${renderNumberGlyph(number, { centerX: 147.245332, top: 26.996216 })}
    </div>`;
}
