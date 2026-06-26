function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// Gender-specific resting character for the same-day re-entry popup (US-E7-16 AC#2).
// DB gender is "male"/"female" (see signup-screen.js); anything else falls back to the man.
const CHARACTER_IMAGE_BASE = "/assets/common/character";
function getRestingCharacter(gender) {
    const isFemale = String(gender || "").trim().toLowerCase() === "female";
    return {
        src: `${CHARACTER_IMAGE_BASE}/${isFemale ? "female/OldWoman" : "man/OldMan"}_resting.png`,
        alt: isFemale ? "คุณยายกำลังพัก" : "คุณตากำลังพัก",
    };
}

function buildPopup({ title, message } = {}) {
    const overlay = document.createElement("div");
    overlay.className = "app-popup";
    overlay.innerHTML = `
        <div class="app-popup__backdrop"></div>
        <div
            class="app-popup__dialog app-popup__dialog--success"
            role="dialog"
            aria-modal="true"
        >
            <div class="completion-popup-layout">
                <h2 style="margin: 0; color: var(--md-sys-color-primary); font-size: 39px;">${title}</h2>
                <div class="completion-popup-emoji" aria-hidden="true">🧓</div>
                <p class="completion-popup-message">${message}</p>
            </div>
            <div class="app-popup__actions checkin-popup-success-actions">
                <md-filled-button type="button" data-completion-confirm style="width: 100%;">ตกลง</md-filled-button>
            </div>
        </div>
    `;
    return overlay;
}

// US-E7-16 AC#2: shown when the player has already completed today's goal and re-enters
// the game on the same day. Compact "วันนี้พักก่อน" rest popup with the gender-based
// resting character (คุณตา/คุณยาย) and a soft ground shadow (US-E7-14 #4).
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
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog app-popup__dialog--rest-day"
                role="dialog"
                aria-modal="true"
            >
                <h2 class="rest-day-popup-title">วันนี้พักก่อน</h2>
                <div class="rest-day-popup-character">
                    <img
                        class="rest-day-popup-character__img"
                        src="${character.src}"
                        alt="${escapeHtml(character.alt)}"
                        draggable="false"
                    />
                    <span class="rest-day-popup-character__shadow" aria-hidden="true"></span>
                </div>
                <p class="rest-day-popup-message">กลับมาเล่นใหม่วันพรุ่งนี้นะ</p>
                <div class="app-popup__actions checkin-popup-success-actions rest-day-popup-actions">
                    <md-filled-button type="button" data-completion-confirm style="width: 100%;">กลับหน้าหลัก</md-filled-button>
                </div>
            </div>
        `;

        let settled = false;
        const cleanup = (result) => {
            if (settled) return;
            settled = true;
            overlay.remove();
            document.removeEventListener("keydown", onKeyDown);
            resolve(result);
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape" && dismissible) cleanup(false);
        };

        overlay.querySelector("[data-completion-confirm]")?.addEventListener("click", () => cleanup(true));
        if (dismissible) {
            overlay.querySelector(".app-popup__backdrop")?.addEventListener("click", () => cleanup(false));
        }

        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
    });
}

export function showProgramCompletionPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        programDayCount = 14,
        dismissible = false,
    } = options;

    return new Promise((resolve) => {
        const overlay = buildPopup({
            title: "ยินดีด้วย",
            message: `คุณเล่นจบโปรแกรมพัฒนาสมองทั้งหมด ${escapeHtml(String(programDayCount))} วันแล้ว`,
        });

        let settled = false;
        const cleanup = (result) => {
            if (settled) return;
            settled = true;
            overlay.remove();
            document.removeEventListener("keydown", onKeyDown);
            resolve(result);
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape" && dismissible) cleanup(false);
        };

        overlay.querySelector("[data-completion-confirm]")?.addEventListener("click", () => cleanup(true));
        if (dismissible) {
            overlay.querySelector(".app-popup__backdrop")?.addEventListener("click", () => cleanup(false));
        }

        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
    });
}
