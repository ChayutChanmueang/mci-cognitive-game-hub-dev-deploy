import { getPatientSessionCookie, getPatientSessionLabel } from "../util/patient-session.js";

const CATEGORY_META = Object.freeze({
    Memory: {
        id: "Memory",
        nameTh: "ความจำ",
        nameEn: "Memory",
        icon: "memory",
        description: "ฝึกการจดจำข้อมูล ลำดับ และรายละเอียดที่เพิ่งเห็นหรือได้ยิน",
    },
    Visuospatial: {
        id: "Visuospatial",
        nameTh: "มิติสัมพันธ์",
        nameEn: "Visuospatial",
        icon: "crop_free",
        description: "ฝึกการสังเกตรูปทรง พื้นที่ และความสัมพันธ์ของวัตถุ",
    },
    Attention: {
        id: "Attention",
        nameTh: "สมาธิ",
        nameEn: "Attention",
        icon: "center_focus_strong",
        description: "ฝึกการจดจ่อ คัดแยกสิ่งรบกวน และตอบสนองต่อเป้าหมายให้แม่นยำ",
    },
    Language: {
        id: "Language",
        nameTh: "ภาษา",
        nameEn: "Language",
        icon: "translate",
        description: "ฝึกการเข้าใจคำศัพท์ ความหมาย และการใช้ภาษาในบริบทต่าง ๆ",
    },
    Executive: {
        id: "Executive",
        nameTh: "บริหารสมอง",
        nameEn: "Executive",
        icon: "account_tree",
        description: "ฝึกการวางแผน ตัดสินใจ จัดลำดับ และควบคุมการทำงานหลายขั้นตอน",
    },
});

