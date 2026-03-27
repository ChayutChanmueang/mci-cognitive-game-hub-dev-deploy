const CATEGORY_META = Object.freeze({
    Memory: {
        id: "Memory",
        nameTh: "ความจำ",
        nameEn: "Memory",
        icon: "memory",
        tone: "peach",
        description: "ฝึกการจดจำข้อมูล ลำดับ และรายละเอียดที่เพิ่งเห็นหรือได้ยิน",
    },
    Visuospatial: {
        id: "Visuospatial",
        nameTh: "มิติสัมพันธ์",
        nameEn: "Visuospatial",
        icon: "crop_free",
        tone: "sky",
        description: "ฝึกการสังเกตรูปทรง พื้นที่ และความสัมพันธ์ของวัตถุ",
    },
    Attention: {
        id: "Attention",
        nameTh: "สมาธิ",
        nameEn: "Attention",
        icon: "center_focus_strong",
        tone: "sun",
        description: "ฝึกการจดจ่อ คัดแยกสิ่งรบกวน และตอบสนองต่อเป้าหมายให้แม่นยำ",
    },
    Language: {
        id: "Language",
        nameTh: "ภาษา",
        nameEn: "Language",
        icon: "translate",
        tone: "mint",
        description: "ฝึกการเข้าใจคำศัพท์ ความหมาย และการใช้ภาษาในบริบทต่าง ๆ",
    },
    Executive: {
        id: "Executive",
        nameTh: "บริหารสมอง",
        nameEn: "Executive",
        icon: "account_tree",
        tone: "rose",
        description: "ฝึกการวางแผน ตัดสินใจ จัดลำดับ และควบคุมการทำงานหลายขั้นตอน",
    },
});

