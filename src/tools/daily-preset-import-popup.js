import "./daily-preset-import-popup.css";

export function showDailyPresetImportPopup() {
    if (typeof document === "undefined") {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `daily-preset-import-title-${Date.now()}`;
        const messageId = `daily-preset-import-message-${Date.now()}`;

        overlay.className = "app-popup daily-preset-import-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog daily-preset-import-popup__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
                aria-describedby="${messageId}"
            >
                <div class="app-popup__header">
                    <div class="app-popup__icon-wrap">
                        <span class="material-symbols-rounded app-popup__icon">file_upload</span>
                    </div>
                    <div class="app-popup__copy">
                        <h2 id="${titleId}">นำเข้า CSV</h2>
                        <p id="${messageId}">เลือกประเภทข้อมูลที่ต้องการนำเข้า</p>
                    </div>
                </div>

                <div class="daily-preset-import-popup__choices" role="radiogroup" aria-label="ประเภทข้อมูลนำเข้า">
                    <!-- Future import formats: add a radio value here, then add
                    the matching parser branch in daily-preset-csv-import.js. -->
                    <label class="daily-preset-import-popup__choice">
                        <input type="radio" name="daily-preset-import-type" value="normal">
                        <span>
                            <strong>ข้อมูลเกมปกติ</strong>
                            <small>ไฟล์ CSV ที่ส่งออกจากระบบนี้ เช่น gid(level) และจำนวนรอบการเล่น</small>
                        </span>
                    </label>
                    <label class="daily-preset-import-popup__choice">
                        <input type="radio" name="daily-preset-import-type" value="custom-1">
                        <span>
                            <strong>ข้อมูลเกมกำหนดเอง 1</strong>
                            <small>ไฟล์ CSV ภาษาไทยที่ต้อง map กลุ่มเกมและระดับความยาก</small>
                        </span>
                    </label>
                </div>

                <div class="app-popup__actions">
                    <md-outlined-button type="button" data-popup-action="cancel">
                        ปิด
                    </md-outlined-button>
                    <md-filled-button type="button" data-popup-action="confirm" disabled>
                        เลือกไฟล์
                    </md-filled-button>
                </div>
            </div>
        `;

        const confirmButton = overlay.querySelector('[data-popup-action="confirm"]');
        const cancelButton = overlay.querySelector('[data-popup-action="cancel"]');
        const backdrop = overlay.querySelector(".app-popup__backdrop");
        const choiceInputs = [...overlay.querySelectorAll('input[name="daily-preset-import-type"]')];
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
            choiceInputs[0]?.focus();
        });
    });
}

export default showDailyPresetImportPopup;
