import "./daily-preset-add-field-popup.css";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function showDailyPresetAddFieldPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(null);
    }

    const {
        hasDailyGoal = false,
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `daily-preset-add-field-title-${Date.now()}`;
        const messageId = `daily-preset-add-field-message-${Date.now()}`;

        overlay.className = "app-popup daily-preset-add-field-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog daily-preset-add-field-popup__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
                aria-describedby="${messageId}"
            >
                <div class="app-popup__header">
                    <div class="app-popup__icon-wrap">
                        <span class="material-symbols-rounded app-popup__icon">add</span>
                    </div>
                    <div class="app-popup__copy">
                        <h2 id="${titleId}">เพิ่มข้อมูล</h2>
                        <p id="${messageId}">เลือกชนิดข้อมูลที่ต้องการเพิ่ม</p>
                    </div>
                </div>

                <div class="daily-preset-add-field-popup__choices" role="radiogroup" aria-label="ชนิดข้อมูล">
                    <label class="daily-preset-add-field-popup__choice">
                        <input type="radio" name="daily-preset-field-type" value="stage">
                        <span>
                            <strong>เพิ่มด่าน</strong>
                            <small>เพิ่มหัวตารางเป็น ด่านที่ 1, 2, 3 ต่อไปเรื่อยๆ</small>
                        </span>
                    </label>
                    <label class="daily-preset-add-field-popup__choice ${hasDailyGoal ? "daily-preset-add-field-popup__choice--disabled" : ""}">
                        <input
                            type="radio"
                            name="daily-preset-field-type"
                            value="dailyGoal"
                            ${hasDailyGoal ? "disabled" : ""}
                        >
                        <span>
                            <strong>เพิ่มเป้าหมายประจำวัน</strong>
                            <small>${escapeHtml(hasDailyGoal ? "เพิ่มเป้าหมายประจำวันแล้ว" : "เพิ่มช่องข้อความเป้าหมายประจำวัน")}</small>
                        </span>
                    </label>
                </div>

                <div class="app-popup__actions">
                    <md-outlined-button type="button" data-popup-action="cancel">
                        ปิด
                    </md-outlined-button>
                    <md-filled-button type="button" data-popup-action="confirm" disabled>
                        เพิ่ม
                    </md-filled-button>
                </div>
            </div>
        `;

        const confirmButton = overlay.querySelector('[data-popup-action="confirm"]');
        const cancelButton = overlay.querySelector('[data-popup-action="cancel"]');
        const backdrop = overlay.querySelector(".app-popup__backdrop");
        const choiceInputs = [...overlay.querySelectorAll('input[name="daily-preset-field-type"]')];
        const previousOverflow = document.body.style.overflow;

        let selectedType = null;
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

        choiceInputs.forEach((input) => {
            input.addEventListener("change", () => {
                selectedType = input.value;
                confirmButton.disabled = !selectedType;
            });
        });

        confirmButton?.addEventListener("click", () => {
            cleanup(selectedType);
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
            choiceInputs.find((input) => !input.disabled)?.focus();
        });
    });
}

export default showDailyPresetAddFieldPopup;
