// Part 2 · NextGame-Line-Dot-between (Figma 3108:27) — DOTTED connector state:
// used for every connector except the current→next one — i.e. between Pass
// (already-played) nodes and between Next (not-yet-played) nodes. Ported verbatim
// from the verified demo (NextGameLineDotBetween.vue).
//   3108:21/22/23 Rectangle  24x24 dots at y = 0 / 38 / 75, fill #fff,
//                 cornerRadius 52 (circle), DROP_SHADOW offset(0,5) radius0 rgba(0,0,0,0.25)

export function renderDotLine() {
  return `<div class="gh-dot-line">
      <span class="gh-dot-line__dot" style="top:0"></span>
      <span class="gh-dot-line__dot" style="top:38px"></span>
      <span class="gh-dot-line__dot" style="top:75px"></span>
    </div>`;
}