const CATEGORY_ORDER = ["Attention", "Memory", "Language", "Visuospatial", "Executive"];
const PAGE_SIZE = 10;
const DEFAULT_DAILY_TARGET = 10;
const DEFAULT_START_GAME_GID = "ATTN001";
const FALLBACK_GAMES = Object.freeze([
    { id: "fallback-attn-001", gid: "ATTN001", name: "Zoo Feeder", mci_group: "Attention" },
    { id: "fallback-lang-001", gid: "LANG001", name: "เกมนักสืบเติมคำ", mci_group: "Language" },
    { id: "fallback-mem-001", gid: "MEM001", name: "จำภาพโปสการ์ด", mci_group: "Memory" },
    { id: "fallback-attn-002", gid: "ATTN002", name: "ค้นหาสัตว์", mci_group: "Attention" },
    { id: "fallback-exec-001", gid: "EXEC001", name: "จัดลำดับงาน", mci_group: "Executive" },
    { id: "fallback-vis-001", gid: "VIS001", name: "ต่อภาพเส้นทาง", mci_group: "Visuospatial" },
    { id: "fallback-lang-002", gid: "LANG002", name: "เลือกคำให้ถูก", mci_group: "Language" },
    { id: "fallback-mem-002", gid: "MEM002", name: "จับคู่ความจำ", mci_group: "Memory" },
    { id: "fallback-attn-003", gid: "ATTN003", name: "แยกสีให้ไว", mci_group: "Attention" },
    { id: "fallback-exec-002", gid: "EXEC002", name: "วางแผนซื้อของ", mci_group: "Executive" },
]);

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function normalizeGame(item, index, categoryId = "Attention") {
    const parsedCategory = String(item?.mci_group || categoryId || "Attention").trim();

    return {
        id: item?.id ?? `${parsedCategory}-${index}`,
        gid: String(item?.gid || `${parsedCategory}-${index}`).trim(),
        name: String(item?.name || "Untitled Game").trim(),
        mci_group: parsedCategory,
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
    return CATEGORY_ORDER.reduce((accumulator, categoryId) => {
        accumulator[categoryId] = createCategoryState();
        return accumulator;
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

class HubElement {
    constructor(options = {}) {
        this.options = options;
        this.element = null;
        this.cleanups = [];
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
        target?.addEventListener(eventName, handler, options);
        this.cleanups.push(() => target?.removeEventListener(eventName, handler, options));
    }

    bind() {}

    destroy() {
        this.cleanups.forEach((cleanup) => cleanup());
        this.cleanups = [];
        this.element?.remove();
        this.element = null;
    }
}

class DailyGoalTopBar extends HubElement {
    html() {
        const completedCount = Math.max(0, Number(this.options.completedCount) || 0);
        const dailyTarget = Math.max(1, Number(this.options.dailyTarget) || DEFAULT_DAILY_TARGET);
        const progressPercent = Math.min(100, Math.round((completedCount / dailyTarget) * 100));
        const patientLabel = this.options.patientLabel || "ผู้เล่น";

        return `
            <header class="hub-map-topbar">
                <div class="hub-map-topbar__main">
                    <p class="hub-map-eyebrow">${escapeHtml(patientLabel)}</p>
                    <h1>เป้าหมายของวันนี้</h1>
                    <p class="hub-map-topbar__summary">เล่น ${dailyTarget} เกม เพื่อฝึกสมอง</p>
                    <div class="hub-map-progress" aria-label="เล่นแล้ว ${completedCount} จาก ${dailyTarget} เกม">
                        <span class="hub-map-progress__fill" style="width: ${progressPercent}%"></span>
                        <span class="hub-map-progress__label">${completedCount}/${dailyTarget}</span>
                    </div>
                </div>
                <button class="hub-map-profile-button" type="button" aria-label="เปิดโปรไฟล์ผู้เล่น">
                    <span class="hub-map-profile-button__icon">♙</span>
                    <span>โปรไฟล์</span>
                </button>
            </header>
        `;
    }

    bind() {
        this.on(this.element?.querySelector(".hub-map-profile-button"), "click", () => {
            this.options.onProfile?.();
        });
    }
}

class GameLaunchCard extends HubElement {
    html() {
        const game = this.options.gameData || {};
        const categoryId = game.mci_group || "Attention";

        return `
            <article class="hub-map-launch-card">
                <div class="hub-map-launch-card__copy">
                    <p>${escapeHtml(getCategoryLabel(categoryId))}</p>
                    <h2>${escapeHtml(game.name || "เกมฝึกสมอง")}</h2>
                    <span>${escapeHtml(getCategoryDescription(categoryId))}</span>
                </div>
                <button class="hub-map-start-button" type="button">
                    เริ่มเกม
                </button>
            </article>
        `;
    }

    bind() {
        this.on(this.element?.querySelector(".hub-map-start-button"), "click", () => {
            this.options.onLaunch?.(this.options.gameData, this);
        });
    }
}

class LevelNode extends HubElement {
    html() {
        const index = Math.max(0, Number(this.options.index) || 0);
        const game = this.options.gameData || {};
        const isDone = Boolean(this.options.isDone);
        const isCurrent = Boolean(this.options.isCurrent);
        const isLocked = Boolean(this.options.isLocked);
        const classes = [
            "hub-map-level-node",
            isDone ? "is-done" : "",
            isCurrent ? "is-current" : "",
            isLocked ? "is-locked" : "",
        ].filter(Boolean).join(" ");
        const nodeIcon = isDone ? "✓" : isCurrent ? "🧑" : String(index + 1);

        return `
            <div class="${classes}" style="--level-offset: ${index % 2 === 0 ? "0px" : "190px"}">
                <button class="hub-map-level-node__circle" type="button" ${isLocked ? "disabled" : ""}>
                    <span>${nodeIcon}</span>
                </button>
                ${isCurrent ? `<div class="hub-map-level-node__card-slot"></div>` : ""}
                ${!isCurrent ? `<p class="hub-map-level-node__label">${escapeHtml(game.name || `เกมที่ ${index + 1}`)}</p>` : ""}
            </div>
        `;
    }

    bind() {
        this.on(this.element?.querySelector(".hub-map-level-node__circle"), "click", () => {
            if (!this.options.isLocked) {
                this.options.onLaunch?.(this.options.gameData, this);
            }
        });

        if (this.options.isCurrent) {
            const card = new GameLaunchCard({
                gameData: this.options.gameData,
                onLaunch: this.options.onLaunch,
            });
            this.options.registerChild?.(card);
            this.element?.querySelector(".hub-map-level-node__card-slot")?.append(card.render());
        }
    }
}

class LevelMap extends HubElement {
    constructor(options = {}) {
        super(options);
        this.children = [];
    }

    html() {
        const games = this.options.games || [];
        const isLoading = Boolean(this.options.isLoading);
        const hasError = Boolean(this.options.error);

        return `
            <section class="hub-map-stage">
                <div class="hub-map-scroll" data-hub-map-scroll>
                    <div class="hub-map-content">
                        <div class="hub-map-day-divider">
                            <span></span>
                            <strong>วันที่ 1</strong>
                            <span></span>
                        </div>
                        <div class="hub-map-level-list"></div>
                        ${isLoading ? this.loadingHtml() : ""}
                        ${hasError ? this.errorHtml() : ""}
                    </div>
                </div>
                <button class="hub-map-scroll-top" type="button" aria-label="เลื่อนกลับด้านบน">↑</button>
            </section>
        `;
    }

    loadingHtml() {
        return `
            <div class="hub-map-empty">
                <span class="material-symbols-rounded">progress_activity</span>
                <h2>กำลังโหลดรายการเกม</h2>
                <p>กำลังดึงข้อมูลเกมจากฐานข้อมูล</p>
            </div>
        `;
    }

    errorHtml() {
        return `
            <div class="hub-map-empty">
                <span class="material-symbols-rounded">cloud_off</span>
                <h2>ใช้รายการเกมตัวอย่าง</h2>
                <p>ยังโหลดข้อมูลจากฐานข้อมูลไม่ได้ ระบบจึงแสดงรายการทดสอบก่อน</p>
            </div>
        `;
    }

    bind() {
        const scrollArea = this.element?.querySelector("[data-hub-map-scroll]");
        const scrollTopButton = this.element?.querySelector(".hub-map-scroll-top");
        const updateScrollTopButton = () => {
            scrollTopButton?.classList.toggle("is-visible", (scrollArea?.scrollTop || 0) > 160);
            this.options.onScrollChange?.(scrollArea?.scrollTop || 0);
        };

        this.on(scrollArea, "scroll", updateScrollTopButton, { passive: true });
        this.on(scrollTopButton, "click", () => {
            scrollArea?.scrollTo({ top: 0, behavior: "smooth" });
        });

        this.renderNodes();

        requestAnimationFrame(() => {
            if (scrollArea) {
                scrollArea.scrollTop = Math.max(0, Number(this.options.initialScrollTop) || 0);
                updateScrollTopButton();
            }
        });
    }

    renderNodes() {
        const games = this.options.games || [];
        const completedCount = Math.max(0, Number(this.options.completedCount) || 0);
        const currentGameIndex = Math.min(completedCount, Math.max(0, games.length - 1));
        const list = this.element?.querySelector(".hub-map-level-list");

        games.forEach((game, index) => {
            const node = new LevelNode({
                gameData: game,
                index,
                isDone: index < completedCount,
                isCurrent: index === currentGameIndex,
                isLocked: index > currentGameIndex,
                onLaunch: this.options.onLaunch,
                registerChild: (child) => this.children.push(child),
            });
            this.children.push(node);
            list?.append(node.render());
        });
    }

    destroy() {
        this.children.forEach((child) => child.destroy());
        this.children = [];
        super.destroy();
    }
}

class HubMapScreen extends HubElement {
    constructor(options = {}) {
        super(options);
        this.children = [];
    }

    html() {
        return `
            <section class="hub-screen hub-map-screen">
                <div class="hub-map-shell">
                    <div class="hub-map-topbar-slot"></div>
                    <div class="hub-map-stage-slot"></div>
                    <button class="hub-map-logout-button" type="button">ออกจากระบบ</button>
                </div>
            </section>
        `;
    }

    bind() {
        const topBar = new DailyGoalTopBar({
            dailyTarget: this.options.dailyTarget,
            completedCount: this.options.completedCount,
            patientLabel: this.options.patientLabel,
            onProfile: this.options.onProfile,
        });
        const levelMap = new LevelMap({
            games: this.options.games,
            completedCount: this.options.completedCount,
            isLoading: this.options.isLoading,
            error: this.options.error,
            initialScrollTop: this.options.initialScrollTop,
            onScrollChange: this.options.onScrollChange,
            onLaunch: this.options.onLaunch,
        });

        this.children.push(topBar, levelMap);
        this.element?.querySelector(".hub-map-topbar-slot")?.append(topBar.render());
        this.element?.querySelector(".hub-map-stage-slot")?.append(levelMap.render());
        this.on(this.element?.querySelector(".hub-map-logout-button"), "click", () => {
            this.options.onLogout?.();
        });
    }

    destroy() {
        this.children.forEach((child) => child.destroy());
        this.children = [];
        super.destroy();
    }
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
            const firstMatches = firstGame.gid === preferredGameGid;
            const secondMatches = secondGame.gid === preferredGameGid;
            if (firstMatches === secondMatches) {
                return 0;
            }

            return firstMatches ? -1 : 1;
        });
    }

    while (uniqueGames.length < dailyTarget) {
        const nextIndex = uniqueGames.length + 1;
        uniqueGames.push(normalizeGame({
            gid: `MOCK${String(nextIndex).padStart(3, "0")}`,
            name: `เกมตัวอย่าง ${nextIndex}`,
            mci_group: "Attention",
        }, nextIndex, "Attention"));
    }

    return uniqueGames.slice(0, dailyTarget);
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
            error: state.programError,
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
        state.programError = "";
        state.programGames = mergeUniqueGames([], dailyTarget, preferredGameGid);
        render();

        const loadedGames = [];
        for (const categoryId of CATEGORY_ORDER) {
            if (loadedGames.length >= dailyTarget) {
                break;
            }

            const categoryGames = await loadCategoryPage(categoryId);
            loadedGames.push(...categoryGames);
        }

        state.programGames = mergeUniqueGames(loadedGames, dailyTarget, preferredGameGid);
        state.programInitialized = true;
        state.programLoading = false;
        state.programError = loadedGames.length ? "" : "Unable to load program games";
        onStateChange({ scene: "intro", activeCategory: "Attention" });
        render();
    };

    render();
    await loadProgramGames();
}
