// Part 1 · Next-Node-With-Number (Figma 3108:19 / raw 3031:189..194) — "Next" state:
// game not yet reached or not yet passed (future / locked).
//
// Ported from the verified demo (NextNodeWithNumber.vue). Gray coin + game number.
//   3031:191 Ellipse 35 white base   + DROP_SHADOW rgba(33,121,25,0.25)
//   3031:192 Ellipse 34 gray mid      fill rgb(148,152,154)
//   3031:193 Ellipse 33 gray-blue top fill rgb(166,185,200) + INNER_SHADOW
//   3031:194 TEXT       number (white + inner shadow) — see number-glyph.js
import { renderNumberGlyph } from "./number-glyph.js";

export function renderNextNumberNode(number = 2) {
  return `
    <div class="gh-next-node">
      <div class="gh-next-node__base"></div>
      <div class="gh-next-node__mid"></div>
      <div class="gh-next-node__top"></div>
      ${renderNumberGlyph(number, { centerX: 122.93885, top: 8.9061 })}
    </div>`;
}
