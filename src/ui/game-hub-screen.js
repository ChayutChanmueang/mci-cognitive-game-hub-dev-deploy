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

function normalizeGame(item, index, fallbackCategory = "Attention") {
    const category = String(item?.mci_group || fallbackCategory || "Attention").trim();
    const name = String(item?.name || `เกมที่ ${index + 1}`).trim();
    const thName = String(item?.th_name || item?.thName || "").trim();

    return {
        id: item?.id ?? `${category}-${index}`,
        gid: String(item?.gid || `${category}-${index}`).trim(),
        name,
        th_name: thName,
        displayName: thName || name,
        mci_group: category,
        max_score: item?.max_score ?? null,
        created_at: item?.created_at ?? null,
    };
}

export function createGameHubState() {
    return {
        programGames: [],
        programDays: [],
        allGames: [],
        restGame: null,
        dailyProgram: null,
        dailyGoal: "",
        historyRecords: [],
        autoCheckInLoading: false,
        autoCheckInCompletedKey: "",
        includeNextProgramDay: false,
        programInitialized: false,
        programLoading: false,
        historyLoading: false,
        programError: "",
        historyError: "",
        scrollTop: 0,
    };
}

function getPatientLabel() {
    const rememberedSession = getPatientSessionCookie();
    if (rememberedSession) {
        return getPatientSessionLabel(rememberedSession);
    }

    const loginId = sessionStorage.getItem("patient_login_id") || "";
    const draft = sessionStorage.getItem("patient_signup_draft");
    if (!draft) {
        return loginId;
    }

    try {
        const parsed = JSON.parse(draft);
        if (parsed?.firstname) {
            return `${parsed.firstname} ${parsed.lastname || ""}`.trim();
        }
    } catch (error) {
        console.warn("Unable to parse patient signup draft:", error);
    }

    return loginId;
}

function getCategoryLabel(categoryId) {
    return CATEGORY_META[categoryId]?.nameTh || "ฝึกสมอง";
}

function getCategoryDescription(categoryId) {
    return CATEGORY_META[categoryId]?.description || "เกมฝึกสมองประจำวัน";
}

function getProgramDateRange(programDate = null) {
    // TODO: Replace this mock "day window" with preset date window from DB when preset scheduling is implemented.
    const anchor = programDate ? new Date(programDate) : new Date();
    const safeAnchor = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
    const start = new Date(safeAnchor);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
        playedFrom: start.toISOString(),
        playedTo: end.toISOString(),
    };
}

function normalizeHistoryRecord(item) {
    const gid = String(item?.gid || "").trim();
    const stage = item?.stage == null || item?.stage === "" ? null : Number(item.stage);
    return {
        gid,
        stage,
        rest: gid === REST_GAME_GID,
        checkIn: Boolean(item?.checkIn || item?.check_in || item?.["check-in"]) || !gid,
        playedAt: item?.start_at || item?.startAt || item?.played_at || item?.playedAt || null,
        endAt: item?.end_at || item?.endAt || null,
    };
}

function isNodeMatchedByHistory(node, historyRecord) {
    if (!node || !historyRecord) {
        return false;
    }

    if (node.type === "game") {
        const nodeStage = node.stage == null || node.stage === "" ? null : Number(node.stage);
        return Boolean(historyRecord.gid)
            && historyRecord.gid === node.gid
            && (nodeStage == null || historyRecord.stage == null || Number(historyRecord.stage) === nodeStage)
            && Boolean(historyRecord.endAt);
    }

    if (node.type === "rest") {
        return historyRecord.gid === REST_GAME_GID;
    }

    if (node.type === "checkin") {
        return historyRecord.checkIn === true || !historyRecord.gid;
    }

    return false;
}

