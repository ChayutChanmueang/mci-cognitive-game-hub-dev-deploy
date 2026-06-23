// Part 4 · Label-Node-With-Play-Button -> LessonCard (Figma 3108:26). Composite.
// Ported from the verified demo (LessonCard.vue).
//
//   3031:412 Union  card body + left tail (boolean op) — exact Figma SVG export
//                   (rounded-rect-with-tail, white OUTSIDE stroke 10, DROP_SHADOW
//                   (0,11.75) r0 rgba(0,0,0,0.25), fill rgb(236,249,242)).
//                   Render bounds rel (-10,-1) size 678.137 x 463.75.
//   3031:416 TEXT   category "ภาษา"        (93,0)        green rgb(103,163,42) Bold 78.551
//   3031:417 TEXT   title    "Context Clues"(93,101.656) green rgb(142,207,77) Medium 51.982
//   3031:418 TEXT   description            (93,184.828)  gray rgb(94,94,94)    Medium 36.965 (wraps w515.203)
//   3108:69  INSTANCE Start-Game-Button at (81,360) -> nested renderStartGameButton
import { escapeText } from "./escape.js";
import { renderStartGameButton } from "./start-game-button.js";

const PANEL_SVG = `<svg class="gh-lesson-card__panel" width="678.13672" height="463.75049" viewBox="0 0 679 464" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#lc_filter0_d)">
        <mask id="lc_path-1-outside-1" maskUnits="userSpaceOnUse" x="0" y="0" width="679" height="452" fill="black">
          <rect fill="white" width="679" height="452" />
          <path d="M617.218 10C645.339 10 668.137 32.7974 668.137 60.9189V391.081C668.137 419.203 645.339 442 617.218 442H104.056C75.9341 442 53.1367 419.203 53.1367 391.081V178.357L15.0352 157.182C8.32164 153.45 8.3216 143.795 15.0352 140.063L53.1367 118.888V60.9189C53.1367 32.7974 75.9341 10 104.056 10H617.218Z" />
        </mask>
        <path d="M617.218 10C645.339 10 668.137 32.7974 668.137 60.9189V391.081C668.137 419.203 645.339 442 617.218 442H104.056C75.9341 442 53.1367 419.203 53.1367 391.081V178.357L15.0352 157.182C8.32164 153.45 8.3216 143.795 15.0352 140.063L53.1367 118.888V60.9189C53.1367 32.7974 75.9341 10 104.056 10H617.218Z" fill="#ECF9F2" />
        <path d="M53.1367 178.357H63.1367V172.475L57.9946 169.617L53.1367 178.357ZM15.0352 157.182L10.1772 165.922L10.1773 165.922L15.0352 157.182ZM15.0352 140.063L19.893 148.804H19.893L15.0352 140.063ZM53.1367 118.888L57.9946 127.628L63.1367 124.771V118.888H53.1367ZM617.218 10V20C639.816 20 658.137 38.3203 658.137 60.9189H668.137H678.137C678.137 27.2746 650.862 0 617.218 0V10ZM668.137 60.9189H658.137V391.081H668.137H678.137V60.9189H668.137ZM668.137 391.081H658.137C658.137 413.68 639.816 432 617.218 432V442V452C650.862 452 678.137 424.725 678.137 391.081H668.137ZM617.218 442V432H104.056V442V452H617.218V442ZM104.056 442V432C81.457 432 63.1367 413.68 63.1367 391.081H53.1367H43.1367C43.1367 424.725 70.4113 452 104.056 452V442ZM53.1367 391.081H63.1367V178.357H53.1367H43.1367V391.081H53.1367ZM53.1367 178.357L57.9946 169.617L19.893 148.441L15.0352 157.182L10.1773 165.922L48.2788 187.098L53.1367 178.357ZM15.0352 157.182L19.8931 148.441C19.8598 148.422 19.8692 148.423 19.8978 148.451C19.9249 148.478 19.9502 148.512 19.9694 148.546C20.0046 148.608 20 148.635 20 148.623C20 148.61 20.0046 148.637 19.9694 148.699C19.9502 148.733 19.9249 148.767 19.8977 148.794C19.8691 148.822 19.8598 148.823 19.893 148.804L15.0352 140.063L10.1773 131.323C-3.39254 138.864 -3.39229 158.381 10.1772 165.922L15.0352 157.182ZM15.0352 140.063L19.893 148.804L57.9946 127.628L53.1367 118.888L48.2788 110.147L10.1773 131.323L15.0352 140.063ZM53.1367 118.888H63.1367V60.9189H53.1367H43.1367V118.888H53.1367ZM53.1367 60.9189H63.1367C63.1367 38.3203 81.457 20 104.056 20V10V0C70.4113 0 43.1367 27.2746 43.1367 60.9189H53.1367ZM104.056 10V20H617.218V10V0H104.056V10Z" fill="white" mask="url(#lc_path-1-outside-1)" />
      </g>
      <defs>
        <filter id="lc_filter0_d" x="0" y="0" width="678.137" height="463.75" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="11.7504" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>`;

/**
 * @param {object} [opts]
 * @param {string} [opts.category]    3031:416 label
 * @param {string} [opts.title]       3031:417 title
 * @param {string} [opts.description] 3031:418 description (wraps)
 * @param {string} [opts.buttonLabel] nested button text
 * @param {string} [opts.nodeId]      -> button data-node-id (set when wiring)
 * @param {number|string} [opts.day]  -> button data-day
 * @param {boolean} [opts.disabled]   disable the button
 * @param {boolean} [opts.showButton] render the nested start button (false for
 *                                    current rest/check-in cards, which have no game)
 */
export function renderLessonCard({
  category = "ภาษา",
  title = "Context Clues",
  description = "ฝึกการเข้าใจคำศัพท์ความหมาย และการใช้ภาษาในบริบทต่างๆ",
  buttonLabel = "เริ่มเล่นเกม",
  nodeId,
  day,
  disabled = false,
  showButton = true,
} = {}) {
  const button = showButton
    ? `<div class="gh-lesson-card__button">${renderStartGameButton({ label: buttonLabel, nodeId, day, disabled })}</div>`
    : "";
  return `
    <div class="gh-lesson-card">
      ${PANEL_SVG}
      <span class="gh-lesson-card__category">${escapeText(category)}</span>
      <span class="gh-lesson-card__title">${escapeText(title)}</span>
      <p class="gh-lesson-card__desc">${escapeText(description)}</p>
      ${button}
    </div>`;
}
