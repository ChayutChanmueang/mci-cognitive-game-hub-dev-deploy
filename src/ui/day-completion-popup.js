import {renderFramePopupMarkup, renderFramePopupShortMarkup} from "./components/frame-popup.js";
import { dismissPopup } from "./transition/popup-transition.js";
import { getProgramEndDate, formatThaiProgramDate } from "../util/program-date-util.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// Gender-specific characters. DB gender is "male"/"female" (see signup-screen.js);
// anything else falls back to the man.
const CHARACTER_IMAGE_BASE = "/assets/common/character";

function getRestingCharacter(gender) {
    const isFemale = String(gender || "").trim().toLowerCase() === "female";
    return {
        src: `${CHARACTER_IMAGE_BASE}/${isFemale ? "female/OldWoman" : "man/OldMan"}_resting_02.png`,
        alt: isFemale ? "คุณยายกำลังพัก" : "คุณตากำลังพัก",
    };
}

// US-E7-28: the program-complete popup uses the floor-seated figure (OldMan/OldWoman_resting.png),
// gender-based, matching the owner's reference design.
function getThankYouCharacter(gender) {
    const isFemale = String(gender || "").trim().toLowerCase() === "female";
    return {
        src: `${CHARACTER_IMAGE_BASE}/${isFemale ? "female/OldWoman" : "man/OldMan"}_resting.png`,
        alt: isFemale ? "คุณยาย" : "คุณตา",
    };
}

function mountFramePopup({ overlay, dismissible, resolve }) {
    let settled = false;
    const cleanup = (result) => {
        if (settled) return;
        settled = true;
        document.removeEventListener("keydown", onKeyDown);
        // Play the leave animation, then remove + resolve (US-E7-20).
        dismissPopup(overlay).then(() => resolve(result));
    };

    function onKeyDown(event) {
        if (event.key === "Escape" && dismissible) cleanup(false);
    }

    overlay.querySelector(".gh-start-button")?.addEventListener("click", () => cleanup(true));
    if (dismissible) {
        overlay.querySelector(".app-popup__backdrop")?.addEventListener("click", () => cleanup(false));
    }

    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown);
}

// US-E7-16 AC#2 + US-E7-04 + US-E7-25: shown when the player has already completed today's
// goal and re-enters on the same day. "วันนี้พักก่อน" with the gender resting character
// (คุณตา/คุณยาย, reclining beanbag art *_resting_02.png) inside the Figma Frame_Form_Panel
// + a single green Start-Game-Button. Shadow is widened/seated for the beanbag pose in CSS.
export function showDayCompletionPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        gender = "",
        dismissible = false,
    } = options;

    return new Promise((resolve) => {
        const character = getRestingCharacter(gender);
        const overlay = document.createElement("div");
        overlay.className = "app-popup";
        overlay.innerHTML = renderFramePopupShortMarkup({
            variant: "rest-day",
            title: "วันนี้พักก่อน",
            ariaLabel: "วันนี้พักก่อน",
            buttonLabel: "กลับหน้าหลัก",
            body: `
                <div class="gh-popup__character">
                    <img class="gh-popup__character-img" src="${character.src}" alt="${escapeHtml(character.alt)}" draggable="false" />
                    <span class="character-shadow gh-popup__character-shadow" aria-hidden="true"></span>
                </div>
                <p class="gh-popup-short__message">กลับมาเล่นใหม่วันพรุ่งนี้นะ</p>
            `,
        });

        mountFramePopup({ overlay, dismissible, resolve });
    });
}

// US-E7-04 / US-E7-28: shown when the player finishes the whole program. "โปรแกรมจบแล้ว"
// with the gender finish-line character, a thank-you line, and the program start/end dates
// (DD/MM/YY พ.ศ.), in the same Frame_Form_Panel + Start-Game-Button art.
export function showProgramCompletionPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        programDayCount = 14,
        gender = "",
        dismissible = false,
        startedProgram = "",
        programEndDate = "",
    } = options;

    return new Promise((resolve) => {
        const character = getThankYouCharacter(gender);

        // Program date range (US-E7-28): start from the player's program start date; end
        // from the stored end date, else computed as start + programDayCount. Formatted as
        // DD/MM/YY พ.ศ. via the shared util. Hide the lines entirely if there's no valid
        // start date, so we never render an empty/NaN row.
        const startText = startedProgram ? formatThaiProgramDate(startedProgram) : "";
        const endSource = programEndDate || getProgramEndDate(startedProgram, programDayCount);
        const endText = endSource ? formatThaiProgramDate(endSource) : "";
        const datesMarkup = startText && endText
            ? `
                <div class="gh-popup__dates" aria-label="ช่วงเวลาของโปรแกรม">
                    <p class="gh-popup__date-line">เริ่มต้น <span class="gh-popup__date-value">${escapeHtml(startText)}</span></p>
                    <p class="gh-popup__date-line">สิ้นสุด <span class="gh-popup__date-value">${escapeHtml(endText)}</span></p>
                </div>
            `
            : "";

        const overlay = document.createElement("div");
        overlay.className = "app-popup";
        overlay.innerHTML = renderFramePopupMarkup({
            variant: "program-complete",
            title: "โปรแกรมจบแล้ว",
            ariaLabel: "โปรแกรมจบแล้ว",
            buttonLabel: "ตกลง",
            body: `
                <div class="gh-popup__character">
                    <img class="gh-popup__character-img" src="${character.src}" alt="${escapeHtml(character.alt)}" draggable="false" />
                    <span class="character-shadow gh-popup__character-shadow" aria-hidden="true"></span>
                </div>
                <div class="gh-popup__complete-text">
                    <p class="gh-popup__message">ขอบคุณสำหรับการร่วมมือนะ</p>
                    ${datesMarkup}
                </div>
            `,
        });

        mountFramePopup({ overlay, dismissible, resolve });
    });
}
