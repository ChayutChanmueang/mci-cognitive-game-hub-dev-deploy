import { getPatientSessionCookie, getPatientSessionLabel } from "../util/patient-session.js";

const CATEGORY_ORDER = ["Attention", "Memory", "Language", "Visuospatial", "Executive"];
const PAGE_SIZE = 10;
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

function createCategoryState() {
    return {
        items: [],
        total: null,
        nextOffset: 0,
        hasMore: false,
        initialized: false,
        loading: false,
        error: "",
        usedFallback: false,
    };
}

function createCategoryStates() {
    return CATEGORY_ORDER.reduce((states, categoryId) => {
        states[categoryId] = createCategoryState();
        return states;
    }, {});
}

export function createGameHubState() {
    return {
        categoryStates: createCategoryStates(),
        programGames: [],
        programInitialized: false,
        programLoading: false,
        programError: "",
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

function mergeUniqueGames(items, dailyTarget, preferredGameGid) {
    const merged = [...items, ...FALLBACK_GAMES];
    const seen = new Set();
    const uniqueGames = [];

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

    while (uniqueGames.length < dailyTarget) {
        const nextIndex = uniqueGames.length + 1;
        uniqueGames.push(normalizeGame({
            gid: `MOCK${String(nextIndex).padStart(3, "0")}`,
            name: `เกมตัวอย่าง ${nextIndex}`,
            mci_group: "Attention",
        }, nextIndex));
    }

    return uniqueGames.slice(0, dailyTarget);
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
        const completedCount = Math.max(0, Number(this.options.completedCount) || 0);
        const currentGameIndex = Math.min(completedCount, Math.max(0, games.length - 1));
        const list = this.element?.querySelector("[data-level-list]");

        games.forEach((game, index) => {
            this.addChild(new LevelNode({
                gameData: game,
                index,
                isDone: index < completedCount,
                isCurrent: index === currentGameIndex,
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
        loadGamesByCategory,
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
    if (!state.categoryStates) {
        state.categoryStates = createCategoryStates();
    }
    if (!Array.isArray(state.programGames)) {
        state.programGames = [];
    }

    let activeScreen = null;
    const patientLabel = getPatientLabel();

    const render = () => {
        activeScreen?.destroy();
        root.innerHTML = "";
        activeScreen = new HubMapScreen({
            games: state.programGames,
            dailyTarget,
            completedCount,
            patientLabel,
            isLoading: state.programLoading && !state.programInitialized,
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

    const loadCategoryPage = async (categoryId) => {
        const categoryState = state.categoryStates[categoryId] || createCategoryState();
        state.categoryStates[categoryId] = categoryState;

        if (categoryState.initialized || categoryState.loading) {
            return categoryState.items;
        }

        categoryState.loading = true;
        categoryState.error = "";

        try {
            const result = typeof loadGamesByCategory === "function"
                ? await loadGamesByCategory(categoryId, { offset: 0, pageSize: PAGE_SIZE })
                : null;
            const items = (result?.items || []).map((item, index) => normalizeGame(item, index, categoryId));

            categoryState.items = items;
            categoryState.total = Number.isFinite(result?.total) ? Number(result.total) : items.length;
            categoryState.nextOffset = Number(result?.nextOffset) || items.length;
            categoryState.hasMore = Boolean(result?.hasMore);
            categoryState.initialized = true;
            categoryState.loading = false;
            categoryState.usedFallback = false;

            return items;
        } catch (error) {
            console.warn(`Unable to load games for ${categoryId}:`, error);
            categoryState.loading = false;
            categoryState.error = error?.message || "Unable to load games";
            categoryState.initialized = true;
            return [];
        }
    };

    const loadProgramGames = async () => {
        if (state.programInitialized || state.programLoading) {
            return;
        }

        state.programLoading = true;
        state.programGames = mergeUniqueGames([], dailyTarget, preferredGameGid);
        render();

        const loadedGames = [];
        for (const categoryId of CATEGORY_ORDER) {
            if (loadedGames.length >= dailyTarget) {
                break;
            }

            loadedGames.push(...await loadCategoryPage(categoryId));
        }

        state.programGames = mergeUniqueGames(loadedGames, dailyTarget, preferredGameGid);
        state.programInitialized = true;
        state.programLoading = false;
        onStateChange({ scene: "intro", activeCategory: "Attention" });
        render();
    };

    render();
    await loadProgramGames();
}
