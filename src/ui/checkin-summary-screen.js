function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function toDateKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function clampDayCount(value, fallback = 14) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.max(1, Math.min(365, Math.floor(parsed)));
}

function buildDayItems(dayCount, checkInDates) {
    const safeDayCount = clampDayCount(dayCount);
    const todayKey = toDateKey(new Date());
    const hasTodayCheckIn = (checkInDates || [])
        .map((date) => toDateKey(date))
        .some((key) => key === todayKey);
    const completedProgramDays = hasTodayCheckIn ? 1 : 0;
    const items = [];

    for (let index = 0; index < safeDayCount; index += 1) {
        items.push({
            id: index + 1,
            done: index < completedProgramDays,
        });
    }

    return items;
}

export function showCheckInPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        checkInDates = [],
        defaultDayCount = 14,
        dismissible = false,
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `popup-title-${Date.now()}`;
        const messageId = `popup-message-${Date.now()}`;

        const state = {
            step: "success",
            dayCount: clampDayCount(defaultDayCount),
        };

        overlay.className = "app-popup";
        
        let settled = false;

        const cleanup = (result) => {
            if (settled) {
                return;
            }

            settled = true;
            overlay.remove();
            document.removeEventListener("keydown", onKeyDown);
            resolve(result);
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape" && dismissible) {
                cleanup(false);
            }
        };

        const render = () => {
            if (state.step === "success") {
                overlay.innerHTML = `
                    <div class="app-popup__backdrop"></div>
                    <div
                        class="app-popup__dialog app-popup__dialog--success"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="${titleId}"
                        aria-describedby="${messageId}"
                    >
                        <div class="checkin-popup-success-layout">
                            <div class="app-popup__copy checkin-popup-success-copy">
                                <h2 id="${titleId}" style="color: var(--md-sys-color-primary); font-size: 39px;">เก่งมาก !!!</h2>
                                <div class="checkin-success-emoji" aria-hidden="true" style="font-size: 83px;">😊</div>
                                <p id="${messageId}" style="margin-top: 8px; font-size: 22px;">วันนี้คุณได้ออกกำลังกายสมองเรียบร้อยแล้ว</p>
                            </div>
                        </div>
                        <div class="app-popup__actions checkin-popup-success-actions">
                            <md-filled-button type="button" data-checkin-next style="width: 100%;">
                                ต่อไป
                            </md-filled-button>
                        </div>
                    </div>
                `;

                overlay.querySelector("[data-checkin-next]")?.addEventListener("click", () => {
                    state.step = "calendar";
                    render();
                });
            } else {
                const dayItems = buildDayItems(state.dayCount, checkInDates);
                const dayCellsHtml = dayItems.map((item) => `
                    <div class="checkin-program-day">
                        <span class="checkin-program-day__number">${escapeHtml(String(item.id))}</span>
                        <div class="checkin-program-day__box">
                            <md-checkbox
                                class="checkin-program-day__checkbox"
                                aria-label="วันที่ ${escapeHtml(String(item.id))}"
                                ${item.done ? "checked" : ""}
                            ></md-checkbox>
                        </div>
                    </div>
                `).join("");

                overlay.innerHTML = `
                    <div class="app-popup__backdrop"></div>
                    <div
                        class="app-popup__dialog app-popup__dialog--checkin-calendar"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div class="app-popup__header checkin-popup-calendar-header">
                            <div class="app-popup__copy checkin-popup-calendar-copy">
                                <h2>เป้าหมายของฉัน</h2>
                                <p>เล่นเกมติดต่อกัน ${state.dayCount} วัน</p>
                                <div class="checkin-popup-calendar-divider"></div>
                                <div class="checkin-program-grid" role="list" aria-label="ความคืบหน้าการฝึกสมอง">
                                    ${dayCellsHtml}
                                </div>
                            </div>
                        </div>
                        <div class="app-popup__actions checkin-popup-success-actions">
                            <md-filled-button type="button" data-back-home style="width: 100%;">
                                กลับสู่หน้าหลัก
                            </md-filled-button>
                        </div>
                    </div>
                `;

                overlay.querySelector("[data-back-home]")?.addEventListener("click", () => {
                    cleanup(true);
                });
            }

            const backdrop = overlay.querySelector(".app-popup__backdrop");
            backdrop?.addEventListener("click", () => {
                if (dismissible) {
                    cleanup(false);
                }
            });
        };

        render();

        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
    });
}

// Keep the old function for backward compatibility or remove it if not needed anywhere else
export function renderCheckInSummaryScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        checkInDates = [],
        defaultDayCount = 14,
        onBackHome = () => {},
    } = options;

    showCheckInPopup({
        checkInDates,
        defaultDayCount,
        dismissible: false
    }).then(() => {
        onBackHome();
    });
}
