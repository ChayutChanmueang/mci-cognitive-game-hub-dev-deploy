// Part 1 · Current-Node-With-FryFoodIcon (Figma 3108:8) — "Current" state VARIANT
// for the daily-required fry-food game (gid PHY001). Same blue coin as the current
// number node, but the number is replaced by the pan/fried-egg icon.
//
// Ported from the verified demo (CurrentNodeWithFryFoodIcon.vue). The pan/egg
// artwork is the exact Figma-rendered icon (group 3031:132, exported PNG @4x incl.
// its own shadows), placed by its render bounds — not hand-drawn, node not rasterized.
//   3031:129 Ellipse 35 white base + DROP_SHADOW rgba(33,121,25,0.25)
//   3031:130 Ellipse 34 blue mid     fill rgb(108,133,237)
//   3031:131 Ellipse 33 blue top     fill rgb(117,168,255) + INNER_SHADOW
//   3031:132 Group      fry-food icon, render bounds rel (54.999, 48.9967) 206.0847 x 105.9737
import fryFoodIcon from "../assets/fry-food-icon.png";

export function renderCurrentFryFoodNode() {
  return `
    <div class="gh-fryfood-node">
      <div class="gh-fryfood-node__base"></div>
      <div class="gh-fryfood-node__mid"></div>
      <div class="gh-fryfood-node__top"></div>
      <img class="gh-fryfood-node__icon" src="${fryFoodIcon}" alt="" aria-hidden="true" />
    </div>`;
}
