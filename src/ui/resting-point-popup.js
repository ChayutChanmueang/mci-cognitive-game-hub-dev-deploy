import { RollingCountdownTimer } from "../util/Odometer/odometer.js";
import "../util/Odometer/odometer.css";

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
            timerDisplay?.destroy();
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
                        <span class="resting-popup-timer__number" data-resting-timer aria-label="${timeLeft}">
                            <span class="resting-popup-timer__digit" data-resting-timer-value>${String(timeLeft).padStart(2, "0")}</span>
                        </span>
                        <span class="resting-popup-timer__unit">วินาที</span>
                    </div>
                </div>
                <div class="app-popup__actions checkin-popup-success-actions">
                    <md-filled-button type="button" data-resting-skip style="width: 100%;">ข้าม</md-filled-button>
                </div>
            </div>
        `;

        const timerEl = overlay.querySelector("[data-resting-timer]");
        const timerValueEl = overlay.querySelector("[data-resting-timer-value]");
        const timerGroupEl = overlay.querySelector(".resting-popup-timer");
        const catImg = overlay.querySelector(".resting-popup-cat");
        const layoutEl = overlay.querySelector(".resting-popup-layout");
        const timerDisplay = timerValueEl
            ? new RollingCountdownTimer({
                el: timerValueEl,
                value: timeLeft,
                digitCount: 2,
                durationMs: 520,
            })
            : null;

        const skipBtn = overlay.querySelector("[data-resting-skip]");

        const updateTimer = (value) => {
            const nextValue = Math.max(0, value);
            if (timerEl) {
                timerEl.setAttribute("aria-label", String(nextValue));
            }
            if (timerDisplay) {
                timerDisplay.update(nextValue);
            } else if (timerValueEl) {
                timerValueEl.textContent = String(nextValue).padStart(2, "0");
            }
        };

        const onTimeUp = () => {
            if (timeUp) return;
            timeUp = true;
            if (layoutEl && timerGroupEl) {
                const layoutRect = layoutEl.getBoundingClientRect();
                const timerRect = timerGroupEl.getBoundingClientRect();
                layoutEl.style.setProperty("--resting-timer-top", `${timerRect.top - layoutRect.top}px`);
            }
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
                updateTimer(timeLeft);
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
                updateTimer(timeLeft);
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
