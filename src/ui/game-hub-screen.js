import { getPatientSessionCookie, getPatientSessionLabel } from "../util/patient-session.js";
import { showCheckInPopup } from "./checkin-summary-screen.js";
import db from "../core/database.js";

const REST_GAME_GID = "REST001";

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

    const draft = sessionStorage.getItem("patient_signup_draft");
    if (draft) {
        try {
            const parsed = JSON.parse(draft);
            const name = `${parsed?.firstname || ""} ${parsed?.lastname || ""}`.trim();
            if (name) {
                return name;
            }
        } catch (error) {
            console.warn("Unable to parse patient signup draft:", error);
        }
    }

    return fallback || sessionStorage.getItem("patient_login_id") || "ผู้เล่น";
}

function getCategoryLabel(categoryId) {
    return CATEGORY_META[categoryId]?.nameTh || "ฝึกสมอง";
}

function getCategoryDescription(categoryId) {
    return CATEGORY_META[categoryId]?.description || "เกมฝึกสมองประจำวัน";
}

function getLocalDayStart(value = new Date()) {
    const date = new Date(value);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    safeDate.setHours(0, 0, 0, 0);
    return safeDate;
}

function getProgramDateRange(value = new Date()) {
    const start = getLocalDayStart(value);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
        playedFrom: start.toISOString(),
        playedTo: end.toISOString(),
    };
}

