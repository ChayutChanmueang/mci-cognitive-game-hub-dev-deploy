// Part 6 · Header-Bar(Progression) (Figma 3108:2). Ported from the verified demo
// (HeaderBarProgression.vue) and PARAMETERIZED for production data. Hidden Figma
// effects (text strokes, text/track drop shadows) are NOT rendered.
//
//   3031:429 card        958x344 white, blue OUTSIDE stroke rgb(138,197,219) 12, r52,
//                        DROP_SHADOW (0,13) r0 rgba(0,0,0,0.25)
//   3031:434 name        (60,34)      rgb(89,89,89)   Medium 52       <- patientLabel
//   3031:433 goal title  (60,98.070)  rgb(48,90,105)  Bold 62.550     <- goalTitle
//   3031:435 goal summary(60,178.945) rgb(54,144,177) Medium 37.067   <- goalSummary
//   3031:437 track       (60,240) 572x68 rgb(252,233,204) r27.8
//   3031:438 fill        (60,240) <=572x68 rgb(253,203,52) r27.8       <- progress (0..1)
//   3031:439 "x / y"     (189,239)    rgb(255,250,242) Bold 43.649     <- done/total
//   3031:440 divider     (660,36) 11x272 rgb(230,230,230) r24
//   3031:441 avatar      (692,51.5) 240x240 r52 — composed Figma render; here it is
//                        ALSO the profile button (keeps the .hub-clean-profile hook so
//                        game-hub-screen.js bind() opens the profile on click/keydown).
import avatarSrc from "./assets/header-avatar.png";
import { escapeText, escapeAttr } from "./escape.js";

/**
 * @param {object} [opts]
 * @param {string} [opts.patientLabel]
 * @param {string} [opts.goalTitle]    e.g. "เป้าหมายของวันที่ 14"
 * @param {string} [opts.goalSummary]
 * @param {number} [opts.progress]     0..1 (fill fraction)
 * @param {number|string} [opts.done]
 * @param {number|string} [opts.total]
 * @param {string} [opts.profileAriaLabel]
 */
export function renderHeaderBar({
  patientLabel = "สมชาย รักธรรมชาติ",
  goalTitle = "เป้าหมายของวันที่ 14",
  goalSummary = "บทสรุปชัยชนะ",
  progress = 1,
  done = 10,
  total = 10,
  profileAriaLabel = "เปิดโปรไฟล์ผู้เล่น",
} = {}) {
  const fillPct = Math.max(0, Math.min(1, Number(progress) || 0)) * 100;
  return `
    <div class="gh-header-bar">
      <div class="gh-header-bar__grid">
        <div class="gh-header-bar__progress-area">
          <span class="gh-header-bar__name">${escapeText(patientLabel)}</span>
          <span class="gh-header-bar__goal">${escapeText(goalTitle)}</span>
          <span class="gh-header-bar__summary">${escapeText(goalSummary)}</span>

          <div class="gh-header-bar__track"></div>
          <div class="gh-header-bar__fill"></div>
          <span class="gh-header-bar__progress-text">${escapeText(done)} / ${escapeText(total)}</span>
        </div>

        <div class="gh-header-bar__divider"></div>

        <button type="button" class="gh-header-bar__profile" data-profile-action aria-label="${escapeAttr(profileAriaLabel)}">
          <img class="gh-header-bar__avatar" src="${avatarSrc}" alt="" aria-hidden="true" />
        </button>
      </div>
    </div>`;
}
