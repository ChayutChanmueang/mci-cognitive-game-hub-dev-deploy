// Icon_ButtonBack (Figma 3161:652). Ported from the verified demo (IconButtonBack.vue):
// an exact Figma SVG export (blue fill rgb(121,172,239), white OUTSIDE stroke 10, drop
// shadow). Rendered inside a real <button> for interactivity + a11y.
import { escapeAttr } from "./escape.js";

const BACK_SVG = `
    <svg class="gh-icon-button-back__svg" width="118" height="104" viewBox="0 0 118 104" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g filter="url(#ghIconBackDropShadow)">
        <mask id="ghIconBackStrokeMask" maskUnits="userSpaceOnUse" x="4" y="-0.333984" width="110" height="97" fill="black">
          <rect fill="white" x="4" y="-0.333984" width="110" height="97" />
          <path d="M16.7296 53.3885C13.0901 50.5864 13.0901 45.0978 16.7296 42.2957L56.754 11.4842C61.357 7.94083 68.0244 11.2223 68.0246 17.0311V26.8436L90.5285 26.8436C97.7081 26.8436 103.528 32.6639 103.528 39.8436V55.8436C103.528 63.0233 97.7082 68.8436 90.5285 68.8436H68.0246V78.6531C68.0244 84.4619 61.357 87.7433 56.754 84.2L16.7296 53.3885Z" />
        </mask>
        <path d="M16.7296 53.3885C13.0901 50.5864 13.0901 45.0978 16.7296 42.2957L56.754 11.4842C61.357 7.94083 68.0244 11.2223 68.0246 17.0311V26.8436L90.5285 26.8436C97.7081 26.8436 103.528 32.6639 103.528 39.8436V55.8436C103.528 63.0233 97.7082 68.8436 90.5285 68.8436H68.0246V78.6531C68.0244 84.4619 61.357 87.7433 56.754 84.2L16.7296 53.3885Z" fill="#79ACEF" />
        <path d="M16.7296 53.3885L10.6291 61.3121L10.6296 61.3125L16.7296 53.3885ZM16.7296 42.2957L10.6296 34.3717L10.6291 34.3721L16.7296 42.2957ZM56.754 11.4842L50.6541 3.56013L50.654 3.5602L56.754 11.4842ZM68.0246 17.0311H78.0246V17.0309L68.0246 17.0311ZM68.0246 26.8436H58.0246L58.0246 36.8436H68.0246V26.8436ZM103.528 39.8436H113.528V39.8435L103.528 39.8436ZM68.0246 68.8436V58.8436H58.0246V68.8436H68.0246ZM68.0246 78.6531L78.0246 78.6534V78.6531H68.0246ZM56.754 84.2L50.654 92.124L50.6541 92.1241L56.754 84.2ZM16.7296 53.3885L22.8301 45.4648C24.39 46.6658 24.3899 49.0184 22.8302 50.2193L16.7296 42.2957L10.6291 34.3721C1.79034 41.1772 1.79024 54.507 10.6291 61.3121L16.7296 53.3885ZM16.7296 42.2957L22.8297 50.2197L62.8541 19.4082L56.754 11.4842L50.654 3.5602L10.6296 34.3717L16.7296 42.2957ZM56.754 11.4842L62.854 19.4082C60.8815 20.9267 58.0246 19.521 58.0246 17.0313L68.0246 17.0311L78.0246 17.0309C78.0243 2.9236 61.8325 -5.04501 50.6541 3.56013L56.754 11.4842ZM68.0246 17.0311H58.0246V26.8436H68.0246L78.0246 26.8436V17.0311H68.0246ZM68.0246 26.8436V36.8436L90.5285 36.8436V26.8436V16.8436H68.0246V26.8436ZM90.5285 26.8436V36.8436C92.1852 36.8436 93.5285 38.1867 93.5285 39.8436L103.528 39.8436L113.528 39.8435C113.528 27.1411 103.231 16.8436 90.5285 16.8436V26.8436ZM103.528 39.8436H93.5285V55.8436L103.528 55.8436H113.528V39.8436H103.528ZM103.528 55.8436L93.5285 55.8436C93.5285 57.5004 92.1853 58.8436 90.5285 58.8436V68.8436V78.8436C103.231 78.8436 113.528 68.5461 113.528 55.8436H103.528ZM90.5285 68.8436V58.8436H68.0246V68.8436V78.8436H90.5285V68.8436ZM68.0246 68.8436H58.0246V78.6531H68.0246H78.0246V68.8436H68.0246ZM68.0246 78.6531L58.0246 78.6529C58.0246 76.1633 60.8814 74.7575 62.854 76.2759L56.754 84.2L50.6541 92.1241C61.8326 100.729 78.0242 92.7605 78.0246 78.6534L68.0246 78.6531ZM56.754 84.2L62.8541 76.276L22.8297 45.4645L16.7296 53.3885L10.6296 61.3125L50.654 92.124L56.754 84.2Z" fill="white" mask="url(#ghIconBackStrokeMask)" />
      </g>
      <defs>
        <filter id="ghIconBackDropShadow" x="0" y="0" width="117.529" height="103.685" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
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
 * @param {string} [opts.id]
 * @param {string} [opts.ariaLabel]
 * @param {string} [opts.className]
 */
export function renderIconButtonBack({ id, ariaLabel = "ย้อนกลับ", className = "" } = {}) {
  const attrs = [
    'type="button"',
    `class="gh-icon-button-back${className ? ` ${className}` : ""}"`,
    id != null ? `id="${escapeAttr(id)}"` : "",
    `aria-label="${escapeAttr(ariaLabel)}"`,
  ]
    .filter(Boolean)
    .join(" ");

  return `<button ${attrs}>${BACK_SVG}</button>`;
}
