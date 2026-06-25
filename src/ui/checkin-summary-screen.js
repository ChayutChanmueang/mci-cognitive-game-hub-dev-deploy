import {
    getDateKey,
    getLocalDayStart,
    getProgramDayDate,
} from "../util/program-date-util.js";
import { VideoPlayer } from "../util/video-player/index.js";
import VideoManager from "../core/video-manager.js";
import { showCelebrationEffect } from "./components/effects/celebration-effect.js";
import { showSparkleEffect } from "./components/effects/sparkle-effect.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

// Slow, happy up/down bounce for the success character: two bounces, 0.5s up + 0.5s down each
// (2s total), ease-in-out both ways. Lives here because it animates this screen's own element.
function bounceCheckInCharacter(target) {
    if (!target || typeof target.animate !== "function") {
        return null;
    }
    if (typeof window !== "undefined"
        && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        return null;
    }
    const up = "translateY(-16px)";
    return target.animate(
        [
            { transform: "translateY(0)", offset: 0, easing: "ease-in-out" },
            { transform: up, offset: 0.2, easing: "ease-in-out" },   // up 0.5s
            { transform: "translateY(0)", offset: 0.4, easing: "ease-in-out" }, // down 0.5s
            { transform: up, offset: 0.6, easing: "ease-in-out" },   // up 0.5s
            { transform: "translateY(0)", offset: 0.8 }, // down 0.5s
        ],
        { duration: 2000, iterations: 1 },
    );
}

// Tree growth transition for the check-in progression page. Flow: show the PREVIOUS stage and
// hold it ~1s → bounce it up a touch then collapse it down to nothing → swap to the NEXT stage
// image → bounce the new tree up (overshoot, then settle). Scales from the bottom so the tree
// looks like it grows up out of its pot. Lives here (not in a shared effect component) because
// it animates this screen's own <img>, mirroring bounceCheckInCharacter().
//
// `onGrow` fires at the exact moment the new tree pops in — used to time the sparkle burst.
// Returns a `{ cancel }` handle that stops both phases and leaves the next-stage image in place.
function growTreeTransition(img, prevStage, nextStage, onGrow) {
    const finishToNext = () => {
        if (img) {
            img.src = getTreeImagePath(nextStage);
            img.style.transform = "";
            img.style.transformOrigin = "";
        }
    };

    if (!img || typeof img.animate !== "function"
        || (typeof window !== "undefined"
            && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)) {
        finishToNext();
        onGrow?.();
        return null;
    }

    img.style.transformOrigin = "bottom center";
    img.src = getTreeImagePath(prevStage);

    // Hold the previous tree on screen before starting the transition.
    const HOLD_PREV_MS = 1000;

    let cancelled = false;
    let collapse = null;
    let grow = null;
    let holdTimer = null;

    // Show the previous tree for a beat, then run the collapse → swap → grow sequence.
    holdTimer = setTimeout(() => {
        holdTimer = null;
        if (cancelled) {
            return;
        }

        // Phase 1: previous tree bounces up slightly, then collapses down to nothing.
        collapse = img.animate(
            [
                { transform: "scale(1)", offset: 0, easing: "ease-out" },
                { transform: "scale(1.12)", offset: 0.45, easing: "ease-in" },
                { transform: "scale(0)", offset: 1 },
            ],
            { duration: 520, fill: "forwards" },
        );

        collapse.onfinish = () => {
            if (cancelled) {
                return;
            }
            // Phase 2: swap to the next stage, fire the sparkle, then pop the new tree up.
            img.src = getTreeImagePath(nextStage);
            onGrow?.();
            grow = img.animate(
                [
                    { transform: "scale(0)", offset: 0, easing: "ease-out" },
                    { transform: "scale(1.15)", offset: 0.6, easing: "ease-in-out" },
                    { transform: "scale(0.95)", offset: 0.8, easing: "ease-in-out" },
                    { transform: "scale(1)", offset: 1 },
                ],
                { duration: 620, fill: "forwards" },
            );
            grow.onfinish = () => {
                if (!cancelled) {
                    img.style.transform = "";
                    img.style.transformOrigin = "";
                }
            };
        };
    }, HOLD_PREV_MS);

    return {
        cancel: () => {
            if (cancelled) {
                return;
            }
            cancelled = true;
            if (holdTimer !== null) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
            collapse?.cancel?.();
            grow?.cancel?.();
            finishToNext();
        },
    };
}

