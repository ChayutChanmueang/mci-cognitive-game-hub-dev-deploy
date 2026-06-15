import {
    getDateKey,
    getLocalDayStart,
    getProgramDayDate,
} from "../util/program-date-util.js";
import { VideoPlayer } from "../util/video-player/index.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function clampDayCount(value, fallback = 14) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.max(1, Math.min(365, Math.floor(parsed)));
}

const TREE_STAGES = 14;
const TREE_LABELS = [
    "เพิ่งเริ่มปลูก",
    "ต้นคิดดีกำลังงอก",
    "ต้นคิดดีกำลังเติบโต",
    "ต้นคิดดีกำลังเติบโต",
    "กำลังแตกกิ่งใบ",
    "กำลังแตกกิ่งใบ",
    "ต้นไม้กำลังสูงขึ้น",
    "ต้นไม้กำลังสูงขึ้น",
    "กำลังเติบโตแข็งแรง",
    "กำลังเติบโตแข็งแรง",
    "ต้นไม้ใกล้สมบูรณ์",
    "ต้นไม้ใกล้สมบูรณ์",
    "เกือบถึงเป้าหมายแล้ว",
    "ต้นคิดดีเติบโตสมบูรณ์!",
];

function getTreeStage(completedDays, totalDays) {
    if (totalDays <= 0) return 1;
    const ratio = Math.min(1, completedDays / totalDays);
    return Math.max(1, Math.min(TREE_STAGES, Math.round(ratio * (TREE_STAGES - 1)) + 1));
}

function getTreeImagePath(stage) {
    return `/assets/checkin-popup/tree_0${stage}.png`;
}

function buildDayItems(dayCount, checkInDates, programStartedAt = new Date()) {
    const safeDayCount = clampDayCount(dayCount);
    const completedProgramDays = new Set((checkInDates || [])
        .map((date) => getDateKey(date))
        .filter(Boolean));
    const programStart = getLocalDayStart(programStartedAt || new Date());
    const today = getLocalDayStart(new Date());
    const items = [];

    for (let index = 0; index < safeDayCount; index += 1) {
        const programDay = index + 1;
        const programDate = getProgramDayDate(programStart, programDay);
        const programDateKey = getDateKey(programDate);

        items.push({
            id: programDay,
            done: programDate <= today && completedProgramDays.has(programDateKey),
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
        programStartedAt = new Date(),
        defaultDayCount = 14,
        loadVideoSrc = null,
        videoTitle = "ละครสั้นประจำวัน",
        dismissible = false,
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `popup-title-${Date.now()}`;
        const messageId = `popup-message-${Date.now()}`;

        const state = {
            step: "success",
            dayCount: clampDayCount(defaultDayCount),
            videoSrc: "",
            videoPlayerInstance: null,
        };

        overlay.className = "app-popup";
        
        let settled = false;

        const cleanup = (result) => {
            if (settled) {
                return;
            }

            settled = true;
            state.videoPlayerInstance?.destroy();
            state.videoPlayerInstance = null;
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
            } else if (state.step === "calendar") {
                const dayItems = buildDayItems(state.dayCount, checkInDates, programStartedAt);
                const completedDays = dayItems.filter((item) => item.done).length;
                const stage = getTreeStage(completedDays, state.dayCount);
                const label = TREE_LABELS[stage - 1] || TREE_LABELS[0];
                const percent = state.dayCount > 0
                    ? Math.round((completedDays / state.dayCount) * 100)
                    : 0;
                const fillPercent = Math.max(12, percent);
                const displayDone = String(completedDays).padStart(2, "0");

                overlay.innerHTML = `
                    <div class="app-popup__backdrop"></div>
                    <div
                        class="app-popup__dialog app-popup__dialog--tree-progress"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div class="tree-progress-header">
                            <h2 class="tree-progress-title">เป้าหมายของฉัน</h2>
                            <p class="tree-progress-subtitle">เล่นเกมติดต่อกัน ${escapeHtml(String(state.dayCount))} วัน</p>
                            <div class="tree-progress-divider"></div>
                        </div>
                        <div class="tree-progress-body">
                            <img
                                class="tree-progress-plant"
                                src="${getTreeImagePath(stage)}"
                                alt="ต้นไม้ระดับที่ ${escapeHtml(String(stage))}"
                            >
                            <p class="tree-progress-plant-label">${escapeHtml(label)}</p>
                            <div
                                class="tree-progress-bar"
                                role="progressbar"
                                aria-valuenow="${completedDays}"
                                aria-valuemin="0"
                                aria-valuemax="${state.dayCount}"
                                aria-label="ความคืบหน้า ${completedDays} จาก ${state.dayCount} วัน"
                            >
                                <div class="tree-progress-bar__fill" style="width: ${fillPercent}%;"></div>
                                <span class="tree-progress-bar__text">${displayDone}/${escapeHtml(String(state.dayCount))}</span>
                            </div>
                        </div>
                        <div class="app-popup__actions checkin-popup-success-actions">
                            <md-filled-button type="button" data-back-home style="width: 100%;">
                                ต่อไป
                            </md-filled-button>
                        </div>
                    </div>
                `;

                overlay.querySelector("[data-back-home]")?.addEventListener("click", async (event) => {
                    if (!loadVideoSrc) {
                        cleanup(true);
                        return;
                    }
                    const btn = event.currentTarget;
                    btn.disabled = true;
                    try {
                        state.videoSrc = await loadVideoSrc() || "";
                    } catch {
                        state.videoSrc = "";
                    }
                    if (!state.videoSrc) {
                        cleanup(true);
                        return;
                    }
                    state.step = "video";
                    render();
                });
            } else if (state.step === "video") {
                overlay.innerHTML = `
                    <div class="app-popup__backdrop"></div>
                    <div
                        class="app-popup__dialog app-popup__dialog--video"
                        role="dialog"
                        aria-modal="true"
                        aria-label="${escapeHtml(videoTitle)}"
                    >
                        <h2 class="video-popup-title">${escapeHtml(videoTitle)}</h2>
                        <div class="video-popup-player" data-video-container></div>
                        <div class="app-popup__actions checkin-popup-success-actions" data-video-actions style="display: none;">
                            <md-filled-button type="button" data-video-close style="width: 100%;">
                                กลับสู่หน้าหลัก
                            </md-filled-button>
                        </div>
                    </div>
                `;

                const videoContainer = overlay.querySelector("[data-video-container]");
                const videoActions = overlay.querySelector("[data-video-actions]");
                if (videoContainer) {
                    state.videoPlayerInstance?.destroy();
                    state.videoPlayerInstance = VideoPlayer.mount(videoContainer, {
                        src: state.videoSrc,
                        label: escapeHtml(videoTitle),
                    });
                    state.videoPlayerInstance.on("ended", () => {
                        if (videoActions) videoActions.style.display = "";
                    });
                }

                overlay.querySelector("[data-video-close]")?.addEventListener("click", () => {
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
        programStartedAt = new Date(),
        defaultDayCount = 14,
        onBackHome = () => {},
    } = options;

    showCheckInPopup({
        checkInDates,
        programStartedAt,
        defaultDayCount,
        dismissible: false
    }).then(() => {
        onBackHome();
    });
}
