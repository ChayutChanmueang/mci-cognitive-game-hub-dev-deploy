import { getPatientSessionCookie, getPatientSessionLabel } from "../util/patient-session.js";
import {
    getDateKey,
    getLocalDayStart,
    getProgramDateRange,
    getProgramDayDate,
    getProgramDayStatus,
} from "../util/program-date-util.js";
import { showCheckInPopup } from "./checkin-summary-screen.js";
import { showRestingPointPopup } from "./resting-point-popup.js";
import { showDayCompletionPopup, showProgramCompletionPopup } from "./day-completion-popup.js";
import db from "../core/database.js";
import SessionStorageManager from "../core/session-storage-manager.js";
import AudioManager from "../core/audio-manager.js";
import { bindCurrentNodeScrollController } from "../util/current-node-scroll-controller.js";

const REST_GAME_GID = "REST001";
const MINIGAME_DEFAULT_BG_COLOR = '#028af8';

const CATEGORY_META = Object.freeze({
    Attention: {
        nameTh: "สมาธิ",
        description: "ฝึกการจดจ่อ คัดแยกสิ่งรบกวน และตอบสนองต่อเป้าหมายให้แม่นยำ",
    },
    Memory: {
        nameTh: "ความจำ",
        description: "ฝึกการจดจำข้อมูล ลำดับ และรายละเอียดที่เพิ่งเห็นหรือได้ยิน",
    },
    Language: {
        nameTh: "ภาษา",
        description: "ฝึกการเข้าใจคำศัพท์ ความหมาย และการใช้ภาษาในบริบทต่าง ๆ",
    },
    Visuospatial: {
        nameTh: "มิติสัมพันธ์",
        description: "ฝึกการสังเกตรูปทรง พื้นที่ และความสัมพันธ์ของวัตถุ",
    },
    Executive: {
        nameTh: "บริหารสมอง",
        description: "ฝึกการวางแผน ตัดสินใจ จัดลำดับ และควบคุมการทำงานหลายขั้นตอน",
    },
});

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getPatientLabel(fallback = "") {
    const rememberedSession = getPatientSessionCookie();
    if (rememberedSession) {
        return getPatientSessionLabel(rememberedSession);
    }

    const draft = SessionStorageManager.get("patient_signup_draft");
    if (draft) {
        try {
            const parsed = typeof draft === "string" ? JSON.parse(draft) : draft;
            const name = `${parsed?.firstname || ""} ${parsed?.lastname || ""}`.trim();
            if (name) {
                return name;
            }
        } catch (error) {
            console.warn("Unable to parse patient signup draft:", error);
        }
    }

    return fallback || SessionStorageManager.get("patient_login_id", "") || "ผู้เล่น";
}

function getCategoryLabel(categoryId) {
    return CATEGORY_META[categoryId]?.nameTh || "ฝึกสมอง";
}

function getCategoryDescription(categoryId) {
    return CATEGORY_META[categoryId]?.description || "เกมฝึกสมองประจำวัน";
}

function normalizeGame(item, index = 0, fallbackCategory = "Attention") {
    const category = String(item?.mci_group || fallbackCategory || "Attention").trim();
    const name = String(item?.name || `เกมที่ ${index + 1}`).trim();
    const thName = String(item?.th_name || item?.thName || "").trim();

    return {
        id: item?.id ?? `${category}-${index}`,
        gid: String(item?.gid || "").trim(),
        name,
        th_name: thName,
        displayName: thName || name,
        mci_group: category,
        max_score: item?.max_score ?? null,
        created_at: item?.created_at ?? null,
    };
}

function normalizeProgramGame(item, index, dailyProgram, dayItem = null) {
    const game = normalizeGame(item, index, item?.mci_group || "Attention");
    if (!game.gid || game.gid === REST_GAME_GID) {
        return null;
    }

    return {
        ...game,
        presetDataId: item?.preset_data_id ?? item?.presetDataId ?? null,
        dailyPresetId: item?.daily_preset_id ?? item?.dailyPresetId ?? dayItem?.dailyPreset?.id ?? null,
        programId: item?.program_id ?? item?.programId ?? dailyProgram?.programId ?? null,
        stage: item?.stage == null || item?.stage === "" ? null : Number(item.stage),
        level: item?.level == null || item?.level === "" ? null : Number(item.level),
        day: Number(item?.day ?? dayItem?.day ?? dailyProgram?.programDay ?? 1),
        loop: Number(item?.loop || dayItem?.loop || dayItem?.dailyPreset?.loop || dailyProgram?.dailyPreset?.loop || 1),
        goal: String(item?.goal || dayItem?.goal || dayItem?.dailyPreset?.goal || dailyProgram?.dailyPreset?.goal || "").trim(),
    };
}

