import "./daily-preset-add-day-popup.css";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function showDailyPresetAddDayPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(null);
    }

    const {
        dayNumber = 1,
        fields = [],
        gameOptions = [],
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `daily-preset-add-day-title-${Date.now()}`;
        const messageId = `daily-preset-add-day-message-${Date.now()}`;

        overlay.className = "app-popup daily-preset-add-day-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog daily-preset-add-day-popup__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
                aria-describedby="${messageId}"
            >
                <div class="app-popup__header">
                    <div class="app-popup__icon-wrap">
                        <span class="material-symbols-rounded app-popup__icon">edit_note</span>
                    </div>
                    <div class="app-popup__copy">
                        <h2 id="${titleId}">เพิ่มข้อมูลเกมวันที่ ${escapeHtml(dayNumber)}</h2>
                        <p id="${messageId}">กรอกข้อมูลตามหัวตารางที่มีอยู่</p>
                    </div>
                </div>

                <div class="daily-preset-add-day-popup__fields">
                    ${fields.map((field) => {
                        if (field.type === "stage") {
                            return `
                                <div class="daily-preset-add-day-popup__stage" data-stage-field="${escapeHtml(field.field)}">
                                    <strong>${escapeHtml(field.label)}</strong>
                                    <md-filled-select
                                        label="เกม"
                                        data-stage-game="${escapeHtml(field.field)}"
                                    >
                                        <md-select-option aria-label="blank"></md-select-option>
                                        ${gameOptions.map((game) => `
                                            <md-select-option value="${escapeHtml(game.gid)}">
                                                <div slot="headline">${escapeHtml(game.name)} (${escapeHtml(game.gid)})</div>
                                            </md-select-option>
                                        `).join("")}
                                    </md-filled-select>
                                    <md-filled-text-field
                                        label="Level"
                                        type="number"
                                        inputmode="numeric"
                                        value="${escapeHtml(field.value?.level || "")}"
                                        data-stage-level="${escapeHtml(field.field)}"
                                    ></md-filled-text-field>
                                </div>
                            `;
                        }

                        // Future non-stage fields can reuse this renderer. Pass
                        // inputType from daily-preset-editor.js for number/text fields.
                        return `
                            <md-filled-text-field
                                label="${escapeHtml(field.label)}"
                                ${field.inputType ? `type="${escapeHtml(field.inputType)}"` : ""}
                                ${field.inputType === "number" ? "inputmode=\"numeric\"" : ""}
                                value="${escapeHtml(field.value)}"
                                data-day-field="${escapeHtml(field.field)}"
                            ></md-filled-text-field>
                        `;
                    }).join("")}
                </div>

                <div class="app-popup__actions">
                    <md-outlined-button type="button" data-popup-action="cancel">
                        ปิด
                    </md-outlined-button>
                    <md-filled-button type="button" data-popup-action="confirm">
                        เพิ่ม
                    </md-filled-button>
                </div>
            </div>
        `;

        const confirmButton = overlay.querySelector('[data-popup-action="confirm"]');
        const cancelButton = overlay.querySelector('[data-popup-action="cancel"]');
        const backdrop = overlay.querySelector(".app-popup__backdrop");
        const textFields = [...overlay.querySelectorAll("[data-day-field]")];
        const stageFields = [...overlay.querySelectorAll("[data-stage-field]")];
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
            const values = {};
            textFields.forEach((field) => {
                values[field.dataset.dayField] = field.value || "";
            });
            stageFields.forEach((stageField) => {
                const field = stageField.dataset.stageField;
                const gameSelect = overlay.querySelector(`[data-stage-game="${CSS.escape(field)}"]`);
                const levelField = overlay.querySelector(`[data-stage-level="${CSS.escape(field)}"]`);
                values[field] = {
                    gid: gameSelect?.value || "",
                    level: levelField?.value || "",
                };
            });
            cleanup(values);
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
            (textFields[0] || overlay.querySelector("[data-stage-game]"))?.focus();
        });
    });
}

export default showDailyPresetAddDayPopup;
