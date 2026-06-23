// Part 2 · Current-Line-between (Figma 3108:10) — SOLID connector state: used for
// the connector FROM the current node TO the next node. Ported verbatim from the
// verified demo (CurrentLineBetween.vue).
//   3031:259 RECTANGLE 24 x 166, fill #fff, cornerRadius 52 (pill),
//            DROP_SHADOW offset(0,5) radius0 rgba(0,0,0,0.25) (sharp, no blur)

export function renderCurrentLine() {
  return `<div class="gh-current-line"></div>`;
}