function normalizeHistoryRecord(item) {
    const gid = String(item?.gid || "").trim();
    const stage = item?.stage == null || item?.stage === "" ? null : Number(item.stage);
    return {
        gid,
        stage,
        checkIn: Boolean(item?.checkIn || item?.check_in || item?.["check-in"]) || !gid,
        playedAt: item?.start_at || item?.startAt || item?.played_at || item?.playedAt || null,
        endAt: item?.end_at || item?.endAt || null,
    };
}

function buildAllGames(gameListItems) {
    const uniqueGames = [];
    const seen = new Set();

    (gameListItems || []).forEach((item, index) => {
        const game = normalizeGame(item, index, item?.mci_group || "Attention");
        if (!game.gid || seen.has(game.gid)) {
            return;
        }
        seen.add(game.gid);
        uniqueGames.push(game);
    });

    return uniqueGames;
}

function buildProgramDays(dailyProgram) {
    const rawDays = Array.isArray(dailyProgram?.days) ? dailyProgram.days : [];

    if (!rawDays.length) {
        const games = Array.isArray(dailyProgram?.games) ? dailyProgram.games : [];
        return [{
            day: Number(dailyProgram?.programDay || 1),
            goal: String(dailyProgram?.dailyPreset?.goal || "").trim(),
            loop: Number(dailyProgram?.dailyPreset?.loop || 1),
            games: games
                .map((item, index) => normalizeProgramGame(item, index, dailyProgram))
                .filter(Boolean),
        }];
    }

    return rawDays
        .map((dayItem) => {
            const games = Array.isArray(dayItem?.games) ? dayItem.games : [];
            return {
                day: Number(dayItem?.day),
                goal: String(dayItem?.goal || dayItem?.dailyPreset?.goal || "").trim(),
                loop: Number(dayItem?.loop || dayItem?.dailyPreset?.loop || 1),
                games: games
                    .map((item, index) => normalizeProgramGame(item, index, dailyProgram, dayItem))
                    .filter(Boolean),
            };
        })
        .filter((dayItem) => Number.isFinite(dayItem.day))
        .sort((first, second) => Number(first.day) - Number(second.day));
}

function buildDayNodes(dayItem, restGame) {
    const gameNodes = (dayItem?.games || []).map((game, index) => ({
        id: `game-${dayItem.day}-${game.presetDataId || game.gid}-${game.stage ?? index}`,
        type: "game",
        gid: game.gid,
        stage: game.stage ?? null,
        day: Number(dayItem.day),
        title: game.displayName || game.th_name || game.name || `เกมที่ ${index + 1}`,
        gameNumber: index + 1,
        gameData: game,
    }));

    if (!gameNodes.length) {
        return [];
    }

    const splitIndex = Math.ceil(gameNodes.length / 2);
    const restNode = {
        id: `rest-${dayItem.day}`,
        type: "rest",
        gid: REST_GAME_GID,
        stage: null,
        day: Number(dayItem.day),
        title: restGame?.displayName || restGame?.th_name || restGame?.name || "พักยืดเส้นยืดสาย",
        gameData: restGame || { gid: REST_GAME_GID, name: "REST001", displayName: "พักยืดเส้นยืดสาย" },
        emoji: "🏋️",
    };
    const checkInNode = {
        id: `checkin-${dayItem.day}`,
        type: "checkin",
        gid: "",
        stage: null,
        day: Number(dayItem.day),
        title: "เช็คชื่อ",
        emoji: "🏁",
    };

    return [
        ...gameNodes.slice(0, splitIndex),
        restNode,
        ...gameNodes.slice(splitIndex),
        checkInNode,
    ];
}

function buildDaySections(programDays, restGame) {
    return (programDays || [])
        .map((dayItem) => ({
            ...dayItem,
            nodes: buildDayNodes(dayItem, restGame),
        }))
        .filter((dayItem) => dayItem.nodes.length > 0)
        .sort((first, second) => Number(first.day) - Number(second.day));
}

