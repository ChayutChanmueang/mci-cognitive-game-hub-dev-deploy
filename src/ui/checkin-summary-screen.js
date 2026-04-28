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

export function renderCheckInSummaryScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        checkInDates = [],
        defaultDayCount = 14,
        onBackHome = () => {},
    } = options;

    const state = {
        step: "success",
        dayCount: clampDayCount(defaultDayCount),
    };

    const render = () => {
        if (state.step === "success") {
            root.innerHTML = `
                <section class="checkin-summary-screen checkin-summary-screen--success">
                    <article class="checkin-success-layout">
                        <h1 class="checkin-success-title">เก่งมาก !!!</h1>
                        <div class="checkin-success-emoji" aria-hidden="true">😊</div>
                        <p class="checkin-success-message">วันนี้คุณได้ออกกำลังกายสมองเรียบร้อยแล้ว</p>
                    </article>
                    <div class="checkin-floating-action">
                        <md-filled-button class="login-submit-button checkin-floating-button" type="button" data-checkin-next>ต่อไป</md-filled-button>
                    </div>
                </section>
            `;

            root.querySelector("[data-checkin-next]")?.addEventListener("click", () => {
                state.step = "calendar";
                render();
            });
            return;
        }

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

        root.innerHTML = `
            <section class="checkin-summary-screen">
                <article class="checkin-calendar-panel">
                    <header class="checkin-calendar-panel__header">
                        <h2>เป้าหมายของฉัน</h2>
                        <p>เล่นเกมติดต่อกัน ${state.dayCount} วัน</p>
                    </header>
                    <div class="checkin-calendar-panel__divider" aria-hidden="true"></div>
                    <div class="checkin-program-grid" role="list" aria-label="ความคืบหน้าการฝึกสมอง">
                        ${dayCellsHtml}
                    </div>
                </article>
                <div class="checkin-floating-action">
                    <md-filled-button class="login-submit-button checkin-floating-button" type="button" data-back-home>กลับสู่หน้าหลัก</md-filled-button>
                </div>
            </section>
        `;

        root.querySelector("[data-back-home]")?.addEventListener("click", () => {
            onBackHome();
        });
    };

    render();
}