// Gender-specific celebration art for the "เก่งมาก !!!" success step. DB gender is
// "male"/"female" (see signup-screen.js); anything else falls back to the man set.
// One of the three cheer-complete variants is picked at random per popup.
const CHARACTER_IMAGE_BASE = "/assets/common/character";
const CHEER_COMPLETE_VARIANTS = 3;
function getRandomCheerImage(gender) {
    const isFemale = String(gender || "").trim().toLowerCase() === "female";
    const folder = isFemale ? "female" : "man";
    const prefix = isFemale ? "OldWoman" : "OldMan";
    const variant = String(Math.floor(Math.random() * CHEER_COMPLETE_VARIANTS) + 1).padStart(2, "0");
    return `${CHARACTER_IMAGE_BASE}/${folder}/${prefix}_cheer-complete-${variant}.png`;
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
        patientGender = "",
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
            // Picked once per popup so it stays stable across re-renders of the success step.
            cheerImageSrc: getRandomCheerImage(patientGender),
        };

        overlay.className = "app-popup";

        let settled = false;
        let celebration = null;
        let characterBounce = null;
        let sparkle = null;
        let treeGrow = null;

        const cleanup = (result) => {
            if (settled) {
                return;
            }

            settled = true;
            celebration?.cancel();
            celebration = null;
            characterBounce?.cancel();
            characterBounce = null;
            sparkle?.cancel();
            sparkle = null;
            treeGrow?.cancel();
            treeGrow = null;
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
                                <img class="checkin-success-emoji checkin-success-image" src="${escapeHtml(state.cheerImageSrc)}" alt="" aria-hidden="true" />
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
                        class="app-popup__dialog"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div class="tree-progress-header">
                            <h2 class="tree-progress-title">เป้าหมายของฉัน</h2>
                            <p class="tree-progress-subtitle">เล่นเกมติดต่อกัน ${escapeHtml(String(state.dayCount))} วัน</p>
                            <div class="tree-progress-divider"></div>
                        </div>
                        <div class="tree-progress-body">
                            <div class="tree-progress-frame">
                                <img
                                    class="tree-progress-plant"
                                    src="${getTreeImagePath(stage)}"
                                    alt="ต้นไม้ระดับที่ ${escapeHtml(String(stage))}"
                                >
                            </div>
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

                // Grow the tree on the progression page: show the previous stage, collapse it,
                // then pop the current stage up — firing the rainbow sparkle burst at the exact
                // moment the new tree appears. Day 1 already maps to a previous stage (tree_01),
                // so there is always a "previous tree" and no empty case to handle.
                // Wait one frame so the tree element has layout for anchoring.
                treeGrow?.cancel();
                sparkle?.cancel();
                requestAnimationFrame(() => {
                    if (settled || state.step !== "calendar") {
                        return;
                    }
                    const plant = overlay.querySelector(".tree-progress-plant");
                    const frame = overlay.querySelector(".tree-progress-frame");
                    const prevStage = getTreeStage(Math.max(0, completedDays - 1), state.dayCount);
                    treeGrow = growTreeTransition(plant, prevStage, stage, () => {
                        if (settled || state.step !== "calendar") {
                            return;
                        }
                        sparkle = showSparkleEffect({ anchor: frame });
                    });
                });

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
                    VideoManager.register(state.videoPlayerInstance);
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

        // Celebrate the "เก่งมาก !!!" success step: generic confetti burst (reusable component)
        // plus a screen-specific happy bounce on the gender-based character.
        celebration = showCelebrationEffect();
        characterBounce = bounceCheckInCharacter(overlay.querySelector(".checkin-success-image"));
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
