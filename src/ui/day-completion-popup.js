import {renderFramePopupMarkup, renderFramePopupShortMarkup} from "./components/frame-popup.js";

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
        src: `${CHARACTER_IMAGE_BASE}/${isFemale ? "female/OldWoman" : "man/OldMan"}_resting.png`,
        alt: isFemale ? "คุณยายกำลังพัก" : "คุณตากำลังพัก",
    };
}

function getFinishCharacter(gender) {
    const isFemale = String(gender || "").trim().toLowerCase() === "female";
    return {
        src: `${CHARACTER_IMAGE_BASE}/${isFemale ? "female/OldWoman" : "man/OldMan"}_finish-line.png`,
        alt: isFemale ? "คุณยายเข้าเส้นชัย" : "คุณตาเข้าเส้นชัย",
    };
}

function mountFramePopup({ overlay, dismissible, resolve }) {
    let settled = false;
    const cleanup = (result) => {
        if (settled) return;
        settled = true;
        overlay.remove();
        document.removeEventListener("keydown", onKeyDown);
        resolve(result);
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

// US-E7-16 AC#2 + US-E7-04: shown when the player has already completed today's goal and
// re-enters on the same day. "วันนี้พักก่อน" with the gender resting character (คุณตา/คุณยาย)
// inside the Figma Frame_Form_Panel + a single green Start-Game-Button.
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

// US-E7-04: shown when the player finishes the whole program. "ยินดีด้วย" with the gender
// finish-line character, in the same Frame_Form_Panel + Start-Game-Button art.
export function showProgramCompletionPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        programDayCount = 14,
        gender = "",
        dismissible = false,
    } = options;

    return new Promise((resolve) => {
        const character = getFinishCharacter(gender);
        const overlay = document.createElement("div");
        overlay.className = "app-popup";
        overlay.innerHTML = renderFramePopupMarkup({
            title: "ยินดีด้วย",
            ariaLabel: "ยินดีด้วย",
            buttonLabel: "กลับหน้าหลัก",
            body: `
                <div class="gh-popup__character">
                    <img class="gh-popup__character-img" src="${character.src}" alt="${escapeHtml(character.alt)}" draggable="false" />
                    <span class="character-shadow gh-popup__character-shadow" aria-hidden="true"></span>
                </div>
                <p class="gh-popup__message">คุณเล่นจบโปรแกรมพัฒนาสมองทั้งหมด ${escapeHtml(String(programDayCount))} วันแล้ว</p>
            `,
        });

        mountFramePopup({ overlay, dismissible, resolve });
    });
}