function getSequentialCompletedCount(nodes, historyRecords) {
    const normalizedHistory = (historyRecords || [])
        .map((record) => normalizeHistoryRecord(record))
        .sort((first, second) => {
            const firstTime = new Date(first.playedAt || 0).getTime();
            const secondTime = new Date(second.playedAt || 0).getTime();
            return firstTime - secondTime;
        });

    let cursor = 0;
    let completedCount = 0;

    for (const node of nodes || []) {
        let matchedIndex = -1;

        for (let index = cursor; index < normalizedHistory.length; index += 1) {
            if (isNodeMatchedByHistory(node, normalizedHistory[index])) {
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

function getCheckInDateKey(programDate = null) {
    const anchor = programDate ? new Date(programDate) : new Date();
    const safeAnchor = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
    const year = safeAnchor.getFullYear();
    const month = String(safeAnchor.getMonth() + 1).padStart(2, "0");
    const day = String(safeAnchor.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getAutoCheckInTargetNodes(nodes) {
    const checkInIndex = (nodes || []).findIndex((node) => node?.type === "checkin");
    return checkInIndex >= 0
        ? nodes.slice(0, checkInIndex)
        : nodes || [];
}

function hasCheckInRecord(historyRecords) {
    return (historyRecords || [])
        .map((record) => normalizeHistoryRecord(record))
        .some((record) => record.checkIn === true);
}

function getCompletedGameCount(nodes, completedNodeCount) {
    const safeCompletedNodeCount = Math.max(0, Number(completedNodeCount) || 0);
    return (nodes || [])
        .slice(0, safeCompletedNodeCount)
        .reduce((count, node) => (
            node?.type === "game"
                ? count + 1
                : count
        ), 0);
}

function findRestGame(gameListItems) {
    const list = Array.isArray(gameListItems) ? gameListItems : [];
    const target = list.find((item) => String(item?.gid || "").trim() === REST_GAME_GID);

    return target ? normalizeGame(target, 0, target?.mci_group || "Attention") : null;
}

function buildAllGames(gameListItems) {
    const normalized = (gameListItems || []).map((item, index) =>
        normalizeGame(item, index, item?.mci_group || "Attention"),
    );
    const uniqueGames = [];
    const seen = new Set();

    normalized.forEach((item) => {
        const game = normalizeGame(item, uniqueGames.length, item?.mci_group || "Attention");
        if (!game.gid || seen.has(game.gid)) {
            return;
        }
        seen.add(game.gid);
        uniqueGames.push(game);
    });

    return uniqueGames;
}

function buildProgramGamesFromDailyProgram(dailyProgram) {
    const rows = Array.isArray(dailyProgram?.games)
        ? dailyProgram.games
        : [];

    return rows.map((item, index) => {
        const game = normalizeGame(item, index, item?.mci_group || "Attention");
        if (!game.gid || game.gid === REST_GAME_GID) {
            return null;
        }

        return {
            ...game,
            presetDataId: item?.preset_data_id ?? item?.presetDataId ?? null,
            dailyPresetId: item?.daily_preset_id ?? item?.dailyPresetId ?? null,
            programId: item?.program_id ?? item?.programId ?? dailyProgram?.programId ?? null,
            stage: Number(item?.stage),
            level: Number(item?.level),
            day: Number(item?.day ?? dailyProgram?.programDay),
            loop: Number(item?.loop || dailyProgram?.dailyPreset?.loop || 1),
            goal: String(item?.goal || dailyProgram?.dailyPreset?.goal || "").trim(),
        };
    }).filter(Boolean);
}

function buildProgramDaysFromDailyProgram(dailyProgram) {
    const days = Array.isArray(dailyProgram?.days) ? dailyProgram.days : [];

    if (!days.length && Array.isArray(dailyProgram?.games)) {
        return [{
            day: Number(dailyProgram?.programDay || 1),
            goal: String(dailyProgram?.dailyPreset?.goal || "").trim(),
            loop: Number(dailyProgram?.dailyPreset?.loop || 1),
            games: buildProgramGamesFromDailyProgram(dailyProgram),
        }];
    }

    return days.map((dayItem) => {
        const dayProgram = {
            ...dailyProgram,
            dailyPreset: dayItem?.dailyPreset || dailyProgram?.dailyPreset || null,
            games: Array.isArray(dayItem?.games) ? dayItem.games : [],
        };

        return {
            day: Number(dayItem?.day),
            goal: String(dayItem?.goal || dayItem?.dailyPreset?.goal || "").trim(),
            loop: Number(dayItem?.loop || dayItem?.dailyPreset?.loop || 1),
            games: buildProgramGamesFromDailyProgram(dayProgram),
        };
    }).filter((dayItem) => Number.isFinite(dayItem.day));
}

function buildDailyProgramNodes(games, restGame) {
    const gameNodes = (games || []).map((game, index) => ({
        id: `game-${String(game?.presetDataId || game?.gid || index)}`,
        type: "game",
        gid: String(game?.gid || "").trim(),
        stage: game?.stage ?? null,
        day: game?.day ?? null,
        title: game?.displayName || game?.th_name || game?.name || `เกมที่ ${index + 1}`,
        gameNumber: index + 1,
        gameData: game,
    }));

    if (!gameNodes.length) {
        return [];
    }

    const splitIndex = Math.ceil(gameNodes.length / 2);
    const restNode = {
        id: "rest-node",
        type: "rest",
        gid: REST_GAME_GID,
        title: restGame?.displayName || restGame?.th_name || restGame?.name || "พักยืดเส้นยืดสาย",
        gameData: restGame,
        emoji: "🏋️",
    };
    const checkInNode = {
        id: "checkin-node",
        type: "checkin",
        gid: "",
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

function buildProgramDaySections(programDays, restGame) {
    return (programDays || []).map((dayItem) => ({
        ...dayItem,
        nodes: buildDailyProgramNodes(dayItem?.games || [], restGame),
    }));
}

function flattenProgramDaySections(daySections) {
    return (daySections || []).flatMap((dayItem) => dayItem?.nodes || []);
}

function getProgramDayCompletion(daySection, historyRecords) {
    const nodes = daySection?.nodes || [];
    const completedCount = getSequentialCompletedCount(nodes, historyRecords);
    const gameTarget = nodes.filter((node) => node.type === "game").length;
    const completedGameCount = Math.min(gameTarget, getCompletedGameCount(nodes, completedCount));

    return {
        completedCount,
        completedGameCount,
        gameTarget,
        isComplete: nodes.length > 0 && completedCount >= nodes.length,
    };
}

function areProgramDayGamesComplete(daySection, historyRecords) {
    const gameNodes = (daySection?.nodes || []).filter((node) => node?.type === "game");
    if (!gameNodes.length) {
        return false;
    }

    const normalizedHistory = (historyRecords || []).map((record) => normalizeHistoryRecord(record));
    return gameNodes.every((node) =>
        normalizedHistory.some((historyRecord) => isNodeMatchedByHistory(node, historyRecord)),
    );
}

class HubElement {
    constructor(options = {}) {
        this.options = options;
        this.element = null;
        this.cleanups = [];
        this.children = [];
    }

    html() {
        return "";
    }

    render() {
        const template = document.createElement("template");
        template.innerHTML = this.html().trim();
        this.element = template.content.firstElementChild;
        this.bind();
        return this.element;
    }

    on(target, eventName, handler, options) {
        if (!target) {
            return;
        }

        target.addEventListener(eventName, handler, options);
        this.cleanups.push(() => target.removeEventListener(eventName, handler, options));
    }

    addChild(child, target) {
        this.children.push(child);
        target?.append(child.render());
    }

    bind() {}

    destroy() {
        this.children.forEach((child) => child.destroy());
        this.cleanups.forEach((cleanup) => cleanup());
        this.children = [];
        this.cleanups = [];
        this.element?.remove();
        this.element = null;
    }
}

class DailyGoalTopBar extends HubElement {
    html() {
        const completedGameCount = Math.max(0, Number(this.options.completedGameCount) || 0);
        const dailyGameTarget = Math.max(0, Number(this.options.dailyGameTarget) || 0);
        const progress = dailyGameTarget > 0
            ? Math.min(1, completedGameCount / dailyGameTarget)
            : 0;
        const progressClass = progress >= 0.5 ? "is-half-passed" : "";
        const patientLabel = this.options.patientLabel || "ผู้เล่น";
        const programDay = Number(this.options.programDay) || 1;
        const dailyGoal = String(this.options.dailyGoal || "").trim()
            || (dailyGameTarget > 0
                ? `ทำภารกิจ ${dailyGameTarget} เกม ให้ครบตามแผนประจำวัน`
                : "ยังไม่พบรายการเกมประจำวัน");

        return `
            <header class="hub-clean-topbar">
                <div class="hub-clean-goal">
                    <p class="hub-clean-eyebrow">${escapeHtml(patientLabel)}</p>
                    <h1>เป้าหมายของวันที่ ${programDay}</h1>
                    <p>${escapeHtml(dailyGoal)}</p>
                    <div class="hub-clean-progress ${progressClass}" style="--hub-progress: ${progress};">
                        <md-linear-progress value="${progress}" aria-label="ทำแล้ว ${completedGameCount} จาก ${dailyGameTarget} เกม"></md-linear-progress>
                        <span>${completedGameCount}/${dailyGameTarget}</span>
                    </div>
                </div>
                <div class="hub-clean-profile" role="button" tabindex="0" aria-label="เปิดโปรไฟล์ผู้เล่น">
                    <md-filled-tonal-icon-button aria-label="เปิดโปรไฟล์ผู้เล่น">
                        <md-icon class="material-symbols-rounded">person</md-icon>
                    </md-filled-tonal-icon-button>
                    <strong>โปรไฟล์</strong>
                </div>
            </header>
        `;
    }

    bind() {
        const profile = this.element?.querySelector(".hub-clean-profile");
        const openProfile = () => this.options.onProfile?.();

        this.on(profile, "click", openProfile);
        this.on(profile, "keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            openProfile();
        });
    }
}

class GameLaunchCard extends HubElement {
    html() {
        const node = this.options.nodeData || {};
        const type = node.type || "game";

        if (type === "rest") {
            return `
                <article class="hub-clean-current-card">
                    <p>พักยืดเส้น</p>
                    <h2>${escapeHtml(node.title || "พักยืดเส้นยืดสาย")}</h2>
                    <span>พักสายตา ยืดเส้น และผ่อนคลายก่อนเล่นต่อ</span>
                    <md-outlined-button data-hub-launch-game type="button">บันทึกการพัก</md-outlined-button>
                </article>
            `;
        }

        if (type === "checkin") {
            return `
                <article class="hub-clean-current-card">
                    <p>ภารกิจครบแล้ว</p>
                    <h2>${escapeHtml(node.title || "เช็คชื่อ")}</h2>
                    <span>กดเช็คชื่อเพื่อบันทึกว่าเป้าหมายประจำวันสำเร็จแล้ว</span>
                    <md-outlined-button data-hub-launch-game type="button">เช็คชื่อ</md-outlined-button>
                </article>
            `;
        }

        const game = node.gameData || {};
        const categoryId = game.mci_group || "Attention";
        const gameDisplayName = game.displayName || game.th_name || game.name || node.title || "เกมฝึกสมอง";

        return `
            <article class="hub-clean-current-card">
                <p>${escapeHtml(getCategoryLabel(categoryId))}</p>
                <h2>${escapeHtml(gameDisplayName)}</h2>
                <span>${escapeHtml(getCategoryDescription(categoryId))}</span>
                <md-outlined-button data-hub-launch-game type="button">เริ่มเกม</md-outlined-button>
            </article>
        `;
    }

    bind() {
        this.on(this.element?.querySelector("[data-hub-launch-game]"), "click", () => {
            this.options.onAction?.(this.options.nodeData);
        });
    }
}

class LevelNode extends HubElement {
    html() {
        const node = this.options.nodeData || {};
        const index = Math.max(0, Number(this.options.index) || 0);
        const isDone = Boolean(this.options.isDone);
        const isCurrent = Boolean(this.options.isCurrent);
        const classes = [
            "hub-clean-level",
            isDone ? "is-done" : "",
            isCurrent ? "is-current" : "",
        ].filter(Boolean).join(" ");
        const nodeText = isDone
            ? "✓"
            : node.type === "game"
                ? String(node.gameNumber || index + 1)
                : node.emoji || "•";
        const sideLabel = node.title || `เกมที่ ${index + 1}`;

        return `
            <div class="${classes}">
                <div class="hub-clean-level__node" aria-hidden="true">
                    <span>${nodeText}</span>
                </div>
                <div class="hub-clean-level__side">
                    ${isCurrent ? `<div data-current-card></div>` : `<div class="hub-clean-game-pill">${escapeHtml(sideLabel)}</div>`}
                </div>
            </div>
        `;
    }

    bind() {
        if (!this.options.isCurrent) {
            return;
        }

        this.addChild(new GameLaunchCard({
            nodeData: this.options.nodeData,
            onAction: this.options.onAction,
        }), this.element?.querySelector("[data-current-card]"));
    }
}

class LevelMap extends HubElement {
    html() {
        return `
            <section class="hub-clean-stage">
                <div class="hub-clean-scroll" data-hub-scroll>
                    <div class="hub-clean-content">
                        <div data-day-section-list></div>
                        ${this.options.isLoading ? this.loadingHtml() : ""}
                    </div>
                </div>
                <md-fab class="hub-clean-fab" aria-label="เลื่อนกลับด้านบน" data-scroll-top>
                    <md-icon class="material-symbols-rounded" slot="icon">arrow_upward</md-icon>
                </md-fab>
            </section>
        `;
    }

    loadingHtml() {
        return `
            <div class="hub-clean-empty">
                <md-circular-progress indeterminate aria-label="กำลังโหลดรายการเกม"></md-circular-progress>
                <p>กำลังโหลดรายการเกม</p>
            </div>
        `;
    }

    bind() {
        const scrollArea = this.element?.querySelector("[data-hub-scroll]");
        const scrollTop = this.element?.querySelector("[data-scroll-top]");
        const updateFab = () => {
            const value = scrollArea?.scrollTop || 0;
            scrollTop?.classList.toggle("is-visible", value > 160);
            this.options.onScrollChange?.(value);
        };

        this.renderNodes();
        this.on(scrollArea, "scroll", updateFab, { passive: true });
        this.on(scrollTop, "click", () => scrollArea?.scrollTo({ top: 0, behavior: "smooth" }));

        requestAnimationFrame(() => {
            if (scrollArea) {
                const initialScrollTop = Math.max(0, Number(this.options.initialScrollTop) || 0);
                if (initialScrollTop > 0) {
                    scrollArea.scrollTop = initialScrollTop;
                } else {
                    const currentDay = Number(this.options.currentProgramDay);
                    const currentSection = Number.isFinite(currentDay)
                        ? this.element?.querySelector(`[data-program-day="${currentDay}"]`)
                        : null;
                    if (currentSection) {
                        scrollArea.scrollTop = Math.max(0, currentSection.offsetTop - scrollArea.offsetTop);
                    }
                }
                updateFab();
            }
        });
    }

    renderNodes() {
        const daySections = Array.isArray(this.options.daySections) ? this.options.daySections : [];
        const list = this.element?.querySelector("[data-day-section-list]");

        daySections.forEach((daySection) => {
            const nodes = daySection?.nodes || [];
            const completion = getProgramDayCompletion(daySection, this.options.historyRecords || []);
            const currentNodeIndex = completion.completedCount >= nodes.length ? -1 : completion.completedCount;
            const section = document.createElement("section");
            section.className = "hub-clean-day-section";
            section.dataset.programDay = String(daySection?.day || "");
            section.innerHTML = `
                <div class="hub-clean-day-divider">
                    <span></span>
                    <strong>วันที่ ${escapeHtml(daySection?.day || "")}</strong>
                    <span></span>
                </div>
                <div class="hub-clean-levels" data-level-list></div>
            `;
            list?.append(section);

            const nodeList = section.querySelector("[data-level-list]");
            nodes.forEach((node, index) => {
                this.addChild(new LevelNode({
                    nodeData: node,
                    index,
                    isDone: index < completion.completedCount,
                    isCurrent: currentNodeIndex >= 0 && index === currentNodeIndex,
                    onAction: this.options.onNodeAction,
                }), nodeList);
            });
        });
    }
}

class HubMapScreen extends HubElement {
    html() {
        const selectableGames = Array.isArray(this.options.selectableGames) ? this.options.selectableGames : [];
        const menuItems = selectableGames.map((game) => `
            <md-menu-item data-quick-game-item data-gid="${escapeHtml(game.gid)}">
                <div slot="headline">${escapeHtml(game.displayName || game.th_name || game.name || game.gid || "เกม")}</div>
                <div slot="supporting-text">${escapeHtml(game.gid || "")}</div>
            </md-menu-item>
        `).join("");
        const menuContent = menuItems || `
            <md-menu-item disabled>
                <div slot="headline">ไม่พบรายการเกม</div>
            </md-menu-item>
        `;

        return `
            <section class="hub-clean-screen">
                <div class="hub-clean-shell">
                    <div data-topbar></div>
                    <div data-stage></div>
                    <div class="hub-clean-logout">
                        <md-filled-button data-test-clear-history type="button">ลบประวัติการเล่น</md-filled-button>
                        <md-filled-button data-test-complete-all type="button">เล่นเกมครบทั้งหมด</md-filled-button>
                        <span class="hub-clean-quick-menu">
                            <md-filled-button data-test-quick-game-trigger type="button">เลือกเกมทดสอบ</md-filled-button>
                            <md-menu data-test-quick-game-menu positioning="popover">
                                ${menuContent}
                            </md-menu>
                        </span>
                        <md-filled-button data-test-daily-data-tools type="button">เครื่องมือจัดการข้อมูลรายวันเกม</md-filled-button>
                        <md-filled-button data-test-logout type="button">ออกจากระบบ</md-filled-button>
                    </div>
                </div>
            </section>
        `;
    }

    bind() {
        this.addChild(new DailyGoalTopBar({
            dailyGameTarget: this.options.dailyGameTarget,
            completedGameCount: this.options.completedGameCount,
            dailyGoal: this.options.dailyGoal,
            programDay: this.options.programDay,
            patientLabel: this.options.patientLabel,
            onProfile: this.options.onProfile,
        }), this.element?.querySelector("[data-topbar]"));

        this.addChild(new LevelMap({
            nodes: this.options.nodes,
            completedCount: this.options.completedCount,
            isLoading: this.options.isLoading,
            initialScrollTop: this.options.initialScrollTop,
            daySections: this.options.daySections,
            historyRecords: this.options.historyRecords,
            currentProgramDay: this.options.programDay,
            onScrollChange: this.options.onScrollChange,
            onNodeAction: this.options.onNodeAction,
        }), this.element?.querySelector("[data-stage]"));

        const selectableGameMap = new Map(
            (Array.isArray(this.options.selectableGames) ? this.options.selectableGames : [])
                .map((game) => [String(game?.gid || "").trim(), game])
                .filter(([gid]) => Boolean(gid)),
        );
        // Test-only hub controls for QA shortcuts; the real game flow uses onNodeAction.
        const testQuickGameTrigger = this.element?.querySelector("[data-test-quick-game-trigger]");
        const testQuickGameMenu = this.element?.querySelector("[data-test-quick-game-menu]");
        if (testQuickGameMenu && testQuickGameTrigger) {
            testQuickGameMenu.anchorElement = testQuickGameTrigger;
            this.on(testQuickGameTrigger, "click", () => {
                testQuickGameMenu.open = !testQuickGameMenu.open;
            });
        }

        const quickGameItems = this.element?.querySelectorAll("[data-quick-game-item]") || [];
        quickGameItems.forEach((item) => {
            this.on(item, "click", async () => {
                const gid = String(item.getAttribute("data-gid") || "").trim();
                const selectedGame = selectableGameMap.get(gid);
                if (!selectedGame) {
                    return;
                }

                await this.options.onTestQuickGameSelect?.(selectedGame);
                if (testQuickGameMenu) {
                    testQuickGameMenu.open = false;
                }
            });
        });

        this.on(this.element?.querySelector("[data-test-clear-history]"), "click", async () => {
            try {
                await this.options.onTestClearHistory?.();
            } catch (error) {
                console.error("Unable to clear test history:", error);
            }
        });

        this.on(this.element?.querySelector("[data-test-complete-all]"), "click", async () => {
            try {
                await this.options.onTestCompleteAll?.();
            } catch (error) {
                console.error("Unable to write complete-all test history:", error);
            }
        });

        this.on(this.element?.querySelector("[data-test-daily-data-tools]"), "click", async () => {
            try {
                await this.options.onTestDailyDataTools?.();
            } catch (error) {
                console.error("Unable to open daily game data test tools:", error);
            }
        });

        this.on(this.element?.querySelector("[data-test-logout]"), "click", () => {
            this.options.onTestLogout?.();
        });
    }
}

export async function renderGameHubScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        loadGameList,
        loadDailyProgram = null,
        loadHistoryRecords = null,
        loadCompletedGameHistoryRecords = null,
        loadInstantNodeHistoryRecords = null,
        patientHn = "",
        programDate = null,
        completedCount = 0,
        onLaunchGame = () => {},
        onRestNode = async () => {},
        onCheckInNode = async () => {},
        onTestQuickLaunchGame = async () => {},
        onTestClearTodayHistory = async () => {},
        onTestCompleteAll = async () => {},
        onTestDailyDataTools = async () => {},
        onTestLogout = () => {},
        onProfile = () => {},
        onStateChange = () => {},
        sharedState = null,
    } = options;

    const state = sharedState || createGameHubState();
    if (!Array.isArray(state.programGames)) {
        state.programGames = [];
    }
    if (!Array.isArray(state.programDays)) {
        state.programDays = [];
    }
    if (!Array.isArray(state.allGames)) {
        state.allGames = [];
    }
    if (!Array.isArray(state.historyRecords)) {
        state.historyRecords = [];
    }
    if (typeof state.dailyGoal !== "string") {
        state.dailyGoal = "";
    }
    if (typeof state.autoCheckInLoading !== "boolean") {
        state.autoCheckInLoading = false;
    }
    if (typeof state.autoCheckInCompletedKey !== "string") {
        state.autoCheckInCompletedKey = "";
    }
    if (typeof state.includeNextProgramDay !== "boolean") {
        state.includeNextProgramDay = false;
    }

    let activeScreen = null;
    const patientLabel = getPatientLabel();
    const parsedPatientHn = String(patientHn || "").trim();

    const render = () => {
        activeScreen?.destroy();
        root.innerHTML = "";
        const allDaySections = buildProgramDaySections(state.programDays, state.restGame);
        const currentProgramDay = Number(state.dailyProgram?.programDay || state.programDays[0]?.day || 1);
        const rawCurrentDaySection = allDaySections.find((dayItem) => Number(dayItem?.day) === currentProgramDay)
            || allDaySections[allDaySections.length - 1]
            || { nodes: [] };
        const rawCurrentDayCompletion = getProgramDayCompletion(rawCurrentDaySection, state.historyRecords);
        const shouldShowNextDay = state.includeNextProgramDay
            || rawCurrentDayCompletion.isComplete
            || areProgramDayGamesComplete(rawCurrentDaySection, state.historyRecords);
        const daySections = allDaySections.filter((dayItem) => {
            const day = Number(dayItem?.day);
            return day <= currentProgramDay || (shouldShowNextDay && day === currentProgramDay + 1);
        });
        const programNodes = flattenProgramDaySections(daySections);
        const currentDaySection = daySections.find((dayItem) => Number(dayItem?.day) === currentProgramDay)
            || daySections[daySections.length - 1]
            || { nodes: [] };
        const currentDayCompletion = getProgramDayCompletion(currentDaySection, state.historyRecords);
        const resolvedCompletedCount = Math.max(
            0,
            Number(completedCount) || 0,
            currentDayCompletion.completedCount,
        );
        const resolvedDailyGameTarget = currentDayCompletion.gameTarget;
        const resolvedCompletedGameCount = Math.min(
            resolvedDailyGameTarget,
            currentDayCompletion.completedGameCount,
        );
        activeScreen = new HubMapScreen({
            nodes: programNodes,
            daySections,
            historyRecords: state.historyRecords,
            dailyGameTarget: resolvedDailyGameTarget,
            completedCount: resolvedCompletedCount,
            completedGameCount: resolvedCompletedGameCount,
            dailyGoal: state.dailyGoal,
            programDay: currentProgramDay,
            patientLabel,
            selectableGames: state.allGames,
            isLoading: (state.programLoading && !state.programInitialized) || state.historyLoading,
            initialScrollTop: state.scrollTop,
            onScrollChange: (scrollTop) => {
                state.scrollTop = scrollTop;
            },
            onProfile,
            onTestLogout,
            onTestQuickGameSelect: async (selectedGame) => {
                await onTestQuickLaunchGame(selectedGame);
            },
            onTestClearHistory: async () => {
                await onTestClearTodayHistory();
                await loadPlayedHistory(true);
            },
            onTestCompleteAll: async () => {
                const { playedFrom, playedTo } = getProgramDateRange(programDate);
                await onTestCompleteAll({
                    nodes: programNodes,
                    historyRecords: state.historyRecords,
                    playedFrom,
                    playedTo,
                });
                await loadPlayedHistory(true);
            },
            onTestDailyDataTools,
            onNodeAction: async (selectedNode) => {
                try {
                    if (selectedNode?.type === "game") {
                        await onLaunchGame(selectedNode.gameData);
                        return;
                    }

                    if (selectedNode?.type === "rest") {
                        const result = await onRestNode(selectedNode);
                        if (result?.redirected || result?.cancelled) {
                            return;
                        }
                        await loadPlayedHistory(true);
                        return;
                    }

                    if (selectedNode?.type === "checkin") {
                        // The original onCheckInNode from props navigates away, which we want to prevent.
                        // We'll replicate the core DB logic here and then show our new popup UI.
                        await db.addUserGameHistory({
                            hn: parsedPatientHn,
                            checkIn: true,
                            startAt: new Date().toISOString(),
                        });

                        // We need to reload the history to update the main hub screen UI
                        // to show that the check-in node is now completed.
                        await loadPlayedHistory(true);

                        // Now, we fetch the data needed for the check-in summary popup.
                        const checkInDates = await db.getUserCheckInDatesByHn({ hn: parsedPatientHn });

                        // Finally, show the popup. The function returns a promise that resolves
                        // when the user closes the popup.
                        await showCheckInPopup({
                            checkInDates,
                            defaultDayCount: options.defaultDayCount || 14,
                        });

                        // No need to do anything after the popup closes.
                        return; // Explicitly return to show we've handled this node type.
                    }
                } catch (error) {
                    console.error("Unable to handle selected node action:", error);
                }
            },
        });
        root.append(activeScreen.render());
    };

    const loadProgramGames = async (force = false) => {
        if (state.programLoading) {
            return;
        }

        if (force || !state.programInitialized) {
            state.programLoading = true;
            if (!state.programInitialized) {
                state.programGames = [];
                state.programDays = [];
            }
            render();

            try {
                const gameListItems = typeof loadGameList === "function"
                    ? await loadGameList()
                    : [];
                state.allGames = buildAllGames(gameListItems);
                state.restGame = findRestGame(state.allGames);
                let dailyProgram = null;
                if (typeof loadDailyProgram === "function" && parsedPatientHn) {
                    try {
                        dailyProgram = await loadDailyProgram({
                            hn: parsedPatientHn,
                            windowBefore: state.includeNextProgramDay ? 1 : 2,
                            windowAfter: 1,
                        });
                    } catch (error) {
                        console.warn("Unable to load daily game program:", error);
                    }
                }
                const dailyProgramGames = buildProgramGamesFromDailyProgram(dailyProgram);
                const dailyProgramDays = buildProgramDaysFromDailyProgram(dailyProgram);
                state.dailyProgram = dailyProgram || null;
                const currentDay = Number(dailyProgram?.programDay || dailyProgramDays[0]?.day || 1);
                const currentDayItem = dailyProgramDays.find((dayItem) => Number(dayItem?.day) === currentDay)
                    || dailyProgramDays[dailyProgramDays.length - 1]
                    || null;
                state.dailyGoal = String(currentDayItem?.goal || dailyProgram?.dailyPreset?.goal || dailyProgramGames[0]?.goal || "").trim();
                state.programGames = dailyProgramGames;
                state.programDays = dailyProgramDays;
                state.programError = "";
            } catch (error) {
                console.warn("Unable to load game list:", error);
                state.allGames = buildAllGames([]);
                state.restGame = null;
                state.dailyProgram = null;
                state.dailyGoal = "";
                state.programGames = [];
                state.programDays = [];
                state.programError = error?.message || "Unable to load game list";
            }

            state.programInitialized = true;
            state.programLoading = false;
            onStateChange({ scene: "intro", activeCategory: "Attention" });
            render();
        }
    };

    const maybeAutoCheckIn = async ({
        programNodes,
        historyRecords,
        playedFrom,
    }) => {
        const targetNodes = getAutoCheckInTargetNodes(programNodes);
        const checkInKey = getCheckInDateKey(programDate || playedFrom);

        if (!parsedPatientHn || !targetNodes.length) {
            return;
        }

        if (state.autoCheckInLoading || state.autoCheckInCompletedKey === checkInKey) {
            return;
        }

        if (hasCheckInRecord(historyRecords)) {
            state.autoCheckInCompletedKey = checkInKey;
            return;
        }

        const completedTargetCount = getSequentialCompletedCount(targetNodes, historyRecords);
        if (completedTargetCount < targetNodes.length) {
            return;
        }

        state.autoCheckInLoading = true;

        try {
            const checkInRecord = await db.addUserGameHistory({
                hn: parsedPatientHn,
                checkIn: true,
                startAt: new Date().toISOString(),
            });

            state.historyRecords = [
                ...historyRecords,
                normalizeHistoryRecord(checkInRecord),
            ];
            state.autoCheckInCompletedKey = checkInKey;
            render();

            const checkInDates = await db.getUserCheckInDatesByHn({ hn: parsedPatientHn });
            await showCheckInPopup({
                checkInDates,
                defaultDayCount: options.defaultDayCount || 14,
            });
        } catch (error) {
            console.error("Unable to auto check in completed daily program:", error);
        } finally {
            state.autoCheckInLoading = false;
        }
    };

    const loadPlayedHistory = async (force = false) => {
        if (state.historyLoading && !force) {
            return;
        }

        if (!parsedPatientHn) {
            state.historyRecords = [];
            state.historyError = "";
            render();
            return;
        }

        state.historyLoading = true;
        render();

        try {
            const allProgramGames = (state.programDays || []).flatMap((dayItem) => dayItem?.games || []);
            const gids = allProgramGames
                .map((game) => String(game?.gid || "").trim())
                .filter(Boolean);
            const startDate = state.dailyProgram?.startedProgram || programDate || null;
            const endDate = state.dailyProgram?.programEndDate || programDate || null;
            const { playedFrom } = getProgramDateRange(startDate);
            const { playedTo } = getProgramDateRange(endDate);

            if (
                typeof loadCompletedGameHistoryRecords === "function"
                || typeof loadInstantNodeHistoryRecords === "function"
            ) {
                const [completedGameRows, instantNodeRows] = await Promise.all([
                    typeof loadCompletedGameHistoryRecords === "function"
                        ? loadCompletedGameHistoryRecords({
                            hn: parsedPatientHn,
                            gids,
                            playedFrom,
                            playedTo,
                        })
                        : [],
                    typeof loadInstantNodeHistoryRecords === "function"
                        ? loadInstantNodeHistoryRecords({
                            hn: parsedPatientHn,
                            playedFrom,
                            playedTo,
                        })
                        : [],
                ]);

                state.historyRecords = [
                    ...(Array.isArray(completedGameRows) ? completedGameRows : []),
                    ...(Array.isArray(instantNodeRows) ? instantNodeRows : []),
                ].map((record) => normalizeHistoryRecord(record));
            } else if (typeof loadHistoryRecords === "function") {
                const historyRows = await loadHistoryRecords({
                    hn: parsedPatientHn,
                    playedFrom,
                    playedTo,
                });

                state.historyRecords = Array.isArray(historyRows)
                    ? historyRows.map((record) => normalizeHistoryRecord(record))
                    : [];
            } else {
                state.historyRecords = [];
            }

            state.historyError = "";
            state.historyLoading = false;
            render();

            const currentProgramNodes = buildDailyProgramNodes(
                (state.programDays || []).find((dayItem) => Number(dayItem?.day) === Number(state.dailyProgram?.programDay))?.games
                    || state.programGames,
                state.restGame,
            );
            await maybeAutoCheckIn({
                programNodes: currentProgramNodes,
                historyRecords: state.historyRecords,
                playedFrom,
            });

            const currentDay = Number(state.dailyProgram?.programDay);
            const currentDaySection = buildProgramDaySections(state.programDays, state.restGame)
                .find((dayItem) => Number(dayItem?.day) === currentDay);
            const currentDayCompletion = getProgramDayCompletion(currentDaySection, state.historyRecords);
            const currentDayGamesComplete = areProgramDayGamesComplete(currentDaySection, state.historyRecords);
            if (
                (currentDayCompletion.isComplete || currentDayGamesComplete)
                && !state.includeNextProgramDay
                && currentDay < Number(state.dailyProgram?.programDayCount || 0)
            ) {
                state.includeNextProgramDay = true;
                await loadProgramGames(true);
                await loadPlayedHistory(true);
                return;
            }
        } catch (error) {
            console.warn("Unable to load played game history:", error);
            state.historyRecords = [];
            state.historyError = error?.message || "Unable to load played game history";
        }

        state.historyLoading = false;
        render();
    };

    render();
    await loadProgramGames();
    await loadPlayedHistory();
}