function getHistoryForProgramDay(historyRecords, startedProgram, programDay) {
    const key = getDateKey(getProgramDayDate(startedProgram, programDay));
    return (historyRecords || []).filter((record) => getDateKey(record.playedAt) === key);
}

function nodeMatchesHistory(node, record) {
    if (node?.type === "game") {
        const nodeStage = node.stage == null || node.stage === "" ? null : Number(node.stage);
        const recordStage = record.stage == null || record.stage === "" ? null : Number(record.stage);
        return Boolean(record.gid)
            && record.gid === node.gid
            && (nodeStage == null ? recordStage == null : recordStage === nodeStage)
            && Boolean(record.endAt);
    }

    if (node?.type === "rest") {
        return record.gid === REST_GAME_GID;
    }

    if (node?.type === "checkin") {
        return record.checkIn === true;
    }

    return false;
}

function getSequentialCompletedCount(nodes, historyRecords) {
    const sortedHistory = (historyRecords || [])
        .map((record) => normalizeHistoryRecord(record))
        .sort((first, second) => new Date(first.playedAt || 0) - new Date(second.playedAt || 0));

    let cursor = 0;
    let completedCount = 0;

    for (const node of nodes || []) {
        let matchedIndex = -1;
        if (node?.type === "checkin") {
            const hasCheckIn = sortedHistory.some((record) => nodeMatchesHistory(node, record));
            if (!hasCheckIn) {
                break;
            }
            completedCount += 1;
            continue;
        }

        for (let index = cursor; index < sortedHistory.length; index += 1) {
            if (nodeMatchesHistory(node, sortedHistory[index])) {
                matchedIndex = index;
                break;
            }
        }

        if (matchedIndex < 0) {
            break;
        }

        cursor = matchedIndex + 1;
        completedCount += 1;
    }

    return completedCount;
}

function getDayCompletion(daySection, historyRecords) {
    const nodes = daySection?.nodes || [];
    const completedCount = getSequentialCompletedCount(nodes, historyRecords);
    const nodeTarget = nodes.length;
    const gameTarget = nodes.filter((node) => node.type === "game").length;
    const completedGameCount = nodes
        .slice(0, completedCount)
        .filter((node) => node.type === "game").length;

    return {
        completedCount,
        nodeTarget,
        completedGameCount: Math.min(gameTarget, completedGameCount),
        gameTarget,
        isComplete: nodeTarget > 0 && completedCount >= nodeTarget,
    };
}

function getPlayableNodes(nodes) {
    return (nodes || []).filter((node) => node.type === "game" || node.type === "rest");
}

function getCheckInStartAtForDate(dateValue) {
    const targetDate = getLocalDayStart(dateValue);
    const today = getLocalDayStart(new Date());

    return targetDate.getTime() === today.getTime()
        ? new Date().toISOString()
        : targetDate.toISOString();
}

function createGameHubInitialState() {
    return {
        allGames: [],
        restGame: null,
        programPresets: [],
        dailyProgram: null,
        programDays: [],
        historyRecords: [],
        checkInDateKeys: [],
        loading: false,
        historyLoading: false,
        autoCheckInLoading: false,
        restPopupActive: false,
        completionPopupShown: false,
        scrollTop: 0,
        error: "",
    };
}

function logGameHubDebug(label, payload) {
    if (typeof window === "undefined") {
        return;
    }

    window.__GAME_HUB_DEBUG__ = {
        ...(window.__GAME_HUB_DEBUG__ || {}),
        [label]: payload,
    };

    console.debug(`[game-hub] ${label}`, payload);
}

export function createGameHubState() {
    return createGameHubInitialState();
}

