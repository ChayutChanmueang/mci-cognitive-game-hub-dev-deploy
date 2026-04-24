import { getPatientSessionCookie, getPatientSessionLabel } from "../util/patient-session.js";

const DEFAULT_DAILY_TARGET = 14;
const DEFAULT_START_GAME_GID = "ATTN001";

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

const FALLBACK_GAMES = Object.freeze([
    { id: "fallback-attn-001", gid: "ATTN001", name: "Zoo Feeder", mci_group: "Attention" },
    { id: "fallback-mem-001", gid: "MEM001", name: "Postcard Reader", mci_group: "Memory" },
    { id: "fallback-lang-001", gid: "LANG001", name: "Context Clues", mci_group: "Language" },
    { id: "fallback-vis-001", gid: "VIS001", name: "Symmetry Decor", mci_group: "Visuospatial" },
    { id: "fallback-attn-002", gid: "ATTN002", name: "Zoo Detective", mci_group: "Attention" },
    { id: "fallback-attn-003", gid: "ATTN003", name: "ค้นหาสัตว์", mci_group: "Attention" },
    { id: "fallback-vis-002", gid: "VIS002", name: "ต่อภาพเส้นทาง", mci_group: "Visuospatial" },
    { id: "fallback-lang-002", gid: "LANG002", name: "เลือกคำให้ถูก", mci_group: "Language" },
]);
const DAY_ONE_PRESET_GIDS_MOCK = Object.freeze([
    "ATTN001",
    "LANG001",
    "MEM001",
    "EXEC001",
    "VSP001",
]);

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

    return {
        id: item?.id ?? `${category}-${index}`,
        gid: String(item?.gid || `${category}-${index}`).trim(),
        name: String(item?.name || `เกมที่ ${index + 1}`).trim(),
        mci_group: category,
        max_score: item?.max_score ?? null,
        created_at: item?.created_at ?? null,
    };
}

