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
import { escapeAttr } from "./escape.js";

const ARROW_SVG = `<svg class="gh-fab__arrow" width="103.6847" height="117.5284" viewBox="0 0 104 118" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#fab_arrow_d)">
        <mask id="fab_arrow_mask" maskUnits="userSpaceOnUse" x="3.01843" y="0" width="97" height="110" fill="black">
          <rect fill="white" x="3.01843" width="97" height="110" />
          <path d="M46.296 12.7296C49.0981 9.09011 54.5866 9.09013 57.3887 12.7296L88.2003 52.754C91.7436 57.357 88.4622 64.0244 82.6534 64.0246H72.8409V86.5285C72.8409 93.7081 67.0205 99.5284 59.8409 99.5285H43.8409C36.6612 99.5285 30.8409 93.7082 30.8409 86.5285V64.0246H21.0313C15.2226 64.0244 11.9411 57.357 15.4844 52.754L46.296 12.7296Z" />
        </mask>
        <path d="M46.296 12.7296C49.0981 9.09011 54.5866 9.09013 57.3887 12.7296L88.2003 52.754C91.7436 57.357 88.4622 64.0244 82.6534 64.0246H72.8409V86.5285C72.8409 93.7081 67.0205 99.5284 59.8409 99.5285H43.8409C36.6612 99.5285 30.8409 93.7082 30.8409 86.5285V64.0246H21.0313C15.2226 64.0244 11.9411 57.357 15.4844 52.754L46.296 12.7296Z" fill="#79ACEF" />
        <path d="M46.296 12.7296L38.3723 6.62915L38.372 6.6296L46.296 12.7296ZM57.3887 12.7296L65.3127 6.6296L65.3124 6.62912L57.3887 12.7296ZM88.2003 52.754L96.1243 46.6541L96.1243 46.654L88.2003 52.754ZM82.6534 64.0246V74.0246H82.6536L82.6534 64.0246ZM72.8409 64.0246V54.0246H62.8409V64.0246H72.8409ZM59.8409 99.5285V109.528H59.841L59.8409 99.5285ZM30.8409 64.0246H40.8409V54.0246H30.8409V64.0246ZM21.0313 64.0246L21.0311 74.0246H21.0313V64.0246ZM15.4844 52.754L7.56045 46.654L7.56038 46.6541L15.4844 52.754ZM46.296 12.7296L54.2196 18.8301C53.0186 20.39 50.666 20.3899 49.4651 18.8302L57.3887 12.7296L65.3124 6.62912C58.5072 -2.20966 45.1775 -2.20976 38.3723 6.62915L46.296 12.7296ZM57.3887 12.7296L49.4647 18.8297L80.2763 58.8541L88.2003 52.754L96.1243 46.654L65.3127 6.6296L57.3887 12.7296ZM88.2003 52.754L80.2762 58.854C78.7578 56.8815 80.1635 54.0246 82.6532 54.0246L82.6534 64.0246L82.6536 74.0246C96.7608 74.0243 104.729 57.8325 96.1243 46.6541L88.2003 52.754ZM82.6534 64.0246V54.0246H72.8409V64.0246V74.0246H82.6534V64.0246ZM72.8409 64.0246H62.8409V86.5285H72.8409H82.8409V64.0246H72.8409ZM72.8409 86.5285H62.8409C62.8409 88.1852 61.4977 89.5285 59.8408 89.5285L59.8409 99.5285L59.841 109.528C72.5433 109.528 82.8409 99.231 82.8409 86.5285H72.8409ZM59.8409 99.5285V89.5285H43.8409V99.5285V109.528H59.8409V99.5285ZM43.8409 99.5285V89.5285C42.184 89.5285 40.8409 88.1853 40.8409 86.5285H30.8409H20.8409C20.8409 99.231 31.1383 109.528 43.8409 109.528V99.5285ZM30.8409 86.5285H40.8409V64.0246H30.8409H20.8409V86.5285H30.8409ZM30.8409 64.0246V54.0246H21.0313V64.0246V74.0246H30.8409V64.0246ZM21.0313 64.0246L21.0316 54.0246C23.5212 54.0246 24.927 56.8814 23.4085 58.854L15.4844 52.754L7.56038 46.6541C-1.04479 57.8326 6.92393 74.0242 21.0311 74.0246L21.0313 64.0246ZM15.4844 52.754L23.4084 58.8541L54.22 18.8297L46.296 12.7296L38.372 6.6296L7.56045 46.654L15.4844 52.754Z" fill="white" mask="url(#fab_arrow_mask)" />
      </g>
      <defs>
        <filter id="fab_arrow_d" x="0" y="0" width="103.685" height="117.528" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>`;

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