function getDateKey(value = new Date()) {
    const date = getLocalDayStart(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getProgramDayDate(startedProgram, programDay) {
    const date = getLocalDayStart(startedProgram || new Date());
    date.setDate(date.getDate() + Math.max(0, (Number(programDay) || 1) - 1));
    return date;
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
    const gameTarget = nodes.filter((node) => node.type === "game").length;
    const completedGameCount = nodes
        .slice(0, completedCount)
        .filter((node) => node.type === "game").length;

    return {
        completedCount,
        completedGameCount: Math.min(gameTarget, completedGameCount),
        gameTarget,
        isComplete: nodes.length > 0 && completedCount >= nodes.length,
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
        dailyProgram: null,
        programDays: [],
        historyRecords: [],
        checkInDateKeys: [],
        loading: false,
        historyLoading: false,
        autoCheckInLoading: false,
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
        const progress = currentCompletion.gameTarget > 0
            ? Math.min(1, currentCompletion.completedGameCount / currentCompletion.gameTarget)
            : 0;
        const progressClass = progress >= 0.5 ? "is-half-passed" : "";
        const currentGoal = String(currentSection.goal || state.dailyProgram?.dailyPreset?.goal || "").trim()
            || (currentCompletion.gameTarget > 0
                ? `ทำภารกิจ ${currentCompletion.gameTarget} เกม ให้ครบตามแผนประจำวัน`
                : "ยังไม่พบรายการเกมประจำวัน");
        const menuItems = state.allGames.map((game) => `
            <md-menu-item data-quick-game-item data-gid="${escapeHtml(game.gid)}">
                <div slot="headline">${escapeHtml(game.displayName || game.th_name || game.name || game.gid || "เกม")}</div>
                <div slot="supporting-text">${escapeHtml(game.gid || "")}</div>
            </md-menu-item>
        `).join("");

        root.innerHTML = `
            <section class="hub-clean-screen">
                <div class="hub-clean-shell">
                    <header class="hub-clean-topbar">
                        <div class="hub-clean-goal">
                            <p class="hub-clean-eyebrow">${escapeHtml(patientLabel)}</p>
                            <h1>เป้าหมายของวันที่ ${escapeHtml(currentDay)}</h1>
                            <p>${escapeHtml(currentGoal)}</p>
                            <div class="hub-clean-progress ${progressClass}" style="--hub-progress: ${progress};">
                                <md-linear-progress value="${progress}" aria-label="ทำแล้ว ${currentCompletion.completedGameCount} จาก ${currentCompletion.gameTarget} เกม"></md-linear-progress>
                                <span>${currentCompletion.completedGameCount}/${currentCompletion.gameTarget}</span>
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
                                ${sections.map((section) => renderDaySection(section, activeDay)).join("")}
                                ${state.loading || state.historyLoading ? `
                                    <div class="hub-clean-empty">
                                        <md-circular-progress indeterminate aria-label="กำลังโหลดรายการเกม"></md-circular-progress>
                                        <p>กำลังโหลดรายการเกม</p>
                                    </div>
                                ` : ""}
                            </div>
                        </div>
                        <md-fab class="hub-clean-fab" aria-label="เลื่อนกลับด้านบน" data-scroll-top>
                            <md-icon class="material-symbols-rounded" slot="icon">arrow_upward</md-icon>
                        </md-fab>
                    </section>
                    <div class="hub-clean-test-menu">
                        <md-fab class="hub-clean-test-fab" data-test-menu-trigger variant="secondary" aria-label="เปิดเมนูทดสอบ">
                            <md-icon class="material-symbols-rounded" slot="icon">settings</md-icon>
                        </md-fab>
                        <md-menu data-test-menu positioning="popover" has-overflow>
                            <md-menu-item data-test-clear-history>
                                <md-icon class="material-symbols-rounded" slot="start">delete</md-icon>
                                <div slot="headline">ลบประวัติการเล่น</div>
                            </md-menu-item>
                            <md-menu-item data-test-complete-all>
                                <md-icon class="material-symbols-rounded" slot="start">checklist</md-icon>
                                <div slot="headline">เล่นเกมครบทั้งหมด</div>
                            </md-menu-item>
                            <md-sub-menu anchor-corner="start-end" menu-corner="start-start">
                                <md-menu-item slot="item">
                                    <md-icon class="material-symbols-rounded" slot="start">sports_esports</md-icon>
                                    <div slot="headline">เลือกเกมทดสอบ</div>
                                    <md-icon class="material-symbols-rounded" slot="end">arrow_right</md-icon>
                                </md-menu-item>
                                <md-menu slot="menu" data-test-quick-game-menu positioning="popover">
                                    ${menuItems || `<md-menu-item disabled><div slot="headline">ไม่พบรายการเกม</div></md-menu-item>`}
                                </md-menu>
                            </md-sub-menu>
                            <md-menu-item data-test-daily-data-tools>
                                <md-icon class="material-symbols-rounded" slot="start">database</md-icon>
                                <div slot="headline">เครื่องมือจัดการข้อมูลรายวันเกม</div>
                            </md-menu-item>
                            <md-divider role="separator" tabindex="-1"></md-divider>
                            <md-menu-item data-test-logout>
                                <md-icon class="material-symbols-rounded" slot="start">logout</md-icon>
                                <div slot="headline">ออกจากระบบ</div>
                            </md-menu-item>
                        </md-menu>
                    </div>
                </div>
            </section>
        `;

        bind(sections, activeDay);
    };

    const renderDaySection = (section, activeDay) => {
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
                    ${section.nodes.map((node, index) => renderNode(node, index, index < completion.completedCount, index === currentNodeIndex)).join("")}
                </div>
            </section>
        `;
    };

    const renderNode = (node, index, isDone, isCurrent) => {
        const classes = ["hub-clean-level", isDone ? "is-done" : "", isCurrent ? "is-current" : ""]
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
        const side = isCurrent
            ? renderCurrentCard(node)
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

    const renderCurrentCard = (node) => {
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
                    <md-outlined-button data-node-action data-day="${escapeHtml(node.day)}" data-node-id="${escapeHtml(node.id)}" type="button">บันทึกการพัก</md-outlined-button>
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
                <md-outlined-button data-node-action data-day="${escapeHtml(node.day)}" data-node-id="${escapeHtml(node.id)}" type="button">เริ่มเกม</md-outlined-button>
            </article>
        `;
    };

    const bind = (sections, activeDay) => {
        const scrollArea = root.querySelector("[data-hub-scroll]");
        const scrollTop = root.querySelector("[data-scroll-top]");
        const updateFab = () => {
            const value = scrollArea?.scrollTop || 0;
            state.scrollTop = value;
            scrollTop?.classList.toggle("is-visible", value > 160);
        };

        on(scrollArea, "scroll", updateFab, { passive: true });
        on(scrollTop, "click", () => scrollArea?.scrollTo({ top: 0, behavior: "smooth" }));
        requestAnimationFrame(() => {
            if (!scrollArea) {
                return;
            }
            const activeSection = root.querySelector(`[data-program-day="${activeDay}"]`);
            scrollArea.scrollTop = activeSection
                ? Math.max(0, activeSection.offsetTop - scrollArea.offsetTop)
                : Math.max(0, Number(state.scrollTop) || 0);
            updateFab();
        });

        on(root.querySelector(".hub-clean-profile"), "click", () => options.onProfile?.());
        on(root.querySelector(".hub-clean-profile"), "keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            event.preventDefault();
            options.onProfile?.();
        });

        const nodeMap = new Map(sections.flatMap((section) => section.nodes.map((node) => [node.id, node])));
        root.querySelectorAll("[data-node-action]").forEach((button) => {
            on(button, "click", async () => {
                const node = nodeMap.get(button.getAttribute("data-node-id"));
                await handleNodeAction(node);
            });
        });

        bindTestControls(sections, activeDay);
    };

    const bindTestControls = (sections, activeDay) => {
        const testTrigger = root.querySelector("[data-test-menu-trigger]");
        const testMenu = root.querySelector("[data-test-menu]");
        const quickMenu = root.querySelector("[data-test-quick-game-menu]");

        const closeTestMenus = () => {
            if (quickMenu) {
                quickMenu.open = false;
            }
            if (testMenu) {
                testMenu.open = false;
            }
            testTrigger?.setAttribute("aria-expanded", "false");
        };

        if (testTrigger && testMenu) {
            testMenu.anchorElement = testTrigger;
            testTrigger.setAttribute("aria-haspopup", "menu");
            testTrigger.setAttribute("aria-expanded", "false");
            on(testTrigger, "click", () => {
                testMenu.open = !testMenu.open;
                testTrigger.setAttribute("aria-expanded", testMenu.open ? "true" : "false");
            });
            on(testMenu, "closed", () => {
                testTrigger.setAttribute("aria-expanded", "false");
            });
        }

        const selectableGameMap = new Map(state.allGames.map((game) => [game.gid, game]));
        root.querySelectorAll("[data-quick-game-item]").forEach((item) => {
            on(item, "click", async () => {
                const selectedGame = selectableGameMap.get(String(item.getAttribute("data-gid") || "").trim());
                if (selectedGame) {
                    await options.onTestQuickLaunchGame?.(selectedGame);
                }
                closeTestMenus();
            });
        });

        on(root.querySelector("[data-test-clear-history]"), "click", async () => {
            await options.onTestClearTodayHistory?.();
            await loadHistory(true);
            closeTestMenus();
        });

        on(root.querySelector("[data-test-complete-all]"), "click", async () => {
            const targetSection = sections.find((section) => Number(section.day) === Number(activeDay))
                || getCurrentDaySection(sections);
            const { playedFrom, playedTo } = getProgramDateRange(getProgramDayDate(getStartedProgram(), Number(targetSection.day || 1)));
            await options.onTestCompleteAll?.({
                nodes: targetSection.nodes || [],
                historyRecords: state.historyRecords,
                playedFrom,
                playedTo,
            });
            await loadHistory(true);
            closeTestMenus();
        });

        on(root.querySelector("[data-test-daily-data-tools]"), "click", async () => {
            await options.onTestDailyDataTools?.();
            closeTestMenus();
        });

        on(root.querySelector("[data-test-logout]"), "click", () => {
            options.onTestLogout?.();
            closeTestMenus();
        });
    };

    const handleNodeAction = async (node) => {
        if (!node) {
            return;
        }

        try {
            if (node.type === "game") {
                await options.onLaunchGame?.(node.gameData);
                return;
            }

            if (node.type === "rest") {
                const result = await options.onRestNode?.(node);
                if (result?.redirected || result?.cancelled) {
                    return;
                }
                await loadHistory(true);
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
            const gameListItems = typeof options.loadGameList === "function" ? await options.loadGameList() : [];
            state.allGames = buildAllGames(gameListItems);
            state.restGame = state.allGames.find((game) => game.gid === REST_GAME_GID) || null;

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

        state.checkInDateKeys = await db.getUserCheckInDatesByHn({ hn: patientHn });
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
                const checkInDates = await db.getUserCheckInDatesByHn({ hn: patientHn });
                await showCheckInPopup({
                    checkInDates,
                    defaultDayCount: options.defaultDayCount || 14,
                });
            }
        } catch (error) {
            console.error("Unable to sync game hub check-in records:", error);
        } finally {
            state.autoCheckInLoading = false;
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