export function createGameHubState() {
    return {
        programGames: [],
        playedGameGids: [],
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

function getSequentialCompletedCount(games, playedGids) {
    const playedSet = new Set((playedGids || []).map((gid) => String(gid || "").trim()).filter(Boolean));
    let completedCount = 0;

    for (const game of games || []) {
        const gid = String(game?.gid || "").trim();
        if (!gid || !playedSet.has(gid)) {
            break;
        }
        completedCount += 1;
    }

    return completedCount;
}

function buildProgramGamesFromPreset(gameListItems, dailyTarget, preferredGameGid) {
    // TODO: Replace this mock preset GID set (derived from CSV day-1 sample) with DB preset data when preset table is ready.
    const presetGids = DAY_ONE_PRESET_GIDS_MOCK;
    const normalizedGameList = (gameListItems || []).map((item, index) =>
        normalizeGame(item, index, item?.mci_group || "Attention"),
    );
    const gameMapByGid = new Map();

    normalizedGameList.forEach((game) => {
        if (game.gid) {
            gameMapByGid.set(game.gid, game);
        }
    });

    const selectedGames = presetGids
        .map((gid) => gameMapByGid.get(gid))
        .filter(Boolean);

    const selectedGids = new Set(selectedGames.map((game) => game.gid));
    const remainingGames = normalizedGameList.filter((game) => !selectedGids.has(game.gid));
    const merged = [...selectedGames, ...remainingGames, ...FALLBACK_GAMES];
    const uniqueGames = [];
    const seen = new Set();

    for (const item of merged) {
        const game = normalizeGame(item, uniqueGames.length, item?.mci_group || "Attention");
        if (!game.gid || seen.has(game.gid)) {
            continue;
        }
        seen.add(game.gid);
        uniqueGames.push(game);
    }

    if (preferredGameGid) {
        uniqueGames.sort((firstGame, secondGame) => {
            if (firstGame.gid === preferredGameGid) {
                return -1;
            }
            if (secondGame.gid === preferredGameGid) {
                return 1;
            }
            return 0;
        });
    }

    const requestedTarget = Math.max(1, Number(dailyTarget) || presetGids.length || DEFAULT_DAILY_TARGET);
    const target = Math.min(requestedTarget, presetGids.length || requestedTarget);
    return uniqueGames.slice(0, target);
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
        const completedCount = Math.max(0, Number(this.options.completedCount) || 0);
        const dailyTarget = Math.max(1, Number(this.options.dailyTarget) || DEFAULT_DAILY_TARGET);
        const progress = Math.min(1, completedCount / dailyTarget);
        const patientLabel = this.options.patientLabel || "ผู้เล่น";

        return `
            <header class="hub-clean-topbar">
                <div class="hub-clean-goal">
                    <p class="hub-clean-eyebrow">${escapeHtml(patientLabel)}</p>
                    <h1>เป้าหมายของวันนี้</h1>
                    <p>เล่น ${dailyTarget} เกม เพื่อฝึกสมอง</p>
                    <div class="hub-clean-progress">
                        <md-linear-progress value="${progress}" aria-label="เล่นแล้ว ${completedCount} จาก ${dailyTarget} เกม"></md-linear-progress>
                        <span>${completedCount}/${dailyTarget}</span>
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
        const game = this.options.gameData || {};
        const categoryId = game.mci_group || "Attention";

        return `
            <article class="hub-clean-current-card">
                <p>${escapeHtml(getCategoryLabel(categoryId))}</p>
                <h2>${escapeHtml(game.name || "เกมฝึกสมอง")}</h2>
                <span>${escapeHtml(getCategoryDescription(categoryId))}</span>
                <md-outlined-button data-hub-launch-game type="button">เริ่มเกม</md-outlined-button>
            </article>
        `;
    }

    bind() {
        this.on(this.element?.querySelector("[data-hub-launch-game]"), "click", () => {
            this.options.onLaunch?.(this.options.gameData);
        });
    }
}

class LevelNode extends HubElement {
    html() {
        const index = Math.max(0, Number(this.options.index) || 0);
        const game = this.options.gameData || {};
        const isDone = Boolean(this.options.isDone);
        const isCurrent = Boolean(this.options.isCurrent);
        const classes = [
            "hub-clean-level",
            isDone ? "is-done" : "",
            isCurrent ? "is-current" : "",
        ].filter(Boolean).join(" ");
        const nodeText = isDone ? "✓" : isCurrent ? "🧑" : String(index + 1);

        return `
            <div class="${classes}">
                <div class="hub-clean-level__node" aria-hidden="true">
                    <span>${nodeText}</span>
                </div>
                <div class="hub-clean-level__side">
                    ${isCurrent ? `<div data-current-card></div>` : `<div class="hub-clean-game-pill">${escapeHtml(game.name || `เกมที่ ${index + 1}`)}</div>`}
                </div>
            </div>
        `;
    }

    bind() {
        if (!this.options.isCurrent) {
            return;
        }

        this.addChild(new GameLaunchCard({
            gameData: this.options.gameData,
            onLaunch: this.options.onLaunch,
        }), this.element?.querySelector("[data-current-card]"));
    }
}

class LevelMap extends HubElement {
    html() {
        return `
            <section class="hub-clean-stage">
                <div class="hub-clean-scroll" data-hub-scroll>
                    <div class="hub-clean-content">
                        <div class="hub-clean-day-divider">
                            <span></span>
                            <strong>วันที่ 1</strong>
                            <span></span>
                        </div>
                        <div class="hub-clean-levels" data-level-list></div>
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
                scrollArea.scrollTop = Math.max(0, Number(this.options.initialScrollTop) || 0);
                updateFab();
            }
        });
    }

    renderNodes() {
        const games = this.options.games || [];
        const completedCount = Math.min(
            games.length,
            Math.max(0, Number(this.options.completedCount) || 0),
        );
        const currentGameIndex = completedCount >= games.length ? -1 : completedCount;
        const list = this.element?.querySelector("[data-level-list]");

        games.forEach((game, index) => {
            this.addChild(new LevelNode({
                gameData: game,
                index,
                isDone: index < completedCount,
                isCurrent: currentGameIndex >= 0 && index === currentGameIndex,
                onLaunch: this.options.onLaunch,
            }), list);
        });
    }
}

class HubMapScreen extends HubElement {
    html() {
        return `
            <section class="hub-clean-screen">
                <div class="hub-clean-shell">
                    <div data-topbar></div>
                    <div data-stage></div>
                    <div class="hub-clean-logout">
                        <md-filled-button data-logout type="button">ออกจากระบบ</md-filled-button>
                    </div>
                </div>
            </section>
        `;
    }

