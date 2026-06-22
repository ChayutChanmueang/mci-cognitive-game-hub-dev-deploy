// Part 5 · Floating Action Buttons (Figma 3108:3 Go-To-Top, 3108:4 Leaderboard).
// Ported from the verified demo (FabButton.vue). Rendered as a real <button> with
// the production DOM-Contract hooks so bind()/the scroll controller wire the click.
//
// Shared container (160x160): fill rgb(236,249,242), white OUTSIDE stroke 12,
// cornerRadius 25, DROP_SHADOW (0,6) r0 rgba(0,0,0,0.25).
//   arrow  (3108:3): 3031:449 Union blue rgb(121,172,239) white stroke 10 +
//     DROP_SHADOW (0,4) r4 — exact Figma SVG, render bounds rel (28.209,25.474).
//   trophy (3108:4): 3031:427 IMAGE — exact Figma SVG (image fill + own drop shadow).
//
// Arrow up/down state: the scroll controller already sets data-scroll-direction
// ("up"|"down") on the [data-scroll-top] button. We flip the up-arrow via CSS
// (rotate 180deg on [data-scroll-direction="down"]) — NO controller change. The
// controller's `md-icon` textContent swap is skipped harmlessly (no md-icon here).
const trophySrc = "/assets/gamehub/icon/leaderboard-trophy.svg";
const arrowSrc = "/assets/gamehub/icon/scroll-top-arrow.svg";
import { escapeAttr } from "./escape.js";

const ARROW_SVG = `<img class="gh-fab__arrow" src="${arrowSrc}" alt="" aria-hidden="true" />`;

/**
 * @param {object} [opts]
 * @param {"arrow"|"trophy"} [opts.icon]   which icon
 * @param {"scroll-top"|"leaderboard"} [opts.action]  which DOM-Contract hook to emit
 * @param {string} [opts.ariaLabel]        accessible label
 */
export function renderFab({ icon = "arrow", action, ariaLabel } = {}) {
  const dataAttr =
    action === "leaderboard" ? "data-leaderboard-action" : action === "scroll-top" ? "data-scroll-top" : "";
  const aria = ariaLabel ? `aria-label="${escapeAttr(ariaLabel)}"` : "";
  const inner =
    icon === "trophy"
      ? `<img class="gh-fab__trophy" src="${trophySrc}" alt="" aria-hidden="true" />`
      : ARROW_SVG;
  return `<button type="button" class="gh-fab" ${dataAttr} ${aria}>${inner}</button>`;
}
