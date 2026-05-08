import "./daily-preset-edit-stage-popup.css";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function showDailyPresetEditStagePopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(null);
    }

    const {
        dayNumber = 1,
        stageNumber = 1,
        value = null,
        gameOptions = [],
    } = options;

    const selectedGid = String(value?.gid || "");
    const selectedLevel = value?.level || "";

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `daily-preset-edit-stage-title-${Date.now()}`;
        const messageId = `daily-preset-edit-stage-message-${Date.now()}`;

        overlay.className = "app-popup daily-preset-edit-stage-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog daily-preset-edit-stage-popup__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
                aria-describedby="${messageId}"
            >
                <div class="app-popup__header">
                    <div class="app-popup__icon-wrap">
                        <span class="material-symbols-rounded app-popup__icon">sports_esports</span>
                    </div>
                    <div class="app-popup__copy">
                        <h2 id="${titleId}">แก้ไขข้อมูลเกมวันที่ ${escapeHtml(dayNumber)} ด่านที่ ${escapeHtml(stageNumber)}</h2>
                        <p id="${messageId}">เลือกเกมและกำหนด level สำหรับด่านนี้</p>
                    </div>
                </div>

                <div class="daily-preset-edit-stage-popup__fields">
                    <md-filled-select label="เกม" data-stage-game>
                        <md-select-option aria-label="blank"></md-select-option>
                        ${gameOptions.map((game) => `
                            <md-select-option
                                value="${escapeHtml(game.gid)}"
                                ${String(game.gid) === selectedGid ? "selected" : ""}
                            >
                                <div slot="headline">${escapeHtml(game.name)} (${escapeHtml(game.gid)})</div>
                            </md-select-option>
                        `).join("")}
                    </md-filled-select>
                    <md-filled-text-field
                        label="Level"
                        type="number"
                        inputmode="numeric"
                        value="${escapeHtml(selectedLevel)}"
                        data-stage-level
                    ></md-filled-text-field>
                </div>

                <div class="app-popup__actions">
                    <md-outlined-button type="button" data-popup-action="cancel">
                        ปิด
                    </md-outlined-button>
                    <md-filled-button type="button" data-popup-action="confirm">
                        บันทึก
                    </md-filled-button>
                </div>
            </div>
        `;

        const confirmButton = overlay.querySelector('[data-popup-action="confirm"]');
        const cancelButton = overlay.querySelector('[data-popup-action="cancel"]');
        const backdrop = overlay.querySelector(".app-popup__backdrop");
        const gameSelect = overlay.querySelector("[data-stage-game]");
        const levelField = overlay.querySelector("[data-stage-level]");
        const previousOverflow = document.body.style.overflow;

        let settled = false;

        const cleanup = (result) => {
            if (settled) {
                return;
            }

            settled = true;
            overlay.remove();
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
            resolve(result);
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                cleanup(null);
            }
        };

        confirmButton?.addEventListener("click", () => {
            cleanup({
                gid: gameSelect?.value || "",
                level: levelField?.value || "",
            });
        });

        cancelButton?.addEventListener("click", () => {
            cleanup(null);
        });

        backdrop?.addEventListener("click", () => {
            cleanup(null);
        });

        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
        requestAnimationFrame(() => {
            gameSelect?.focus();
        });
    });
}

export default showDailyPresetEditStagePopup;
