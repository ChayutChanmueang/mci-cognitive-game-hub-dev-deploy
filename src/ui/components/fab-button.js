// Part 5 · Floating Action Buttons (Figma 3108:3 Go-To-Top, 3108:4 Leaderboard,
// 3153:15 Go-To-Bottom). Ported from the verified demo (FabButton.vue). Rendered as
// a real <button> with the production DOM-Contract hooks so bind()/the scroll
// controller wire the click.
//
// Shared container (160x160): fill rgb(236,249,242), white OUTSIDE stroke 12,
// cornerRadius 25, DROP_SHADOW (0,6) r0 rgba(0,0,0,0.25).
//   arrow      (3108:3):  3031:449 Union blue rgb(121,172,239) white stroke 10 +
//     DROP_SHADOW (0,4) r4 — exact Figma SVG, render bounds rel (28.209,25.474).
//   arrow-down (3153:15): 3153:11 Union — same container/style, arrow points DOWN.
//     Exact Figma SVG (its drop shadow stays (0,+4) below the arrowhead, so a 180°
//     rotation of the up-arrow would NOT match — use this component's own export).
//     Identical render bounds rel (28.209,25.474) -> reuses .gh-fab__arrow.
//   trophy     (3108:4):  3031:427 IMAGE — exact Figma SVG (image fill + own shadow).
//
// Scroll-top up/down state: the controller sets data-scroll-direction ("up"|"down")
// on the [data-scroll-top] button; the button carries BOTH real arrow SVGs and CSS
// shows the matching one (no JS swap, NO controller change). The down state now uses
// the dedicated scroll-bottom-arrow.svg export (its drop shadow stays below the
// arrowhead), instead of a 180deg rotation of the up-arrow. (The dedicated Go-To-Bottom
// FAB is a separate static button using icon="arrow-down".)
const trophySrc = "/assets/gamehub/icon/leaderboard-trophy.svg";
const arrowSrc = "/assets/gamehub/icon/scroll-top-arrow.svg";
const arrowDownSrc = "/assets/gamehub/icon/scroll-bottom-arrow.svg";
import { escapeAttr } from "./escape.js";

const ARROW_UP_SVG = `<img class="gh-fab__arrow gh-fab__arrow--up" src="${arrowSrc}" alt="" aria-hidden="true" />`;
const ARROW_DOWN_SVG = `<img class="gh-fab__arrow gh-fab__arrow--down" src="${arrowDownSrc}" alt="" aria-hidden="true" />`;
// scroll-top FAB carries both arrows; CSS shows one via data-scroll-direction.
const ARROW_FLIP_SVG = `${ARROW_UP_SVG}${ARROW_DOWN_SVG}`;

/**
 * @param {object} [opts]
 * @param {"arrow"|"arrow-down"|"trophy"} [opts.icon]   which icon
 * @param {"scroll-top"|"scroll-bottom"|"leaderboard"} [opts.action]  DOM-Contract hook to emit
 * @param {string} [opts.ariaLabel]        accessible label
 */
export function renderFab({ icon = "arrow", action, ariaLabel } = {}) {
  const dataAttr =
    action === "leaderboard" ? "data-leaderboard-action"
      : action === "scroll-top" ? "data-scroll-top"
      : action === "scroll-bottom" ? "data-scroll-bottom"
      : "";
  const aria = ariaLabel ? `aria-label="${escapeAttr(ariaLabel)}"` : "";
  const inner =
    icon === "trophy"
      ? `<img class="gh-fab__trophy" src="${trophySrc}" alt="" aria-hidden="true" />`
      : icon === "arrow-down"
        ? ARROW_DOWN_SVG
        : ARROW_FLIP_SVG;
  return `<button type="button" class="gh-fab" ${dataAttr} ${aria}>${inner}</button>`;
}
