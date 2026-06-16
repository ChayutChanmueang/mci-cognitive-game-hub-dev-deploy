function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
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

export function showDayCompletionPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        programDay = 1,
        programDayCount = 14,
        dismissible = false,
    } = options;

    return new Promise((resolve) => {
        const overlay = buildPopup({
            title: "เก่งมากวันนี้",
            message: `คุณฝึกสมองครบตามเป้าหมายแล้ว<br>เล่นต่อเนื่องวันที่ ${escapeHtml(String(programDay))} จาก ${escapeHtml(String(programDayCount))} วัน<br>พรุ่งนี้กลับมาเล่นอีกนะ`,
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