const CATEGORY_ORDER = ["Memory", "Visuospatial", "Attention", "Language", "Executive"];
const PAGE_SIZE = 10;
const FALLBACK_GAMES = Object.freeze({
    Attention: [
        {
            id: "fallback-attn-001",
            gid: "ATTN001",
            name: "Zoo Feeder",
            mci_group: "Attention",
            max_score: null,
            created_at: null,
        },
    ],
});

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function normalizeGame(item, index, categoryId) {
    return {
        id: item?.id ?? `${categoryId}-${index}`,
        gid: String(item?.gid || `${categoryId}-${index}`).trim(),
        name: String(item?.name || "Untitled Game").trim(),
        mci_group: String(item?.mci_group || categoryId).trim(),
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

function getPatientLabel() {
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

function getSummaryText(state) {
    if (state.loading && !state.initialized) {
        return "กำลังโหลด...";
    }

    if (state.total === 0) {
        return "ยังไม่มีเกม";
    }

    if (typeof state.total === "number" && state.total > 0) {
        return `${state.total} เกม`;
    }

    if (state.usedFallback && state.items.length) {
        return `${state.items.length} เกมตัวอย่าง`;
    }

    return "แตะเพื่อดูรายการเกม";
}

function buildIntroMarkup() {
    return `
        <section class="hub-screen hub-screen--intro">
            <div class="hub-hero">
                <div class="hub-hero__icon">
                    <span class="material-symbols-rounded">neurology</span>
                </div>
                <p class="auth-eyebrow">Game Hub</p>
                <h1>Brain Boost Hub</h1>
                <p class="hub-hero__copy">
                    ศูนย์กลางสำหรับเลือกหมวด MCI และเข้าสู่เกมฝึกสมองแต่ละด้านจากหน้าเดียว
                </p>
                <md-filled-button id="hub-start-button" type="button">
                    <span slot="icon" class="material-symbols-rounded">play_arrow</span>
                    เริ่มเลือกเกม
                </md-filled-button>
            </div>
        </section>
    `;
}

function buildCategoryButton(category, state, isActive) {
    return `
        <button
            type="button"
            class="hub-category-chip${isActive ? " is-active" : ""}"
            data-category-id="${category.id}"
        >
            <span class="hub-category-chip__name">${escapeHtml(category.nameTh)}</span>
            <span class="hub-category-chip__en">${escapeHtml(category.nameEn)}</span>
            <span class="hub-category-chip__meta">${escapeHtml(getSummaryText(state))}</span>
        </button>
    `;
}

function buildGameCard(game, category) {
    return `
        <article class="hub-game-card">
            <div class="hub-game-card__icon">
                <span class="material-symbols-rounded">${category.icon}</span>
            </div>
            <div class="hub-game-card__body">
                <div class="hub-game-card__titles">
                    <h3>${escapeHtml(game.name)}</h3>
                    <p>${escapeHtml(category.nameTh)} · ${escapeHtml(category.nameEn)} · ${escapeHtml(game.gid)}</p>
                </div>
                <div class="hub-game-card__actions">
                    <span class="hub-status-chip hub-status-chip--playable">
                        พร้อมเล่น
                    </span>
                    <md-filled-icon-button
                        aria-label="เล่น ${escapeHtml(game.name)}"
                        data-game-gid="${escapeHtml(game.gid)}"
                    >
                        <span class="material-symbols-rounded">play_arrow</span>
                    </md-filled-icon-button>
                </div>
            </div>
        </article>
    `;
}

function buildLoadingMarkup() {
    return `
        <div class="hub-empty-state">
            <span class="material-symbols-rounded">progress_activity</span>
            <h3>กำลังโหลดรายการเกม</h3>
            <p>กำลังดึงข้อมูลเกมของหมวดนี้จากฐานข้อมูล</p>
        </div>
    `;
}

function buildErrorMarkup() {
    return `
        <div class="hub-empty-state">
            <span class="material-symbols-rounded">cloud_off</span>
            <h3>ยังโหลดรายการเกมไม่ได้</h3>
            <p>ลองแตะหมวดนี้อีกครั้งในภายหลัง</p>
        </div>
    `;
}

function buildEmptyMarkup() {
    return `
        <div class="hub-empty-state">
            <span class="material-symbols-rounded">upcoming</span>
            <h3>เกมจะตามมาในภายหลัง</h3>
            <p>หมวดนี้ยังไม่มีเกมในระบบตอนนี้ แต่จะมีเกมเพิ่มเข้ามาเร็ว ๆ นี้</p>
        </div>
    `;
}

function buildLoadMoreMarkup() {
    return `
        <div class="hub-load-more">
            <md-outlined-button id="hub-load-more-button" type="button">
                <span slot="icon" class="material-symbols-rounded">expand_more</span>
                โหลดเพิ่มอีก 10 เกม
            </md-outlined-button>
        </div>
    `;
}

function buildSelectionMarkup({ activeCategory, categoryStates, patientLabel }) {
    const currentCategory = CATEGORY_META[activeCategory];
    const currentState = categoryStates[activeCategory];

    const categoriesHtml = CATEGORY_ORDER.map((categoryId) =>
        buildCategoryButton(
            CATEGORY_META[categoryId],
            categoryStates[categoryId],
            categoryId === activeCategory,
        ),
    ).join("");

    let gamesHtml = "";
    if (currentState.loading && !currentState.initialized) {
        gamesHtml = buildLoadingMarkup();
    } else if (currentState.error && !currentState.items.length) {
        gamesHtml = buildErrorMarkup();
    } else if (!currentState.items.length) {
        gamesHtml = buildEmptyMarkup();
    } else {
        gamesHtml = currentState.items
            .map((game) => buildGameCard(game, currentCategory))
            .join("");

        if (currentState.hasMore) {
            gamesHtml += buildLoadMoreMarkup();
        }
    }

    return `
        <section class="hub-screen hub-screen--selection">
            <div class="hub-shell">
                <header class="hub-header">
                    <md-outlined-icon-button id="hub-back-button" aria-label="กลับ">
                        <span class="material-symbols-rounded">arrow_back_ios_new</span>
                    </md-outlined-icon-button>
                    <div class="hub-header__copy">
                        <h2>เลือกหมวดหมู่</h2>
                        <p>${patientLabel ? `ผู้ใช้งาน: ${escapeHtml(patientLabel)}` : "เลือกหมวดที่ต้องการแล้วเริ่มเกมได้ทันที"}</p>
                    </div>
                </header>

                <div class="hub-layout">
                    <aside class="hub-panel hub-panel--categories">
                        <div class="hub-panel__heading">
                            <span class="material-symbols-rounded">category</span>
                            <h3>หมวด MCI</h3>
                        </div>
                        <div class="hub-category-rail">
                            ${categoriesHtml}
                        </div>
                    </aside>

                    <section class="hub-panel hub-panel--games tone-${currentCategory.tone}">
                        <div class="hub-panel__heading hub-panel__heading--games">
                            <div class="hub-panel__heading-copy">
                                <span class="hub-panel__marker"></span>
                                <div>
                                    <h3>เกม${escapeHtml(currentCategory.nameTh)}</h3>
                                    <p>${escapeHtml(currentCategory.description)}</p>
                                </div>
                            </div>
                        </div>
                        <div class="hub-game-list">
                            ${gamesHtml}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    `;
}

export async function renderGameHubScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        loadGamesByCategory,
        onLaunchGame = () => {},
    } = options;

    const patientLabel = getPatientLabel();
    const categoryStates = CATEGORY_ORDER.reduce((accumulator, categoryId) => {
        accumulator[categoryId] = createCategoryState();
        return accumulator;
    }, {});
    let scene = "intro";
    let activeCategory = "Attention";

    const render = () => {
        root.innerHTML = scene === "intro"
            ? buildIntroMarkup()
            : buildSelectionMarkup({
                activeCategory,
                categoryStates,
                patientLabel,
            });

        if (scene === "intro") {
            root.querySelector("#hub-start-button")?.addEventListener("click", async () => {
                scene = "selection";
                render();
                await ensureCategoryLoaded(activeCategory);
            });

            return;
        }

        root.querySelector("#hub-back-button")?.addEventListener("click", () => {
            scene = "intro";
            render();
        });

        root.querySelectorAll("[data-category-id]").forEach((button) => {
            button.addEventListener("click", async () => {
                activeCategory = button.getAttribute("data-category-id") || activeCategory;
                render();
                await ensureCategoryLoaded(activeCategory);
            });
        });

        root.querySelector("#hub-load-more-button")?.addEventListener("click", async () => {
            await loadCategoryPage(activeCategory, true);
        });

        root.querySelectorAll("[data-game-gid]").forEach((button) => {
            button.addEventListener("click", async () => {
                const gid = String(button.getAttribute("data-game-gid") || "").trim();
                const selectedGame = categoryStates[activeCategory].items.find((game) => game.gid === gid);

                if (!selectedGame) {
                    return;
                }

                sessionStorage.setItem("selected_game_gid", selectedGame.gid);
                sessionStorage.setItem("selected_game_name", selectedGame.name);
                sessionStorage.setItem("selected_game_group", selectedGame.mci_group);
                await onLaunchGame(selectedGame);
            });
        });
    };

    const applyFallbackData = (categoryId) => {
        const fallbackItems = (FALLBACK_GAMES[categoryId] || []).map((item, index) =>
            normalizeGame(item, index, categoryId),
        );
        const state = categoryStates[categoryId];

        state.items = fallbackItems;
        state.total = fallbackItems.length;
        state.nextOffset = fallbackItems.length;
        state.hasMore = false;
        state.initialized = true;
        state.loading = false;
        state.error = "";
        state.usedFallback = fallbackItems.length > 0;
    };

    const loadCategoryPage = async (categoryId, append = false) => {
        const state = categoryStates[categoryId];
        if (state.loading) {
            return;
        }

        state.loading = true;
        state.error = "";
        render();

        try {
            if (typeof loadGamesByCategory !== "function") {
                applyFallbackData(categoryId);
                render();
                return;
            }

            const result = await loadGamesByCategory(categoryId, {
                offset: append ? state.nextOffset : 0,
                pageSize: PAGE_SIZE,
            });
            const items = (result?.items || []).map((item, index) =>
                normalizeGame(item, index + (append ? state.nextOffset : 0), categoryId),
            );

            state.items = append ? [...state.items, ...items] : items;
            state.total = Number.isFinite(result?.total) ? Number(result.total) : state.items.length;
            state.nextOffset = Number(result?.nextOffset) || state.items.length;
            state.hasMore = Boolean(result?.hasMore);
            state.initialized = true;
            state.loading = false;
            state.error = "";
            state.usedFallback = false;
        } catch (error) {
            console.warn(`Unable to load games for ${categoryId}:`, error);

            if (!state.initialized) {
                applyFallbackData(categoryId);
            } else {
                state.loading = false;
                state.error = error?.message || "Unable to load games";
            }
        }

        render();
    };

    const ensureCategoryLoaded = async (categoryId) => {
        const state = categoryStates[categoryId];
        if (state.initialized || state.loading) {
            return;
        }

        await loadCategoryPage(categoryId, false);
    };

    render();
}
