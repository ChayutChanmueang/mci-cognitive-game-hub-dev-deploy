// Part 3 · Day-Section (Figma 3108:7) — the "วันที่ N" pill + divider row.
// Ported verbatim from the verified demo (DaySection.vue). Hidden Figma effects
// (white pill shadow, text stroke, text shadow — all visible:false) are NOT rendered.
//   3031:124 Rectangle 843 gray lower pill 259x98 rgb(199,199,199) r88 + DROP_SHADOW (0,13) r4
//   3031:125 Rectangle 842 white top pill  259x90 #fff r88 (shadow hidden)
//   3031:126 TEXT          label at (80,10) rgb(105,105,105) Noto Looped Thai Bold 43
//   3031:127 Rectangle 855 divider (288,44) 792x5 white @0.71 r10
import { escapeText } from "./escape.js";

/**
 * @param {string} label  day label text, e.g. "วันที่ 1"
 */
export function renderDaySectionHeader(label = "วันที่ 1") {
  return `
    <div class="gh-day-section">
      <div class="gh-day-section__pill-base"></div>
      <div class="gh-day-section__pill-top"></div>
      <span class="gh-day-section__label">${escapeText(label)}</span>
      <div class="gh-day-section__divider"></div>
    </div>`;
}
