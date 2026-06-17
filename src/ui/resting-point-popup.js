const CAT_SLEEPING_GIF = "/assets/resting-point/resting-cat/cat-sleep.gif";
const CAT_JUMPING_GIF = "/assets/resting-point/resting-cat/cat-jump.gif";

export function showRestingPointPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        durationSeconds = 60,
        dismissible = false,
        catSleepingGif = CAT_SLEEPING_GIF,
        catStandingGif = CAT_JUMPING_GIF,
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "app-popup";

        let settled = false;
        let intervalId = null;
        let timeLeft = Math.max(0, Math.round(durationSeconds));
        let timeUp = false;

        const cleanup = (result) => {
            if (settled) return;
            settled = true;
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
            overlay.remove();
            document.removeEventListener("keydown", onKeyDown);
            resolve(result);
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape" && dismissible) {
                cleanup(false);
            }
        };

        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog app-popup__dialog--success app-popup__dialog--resting"
                role="dialog"
                aria-modal="true"
                aria-label="เวลาพัก"
            >
                <div class="resting-popup-layout">
                    <div class="resting-popup-copy">
                        <strong>คุณทำได้ดีมาก</strong>
                        <p>พักสักครู่ก่อนกลับไปเล่นเกม</p>
                    </div>
                    <img
                        class="resting-popup-cat"
                        src="${catSleepingGif}"
                        alt="แมวกำลังพักผ่อน"
                        aria-live="polite"
                    >
                    <div class="resting-popup-timer" aria-live="polite" aria-atomic="true">
                        <span class="resting-popup-timer__number" data-resting-timer>${timeLeft}</span>
                        <span class="resting-popup-timer__unit">วินาที</span>
                    </div>
                </div>
                <div class="app-popup__actions checkin-popup-success-actions">
                    <md-filled-button type="button" data-resting-skip style="width: 100%;">ข้าม</md-filled-button>
                </div>
            </div>
        `;

        const timerEl = overlay.querySelector("[data-resting-timer]");
        const timerGroupEl = overlay.querySelector(".resting-popup-timer");
        const catImg = overlay.querySelector(".resting-popup-cat");
        const layoutEl = overlay.querySelector(".resting-popup-layout");

        const skipBtn = overlay.querySelector("[data-resting-skip]");

        const onTimeUp = () => {
            if (timeUp) return;
            timeUp = true;
            layoutEl?.classList.add("is-time-up");
            if (catImg) {
                catImg.src = catStandingGif;
                catImg.alt = "แมวลุกขึ้นพร้อมเล่นแล้ว";
            }
            timerGroupEl?.setAttribute("aria-hidden", "true");
            if (skipBtn) {
                skipBtn.textContent = "กลับสู่หน้าหลัก";
            }
        };

        if (timeLeft <= 0) {
            onTimeUp();
        } else {
            intervalId = setInterval(() => {
                timeLeft -= 1;
                if (timerEl) {
                    timerEl.textContent = String(Math.max(0, timeLeft));
                }
                if (timeLeft <= 0) {
                    clearInterval(intervalId);
                    intervalId = null;
                    onTimeUp();
                }
            }, 1000);
        }

        skipBtn?.addEventListener("click", () => {
            if (!timeUp) {
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                timeLeft = 0;
                if (timerEl) {
                    timerEl.textContent = "0";
                }
                onTimeUp();
                return;
            }
            cleanup(true);
        });

        if (dismissible) {
            overlay.querySelector(".app-popup__backdrop")?.addEventListener("click", () => cleanup(false));
        }

        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
    });
}
