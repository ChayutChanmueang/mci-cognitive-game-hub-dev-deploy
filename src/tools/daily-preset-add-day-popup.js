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
                    ${fields.map((field) => `
                        <md-filled-text-field
                            label="${escapeHtml(field.label)}"
                            value="${escapeHtml(field.value)}"
                            data-day-field="${escapeHtml(field.field)}"
                        ></md-filled-text-field>
                    `).join("")}
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
            textFields[0]?.focus();
        });
    });
}

export default showDailyPresetAddDayPopup;