export async function renderGameHubScreen(root, options = {}) {
    if (!root) {
        return;
    }

    document.documentElement.style.setProperty("--game-mode-background", MINIGAME_DEFAULT_BG_COLOR);

    const state = options.sharedState || createGameHubInitialState();
    Object.assign(state, createGameHubInitialState(), {
        scrollTop: Number(state.scrollTop) || 0,
    });

    const patientHn = String(options.patientHn || options.patientCode || "").trim();
    const patientLabel = options.patientLabel || getPatientLabel(patientHn);

    let activeCleanup = [];

    const cleanup = () => {
        activeCleanup.forEach((handler) => handler());
        activeCleanup = [];
    };

    const on = (target, eventName, handler, listenerOptions) => {
        if (!target) {
            return;
        }
        target.addEventListener(eventName, handler, listenerOptions);
        activeCleanup.push(() => target.removeEventListener(eventName, handler, listenerOptions));
    };

    // Removed rogue popstate trap here to fix minigame exit dialog conflicts

    const getCurrentProgramDay = () => Number(state.dailyProgram?.programDay || state.programDays[0]?.day || 1);
    const getProgramDayCount = () => Number(state.dailyProgram?.programDayCount || state.programDays[state.programDays.length - 1]?.day || 1);
    const getStartedProgram = () => state.dailyProgram?.startedProgram || options.programDate || new Date().toISOString();
    const hasCheckInForProgramDay = (programDay) => {
        const key = getDateKey(getProgramDayDate(getStartedProgram(), programDay));
        return (state.checkInDateKeys || []).includes(key);
    };
    const getDisplayHistoryForProgramDay = (programDay) => {
        const history = getHistoryForProgramDay(state.historyRecords, getStartedProgram(), programDay);
        if (!hasCheckInForProgramDay(programDay)) {
            return history;
        }

        const hasLoadedCheckIn = history.some((record) => normalizeHistoryRecord(record).checkIn);
        if (hasLoadedCheckIn) {
            return history;
        }

        return [
            ...history,
            {
                gid: "",
                checkIn: true,
                playedAt: getProgramDayDate(getStartedProgram(), programDay).toISOString(),
            },
        ];
    };
    const getCurrentDaySection = (sections) => {
        const currentDay = getCurrentProgramDay();
        return sections.find((section) => Number(section.day) === currentDay) || sections[0] || { day: currentDay, nodes: [] };
    };
    const getActiveDay = () => getCurrentProgramDay();

    const render = () => {
        cleanup();
        const sections = buildDaySections(state.programDays, state.restGame);
        const currentDay = getCurrentProgramDay();
        const currentSection = getCurrentDaySection(sections);
        const currentHistory = getDisplayHistoryForProgramDay(currentDay);
        const currentCompletion = getDayCompletion(currentSection, currentHistory);
        const activeDay = getActiveDay();
        const { programEnded: isProgramEnded } = getProgramDayStatus(getStartedProgram(), getProgramDayCount());
        const progress = currentCompletion.nodeTarget > 0
            ? Math.min(1, currentCompletion.completedCount / currentCompletion.nodeTarget)
            : 0;
        const progressClass = progress >= 0.5 ? "is-half-passed" : "";
        const currentGoal = String(currentSection.goal || state.dailyProgram?.dailyPreset?.goal || "").trim()
            || (currentCompletion.nodeTarget > 0
                ? `ทำภารกิจ ${currentCompletion.nodeTarget} ขั้นตอน ให้ครบตามแผนประจำวัน`
                : "ยังไม่พบรายการเกมประจำวัน");
        root.innerHTML = `
            <section class="hub-clean-screen">
                <div class="hub-clean-shell">
                    <header class="hub-clean-topbar">
                        <div class="hub-clean-goal">
                            <p class="hub-clean-eyebrow">${escapeHtml(patientLabel)}</p>
                            <h1>เป้าหมายของวันที่ ${escapeHtml(currentDay)}</h1>
                            <p>${escapeHtml(currentGoal)}</p>
                            <div class="hub-clean-progress ${progressClass}" style="--hub-progress: ${progress};">
                                <md-linear-progress value="${progress}" aria-label="ทำแล้ว ${currentCompletion.completedCount} จาก ${currentCompletion.nodeTarget} ขั้นตอน"></md-linear-progress>
                                <span>${currentCompletion.completedCount}/${currentCompletion.nodeTarget}</span>
                            </div>
                        </div>
                        <div class="hub-clean-profile" role="button" tabindex="0" aria-label="เปิดโปรไฟล์ผู้เล่น">
                            <md-filled-tonal-icon-button aria-label="เปิดโปรไฟล์ผู้เล่น">
                                <md-icon class="material-symbols-rounded">person</md-icon>
                            </md-filled-tonal-icon-button>
                            <strong>โปรไฟล์</strong>
                        </div>
                    </header>
                    <section class="hub-clean-stage">
                        <div class="hub-clean-scroll" data-hub-scroll>
                            <div class="hub-clean-content">
                                ${state.error ? `<div class="hub-clean-empty"><p>${escapeHtml(state.error)}</p></div>` : ""}
                                ${sections.map((section) => renderDaySection(section, activeDay, isProgramEnded)).join("")}
                                ${state.loading || state.historyLoading ? `
                                    <div class="hub-clean-empty">
                                        <md-circular-progress indeterminate aria-label="กำลังโหลดรายการเกม"></md-circular-progress>
                                        <p>กำลังโหลดรายการเกม</p>
                                    </div>
                                ` : ""}
                            </div>
                        </div>
                        <md-fab class="hub-clean-fab" aria-label="เลื่อนไปยังจุดปัจจุบัน" data-scroll-top>
                            <md-icon class="material-symbols-rounded" slot="icon">arrow_upward</md-icon>
                        </md-fab>
                        <md-fab class="hub-clean-leaderboard-fab" aria-label="เปิดหน้าคะแนนผู้เล่น" data-leaderboard-action>
                            <md-icon class="material-symbols-rounded" slot="icon">trophy</md-icon>
                        </md-fab>
                    </section>
                </div>
            </section>
        `;

        bind(sections, activeDay);
    };

    const renderDaySection = (section, activeDay, isProgramEnded) => {
        const day = Number(section.day);
        const dayHistory = getDisplayHistoryForProgramDay(day);
        const completion = getDayCompletion(section, dayHistory);
        const currentNodeIndex = day === Number(activeDay) && completion.completedCount < section.nodes.length
            ? completion.completedCount
            : -1;

        return `
            <section class="hub-clean-day-section" data-program-day="${escapeHtml(day)}">
                <div class="hub-clean-day-divider">
                    <span></span>
                    <strong>วันที่ ${escapeHtml(day)}</strong>
                    <span></span>
                </div>
                <div class="hub-clean-levels">
                    ${section.nodes.map((node, index) => renderNode(node, index, index < completion.completedCount, index === currentNodeIndex, isProgramEnded)).join("")}
                </div>
            </section>
        `;
    };

    const renderNode = (node, index, isDone, isCurrent, isProgramEnded) => {
        const classes = ["hub-clean-level", isDone ? "is-done" : "", (isCurrent && !isProgramEnded) ? "is-current" : ""]
            .filter(Boolean)
            .join(" ");
        const nodeText = isDone
            ? "✓"
            : node.type === "game"
                ? String(node.gameNumber || index + 1)
                : node.emoji || "•";
        const sideLabel = node.type === "checkin" && isDone
            ? "เช็คชื่อแล้ว"
            : node.type === "checkin"
                ? "รอเช็คชื่อ"
                : node.title || `เกมที่ ${index + 1}`;
        const side = isCurrent && !isProgramEnded
            ? renderCurrentCard(node, isProgramEnded)
            : `<div class="hub-clean-game-pill">${escapeHtml(sideLabel)}</div>`;

        return `
            <div class="${classes}">
                <div class="hub-clean-level__node" aria-hidden="true">
                    <span>${escapeHtml(nodeText)}</span>
                </div>
                <div class="hub-clean-level__side">${side}</div>
            </div>
        `;
    };

    const renderCurrentCard = (node, isProgramEnded = false) => {
        if (node.type === "checkin") {
            return `
                <article class="hub-clean-current-card">
                    <p>เล่นเกมครบทั้งหมดแล้ว</p>
                    <h2>เช็คชื่อแล้ว</h2>
                    <span>ยินดีด้วยคุณเล่นเกมครบแล้ว รอเล่นเกมวันถัดไปนะ</span>
                </article>
            `;
        }

        if (node.type === "rest") {
            return `
                <article class="hub-clean-current-card">
                    <p>พักยืดเส้น</p>
                    <h2>${escapeHtml(node.title || "พักยืดเส้นยืดสาย")}</h2>
                    <span>พักสายตา ยืดเส้น และผ่อนคลายก่อนเล่นต่อ</span>
                </article>
            `;
        }

        const game = node.gameData || {};
        const categoryId = game.mci_group || "Attention";
        return `
            <article class="hub-clean-current-card">
                <p>${escapeHtml(getCategoryLabel(categoryId))}</p>
                <h2>${escapeHtml(node.title || game.displayName || game.name || "เกมฝึกสมอง")}</h2>
                <span>${escapeHtml(getCategoryDescription(categoryId))}</span>
                <md-filled-button data-node-action data-day="${escapeHtml(node.day)}" data-node-id="${escapeHtml(node.id)}" type="button"${isProgramEnded ? " disabled" : ""}>เริ่มเกม</md-filled-button>
            </article>
        `;
    };

    const bind = (sections, activeDay) => {
        bindCurrentNodeScrollController({
            root,
            state,
            activeKey: activeDay,
            on,
        });

        on(root.querySelector(".hub-clean-profile"), "click", () => {
            AudioManager.play('ui:click');
            options.onProfile?.();
        });
        on(root.querySelector(".hub-clean-profile"), "keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            event.preventDefault();
            AudioManager.play('ui:click');
            options.onProfile?.();
        });
        on(root.querySelector("[data-leaderboard-action]"), "click", () => {
            AudioManager.play('ui:click');
            options.onLeaderboard?.();
        });

        const nodeMap = new Map(sections.flatMap((section) => section.nodes.map((node) => [node.id, node])));
        root.querySelectorAll("[data-node-action]").forEach((button) => {
            on(button, "click", async () => {
                AudioManager.play('ui:click');
                const node = nodeMap.get(button.getAttribute("data-node-id"));
                await handleNodeAction(node);
            });
        });

    };

    const handleNodeAction = async (node) => {
        if (!node) {
            return;
        }

        try {
            if (node.type === "game") {
                await options.onLaunchGame?.(node.gameData);
            }
        } catch (error) {
            console.error("Unable to handle game hub node action:", error);
        }
    };

    const loadProgramWindow = async (params = {}) => {
        if (typeof options.loadDailyProgram !== "function" || !patientHn) {
            return null;
        }

        const request = {
            hn: patientHn,
            ...params,
        };
        const result = await options.loadDailyProgram(request);
        logGameHubDebug("dailyProgram", {
            request,
            programDay: result?.programDay,
            programDayCount: result?.programDayCount,
            visibleDayFrom: result?.visibleDayFrom,
            visibleDayTo: result?.visibleDayTo,
            days: (result?.days || []).map((dayItem) => ({
                day: dayItem?.day,
                games: Array.isArray(dayItem?.games) ? dayItem.games.length : 0,
            })),
        });
        return result;
    };

    const loadProgram = async () => {
        state.loading = true;
        state.error = "";
        render();

        try {
            const [
                gameListItems,
                programPresets,
            ] = await Promise.all([
                typeof options.loadGameList === "function" ? options.loadGameList() : [],
                typeof options.loadProgramPresets === "function" ? options.loadProgramPresets() : [],
            ]);
            state.allGames = buildAllGames(gameListItems);
            state.restGame = state.allGames.find((game) => game.gid === REST_GAME_GID) || null;
            state.programPresets = Array.isArray(programPresets) ? programPresets : [];

            const dailyProgram = await loadProgramWindow({
                windowBefore: 2,
                windowAfter: 0,
            });

            state.dailyProgram = dailyProgram || null;
            state.programDays = buildProgramDays(dailyProgram);
            logGameHubDebug("programDays", state.programDays.map((dayItem) => ({
                day: dayItem.day,
                games: dayItem.games.length,
            })));
            state.loading = false;
            render();
        } catch (error) {
            console.warn("Unable to load game hub program:", error);
            state.error = "ไม่สามารถโหลดรายการเกมประจำวันได้";
            state.loading = false;
            render();
        }
    };

    const loadHistory = async () => {
        if (!patientHn) {
            state.historyRecords = [];
            state.checkInDateKeys = [];
            render();
            return;
        }

        state.historyLoading = true;
        render();

        try {
            const startDate = getStartedProgram();
            const endDate = state.dailyProgram?.programEndDate || startDate;
            const { playedFrom } = getProgramDateRange(startDate);
            const { playedTo } = getProgramDateRange(endDate);
            const gids = state.allGames.map((game) => game.gid).filter(Boolean);

            if (typeof options.loadCompletedGameHistoryRecords === "function" || typeof options.loadInstantNodeHistoryRecords === "function") {
                const [completedRows, instantRows] = await Promise.all([
                    typeof options.loadCompletedGameHistoryRecords === "function"
                        ? options.loadCompletedGameHistoryRecords({ hn: patientHn, gids, playedFrom, playedTo })
                        : [],
                    typeof options.loadInstantNodeHistoryRecords === "function"
                        ? options.loadInstantNodeHistoryRecords({ hn: patientHn, playedFrom, playedTo })
                        : [],
                ]);

                state.historyRecords = [
                    ...(Array.isArray(completedRows) ? completedRows : []),
                    ...(Array.isArray(instantRows) ? instantRows : []),
                ].map((record) => normalizeHistoryRecord(record));
            } else if (typeof options.loadHistoryRecords === "function") {
                const rows = await options.loadHistoryRecords({ hn: patientHn, playedFrom, playedTo });
                state.historyRecords = Array.isArray(rows) ? rows.map((record) => normalizeHistoryRecord(record)) : [];
            } else {
                state.historyRecords = [];
            }

            await syncVisibleCheckIns();
            await refreshCheckInDateKeys();
            state.historyLoading = false;
            render();
            await ensureNextDayVisible();
            await checkAndAutoShowRestingPopup();
            await checkAndShowCompletionPopup();
        } catch (error) {
            console.warn("Unable to load game hub history:", error);
            state.historyRecords = [];
            state.checkInDateKeys = [];
            state.historyLoading = false;
            render();
        }
    };

    const refreshCheckInDateKeys = async () => {
        if (!patientHn) {
            state.checkInDateKeys = [];
            return;
        }

        const { playedFrom } = getProgramDateRange(getStartedProgram());
        const { playedTo } = getProgramDateRange(new Date());
        state.checkInDateKeys = await db.getUserCheckInDatesByHn({
            hn: patientHn,
            playedFrom,
            playedTo,
        });
    };

    const syncCheckInForDaySection = async (section) => {
        const programDay = Number(section?.day);
        const playableNodes = getPlayableNodes(section?.nodes || []);
        const checkInDate = getProgramDayDate(getStartedProgram(), programDay);
        const dayKey = getDateKey(checkInDate);

        if (!patientHn || !Number.isFinite(programDay) || !playableNodes.length) {
            return { dayKey, created: false, record: null };
        }

        const existingCheckIn = await db.getUserCheckInHistoryForDate({
            hn: patientHn,
            date: checkInDate,
        });

        if (existingCheckIn?.id) {
            return {
                dayKey,
                created: false,
                record: existingCheckIn,
            };
        }

        const completionStatus = await db.hasCompletedGameHubNodesForDate({
            hn: patientHn,
            nodes: playableNodes,
            date: checkInDate,
        });

        if (!completionStatus.complete) {
            return { dayKey, created: false, record: null };
        }

        const result = await db.addUserCheckInHistoryIfMissing({
            hn: patientHn,
            date: checkInDate,
            startAt: getCheckInStartAtForDate(checkInDate),
        });

        return {
            dayKey,
            created: Boolean(result.created),
            record: result.record || null,
        };
    };

    const syncVisibleCheckIns = async () => {
        if (!patientHn || state.autoCheckInLoading) {
            return;
        }

        const sections = buildDaySections(state.programDays, state.restGame);
        const currentDay = getCurrentProgramDay();
        const sectionsToSync = sections.filter((section) => Number(section?.day) <= currentDay);
        if (!sectionsToSync.length) {
            return;
        }

        state.autoCheckInLoading = true;

        try {
            const syncedRecords = [];
            let currentDayCheckInCreated = false;
            const existingStateKeys = new Set(
                state.historyRecords.map((record) => `${record.gid || ""}:${record.stage ?? ""}:${record.playedAt || ""}`),
            );

            for (const section of sectionsToSync) {
                const result = await syncCheckInForDaySection(section);
                if (result.record) {
                    const normalizedRecord = normalizeHistoryRecord(result.record);
                    const stateKey = `${normalizedRecord.gid || ""}:${normalizedRecord.stage ?? ""}:${normalizedRecord.playedAt || ""}`;
                    if (!existingStateKeys.has(stateKey)) {
                        existingStateKeys.add(stateKey);
                        syncedRecords.push(normalizedRecord);
                    }
                }
                if (result.created) {
                    if (Number(section.day) === currentDay) {
                        currentDayCheckInCreated = true;
                    }
                }
            }

            if (syncedRecords.length) {
                state.historyRecords = [
                    ...state.historyRecords,
                    ...syncedRecords,
                ];
                render();
            }

            if (currentDayCheckInCreated) {
                const { playedFrom } = getProgramDateRange(getStartedProgram());
                const { playedTo } = getProgramDateRange(new Date());
                const checkInDates = await db.getUserCheckInDatesByHn({
                    hn: patientHn,
                    playedFrom,
                    playedTo,
                });
                await showCheckInPopup({
                    checkInDates,
                    programStartedAt: getStartedProgram(),
                    defaultDayCount: options.defaultDayCount || 14,
                    loadVideoSrc: () => db.getRandomGameVideoUrl(),
                });
            }
        } catch (error) {
            console.error("Unable to sync game hub check-in records:", error);
        } finally {
            state.autoCheckInLoading = false;
        }
    };

    const checkAndAutoShowRestingPopup = async () => {
        if (!patientHn || state.restPopupActive) {
            return;
        }

        const sections = buildDaySections(state.programDays, state.restGame);
        const currentDay = getCurrentProgramDay();
        const currentSection = getCurrentDaySection(sections);
        const currentHistory = getDisplayHistoryForProgramDay(currentDay);
        const { completedCount } = getDayCompletion(currentSection, currentHistory);
        const currentNode = currentSection.nodes[completedCount];

        if (currentNode?.type !== "rest") {
            return;
        }

        state.restPopupActive = true;
        try {
            const startAt = new Date().toISOString();
            await showRestingPointPopup({ durationSeconds: 60 });
            await db.addUserGameHistory({
                hn: patientHn,
                gid: "REST001",
                startAt,
                endAt: new Date().toISOString(),
                rest: true,
                checkIn: false,
            });
            await loadHistory();
        } catch (error) {
            console.error("Unable to auto-show resting point popup:", error);
        } finally {
            state.restPopupActive = false;
        }
    };

    const checkAndShowCompletionPopup = async () => {
        if (state.completionPopupShown) return;

        const { programEnded: isProgramEnded } = getProgramDayStatus(getStartedProgram(), getProgramDayCount());

        if (isProgramEnded) {
            state.completionPopupShown = true;
            await showProgramCompletionPopup({ programDayCount: getProgramDayCount() });
            return;
        }

        const sections = buildDaySections(state.programDays, state.restGame);
        const currentDay = getCurrentProgramDay();
        const currentSection = getCurrentDaySection(sections);
        const currentHistory = getDisplayHistoryForProgramDay(currentDay);
        const { isComplete } = getDayCompletion(currentSection, currentHistory);

        if (isComplete) {
            state.completionPopupShown = true;
            await showDayCompletionPopup({ programDay: currentDay, programDayCount: getProgramDayCount() });
        }
    };

    const ensureNextDayVisible = async () => {
        const currentDay = getCurrentProgramDay();
        const programDayCount = getProgramDayCount();
        if (currentDay >= programDayCount) {
            return;
        }

        const sections = buildDaySections(state.programDays, state.restGame);
        const currentSection = getCurrentDaySection(sections);
        const playableNodes = getPlayableNodes(currentSection.nodes);
        if (!playableNodes.length) {
            return;
        }

        const currentDate = getProgramDayDate(getStartedProgram(), currentDay);
        const checkInRecord = await db.getUserCheckInHistoryForDate({
            hn: patientHn,
            date: currentDate,
        });
        if (!checkInRecord?.id) {
            return;
        }

        const completionStatus = await db.hasCompletedGameHubNodesForDate({
            hn: patientHn,
            nodes: playableNodes,
            date: currentDate,
        });
        if (!completionStatus.complete) {
            return;
        }

        const nextDay = currentDay + 1;
        const hasNextDay = state.programDays.some((dayItem) => Number(dayItem.day) === nextDay);
        if (hasNextDay) {
            return;
        }

        const dayFrom = Math.max(1, currentDay - 2);
        const dayTo = Math.min(programDayCount, nextDay);
        const program = await loadProgramWindow({
            dayFrom,
            dayTo,
            windowBefore: 0,
            windowAfter: 0,
        });
        state.dailyProgram = program || state.dailyProgram;
        state.programDays = buildProgramDays(program || state.dailyProgram);
        render();
    };

    render();
    await loadProgram();
    await loadHistory();
}