    bind() {
        this.addChild(new DailyGoalTopBar({
            dailyTarget: this.options.dailyTarget,
            completedCount: this.options.completedCount,
            patientLabel: this.options.patientLabel,
            onProfile: this.options.onProfile,
        }), this.element?.querySelector("[data-topbar]"));

        this.addChild(new LevelMap({
            games: this.options.games,
            completedCount: this.options.completedCount,
            isLoading: this.options.isLoading,
            initialScrollTop: this.options.initialScrollTop,
            onScrollChange: this.options.onScrollChange,
            onLaunch: this.options.onLaunch,
        }), this.element?.querySelector("[data-stage]"));

        this.on(this.element?.querySelector("[data-logout]"), "click", () => {
            this.options.onLogout?.();
        });
    }
}

export async function renderGameHubScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        loadGameList,
        loadPlayedGameGids = null,
        patientHn = "",
        programDate = null,
        dailyTarget = DEFAULT_DAILY_TARGET,
        completedCount = 0,
        preferredGameGid = DEFAULT_START_GAME_GID,
        onLaunchGame = () => {},
        onLogout = () => {},
        onProfile = () => {},
        onStateChange = () => {},
        sharedState = null,
    } = options;

    const state = sharedState || createGameHubState();
    if (!Array.isArray(state.programGames)) {
        state.programGames = [];
    }
    if (!Array.isArray(state.playedGameGids)) {
        state.playedGameGids = [];
    }

    let activeScreen = null;
    const patientLabel = getPatientLabel();
    const parsedPatientHn = String(patientHn || "").trim();

    const render = () => {
        activeScreen?.destroy();
        root.innerHTML = "";
        const derivedCompletedCount = getSequentialCompletedCount(state.programGames, state.playedGameGids);
        const resolvedCompletedCount = Math.max(0, Number(completedCount) || 0, derivedCompletedCount);
        const resolvedDailyTarget = Math.max(1, state.programGames.length || dailyTarget);
        activeScreen = new HubMapScreen({
            games: state.programGames,
            dailyTarget: resolvedDailyTarget,
            completedCount: resolvedCompletedCount,
            patientLabel,
            isLoading: (state.programLoading && !state.programInitialized) || state.historyLoading,
            initialScrollTop: state.scrollTop,
            onScrollChange: (scrollTop) => {
                state.scrollTop = scrollTop;
            },
            onProfile,
            onLogout,
            onLaunch: async (selectedGame) => {
                try {
                    await onLaunchGame(selectedGame);
                } catch (error) {
                    console.error("Unable to launch selected game:", error);
                }
            },
        });
        root.append(activeScreen.render());
    };

    const loadProgramGames = async () => {
        if (state.programLoading) {
            return;
        }

        if (!state.programInitialized) {
            state.programLoading = true;
            state.programGames = [];
            render();

            try {
                const gameListItems = typeof loadGameList === "function"
                    ? await loadGameList()
                    : [];
                state.programGames = buildProgramGamesFromPreset(gameListItems, dailyTarget, preferredGameGid);
                state.programError = "";
            } catch (error) {
                console.warn("Unable to load game list:", error);
                state.programGames = buildProgramGamesFromPreset([], dailyTarget, preferredGameGid);
                state.programError = error?.message || "Unable to load game list";
            }

            state.programInitialized = true;
            state.programLoading = false;
            onStateChange({ scene: "intro", activeCategory: "Attention" });
            render();
        }
    };

    const loadPlayedHistory = async () => {
        if (state.historyLoading) {
            return;
        }

        if (!state.programGames.length || !parsedPatientHn || typeof loadPlayedGameGids !== "function") {
            state.playedGameGids = [];
            state.historyError = "";
            render();
            return;
        }

        state.historyLoading = true;
        render();

        try {
            const gids = state.programGames
                .map((game) => String(game?.gid || "").trim())
                .filter(Boolean);
            const { playedFrom, playedTo } = getProgramDateRange(programDate);
            const playedGameGids = await loadPlayedGameGids({
                hn: parsedPatientHn,
                gids,
                playedFrom,
                playedTo,
            });

            state.playedGameGids = Array.isArray(playedGameGids) ? playedGameGids : [];
            state.historyError = "";
        } catch (error) {
            console.warn("Unable to load played game history:", error);
            state.playedGameGids = [];
            state.historyError = error?.message || "Unable to load played game history";
        }

        state.historyLoading = false;
        render();
    };

    render();
    await loadProgramGames();
    await loadPlayedHistory();
}
