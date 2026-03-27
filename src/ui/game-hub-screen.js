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

const MOCK_GAMES = [
    { gid: "MEM001", name: "Postcard Reader", mci_group: "Memory", status: "coming_soon" },
    { gid: "VIS001", name: "Symmetry Decor", mci_group: "Visuospatial", status: "coming_soon" },
    { gid: "ATTN001", name: "Sorting Line", mci_group: "Attention", status: "playable" },
    { gid: "LANG001", name: "Context Clues", mci_group: "Language", status: "coming_soon" },
    { gid: "EXEC001", name: "Zoo Detective", mci_group: "Executive", status: "coming_soon" },
];

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function normalizeGames(gameList = []) {
    return gameList
        .map((item, index) => {
            const groupId = String(item?.mci_group || "").trim();
            if (!CATEGORY_META[groupId]) {
                return null;
            }

            return {
                id: item?.id ?? `${groupId}-${index}`,
                gid: String(item?.gid || `${groupId}-${index}`).trim(),
                name: String(item?.name || "Untitled Game").trim(),
                mci_group: groupId,
                status: item?.status === "playable" ? "playable" : "coming_soon",
            };
        })
        .filter(Boolean);
}

async function resolveHubGames(loadGames) {
    if (typeof loadGames !== "function") {
        return normalizeGames(MOCK_GAMES);
    }

    try {
        const loadedGames = await loadGames();
        const normalized = normalizeGames(loadedGames);
        return normalized.length ? normalized : normalizeGames(MOCK_GAMES);
    } catch (error) {
        console.warn("Falling back to mock hub data:", error);
        return normalizeGames(MOCK_GAMES);
    }
}

function groupGamesByCategory(gameList) {
    return CATEGORY_ORDER.reduce((accumulator, categoryId) => {
        accumulator[categoryId] = gameList.filter((game) => game.mci_group === categoryId);
        return accumulator;
    }, {});
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

function getSummaryText(games) {
    if (!games.length) {
        return "ยังไม่มีเกม";
    }

    const playableCount = games.filter((game) => game.status === "playable").length;
    return playableCount
        ? `${games.length} เกม พร้อมเล่น ${playableCount} เกม`
        : `${games.length} เกม รอเปิดใช้งาน`;
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

function buildCategoryButton(category, games, isActive) {
    return `
        <button
            type="button"
            class="hub-category-chip${isActive ? " is-active" : ""}"
            data-category-id="${category.id}"
        >
            <span class="hub-category-chip__name">${escapeHtml(category.nameTh)}</span>
            <span class="hub-category-chip__en">${escapeHtml(category.nameEn)}</span>
            <span class="hub-category-chip__meta">${escapeHtml(getSummaryText(games))}</span>
        </button>
    `;
}

function buildGameCard(game, category) {
    const playable = game.status === "playable";

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
                    <span class="hub-status-chip ${playable ? "hub-status-chip--playable" : ""}">
                        ${playable ? "พร้อมเล่น" : "เร็ว ๆ นี้"}
                    </span>
                    <md-filled-icon-button
                        aria-label="${playable ? `เล่น ${escapeHtml(game.name)}` : `${escapeHtml(game.name)} ยังไม่เปิดใช้งาน`}"
                        data-game-gid="${escapeHtml(game.gid)}"
                        ${playable ? "" : "disabled"}
                    >
                        <span class="material-symbols-rounded">play_arrow</span>
                    </md-filled-icon-button>
                </div>
            </div>
        </article>
    `;
}

function buildSelectionMarkup({ activeCategory, gamesByCategory, patientLabel }) {
    const currentCategory = CATEGORY_META[activeCategory];
    const currentGames = gamesByCategory[activeCategory] || [];

    const categoriesHtml = CATEGORY_ORDER.map((categoryId) =>
        buildCategoryButton(
            CATEGORY_META[categoryId],
            gamesByCategory[categoryId] || [],
            categoryId === activeCategory,
        ),
    ).join("");

    const gamesHtml = currentGames.length
        ? currentGames.map((game) => buildGameCard(game, currentCategory)).join("")
        : `
            <div class="hub-empty-state">
                <span class="material-symbols-rounded">construction</span>
                <h3>ยังไม่มีเกมในหมวดนี้</h3>
                <p>เมื่อเชื่อมกับฐานข้อมูลแล้ว รายการเกมของหมวดนี้จะแสดงที่นี่</p>
            </div>
        `;

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
                        <div class="hub-category-rail" id="hub-category-rail">
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
        loadGames,
        onLaunchGame = () => {},
    } = options;

    const games = await resolveHubGames(loadGames);
    const gamesByCategory = groupGamesByCategory(games);
    const patientLabel = getPatientLabel();
    let scene = "intro";
    let activeCategory = CATEGORY_ORDER.find((categoryId) => (gamesByCategory[categoryId] || []).length) || CATEGORY_ORDER[0];

    const render = () => {
        root.innerHTML = scene === "intro"
            ? buildIntroMarkup()
            : buildSelectionMarkup({
                activeCategory,
                gamesByCategory,
                patientLabel,
            });

        if (scene === "intro") {
            root.querySelector("#hub-start-button")?.addEventListener("click", () => {
                scene = "selection";
                render();
            });

            return;
        }

        root.querySelector("#hub-back-button")?.addEventListener("click", () => {
            scene = "intro";
            render();
        });

        root.querySelectorAll("[data-category-id]").forEach((button) => {
            button.addEventListener("click", () => {
                activeCategory = button.getAttribute("data-category-id") || activeCategory;
                render();
            });
        });

        root.querySelectorAll("[data-game-gid]").forEach((button) => {
            button.addEventListener("click", async () => {
                const gid = String(button.getAttribute("data-game-gid") || "").trim();
                const selectedGame = games.find((game) => game.gid === gid);

                if (!selectedGame || selectedGame.status !== "playable") {
                    return;
                }

                sessionStorage.setItem("selected_game_gid", selectedGame.gid);
                sessionStorage.setItem("selected_game_name", selectedGame.name);
                sessionStorage.setItem("selected_game_group", selectedGame.mci_group);
                await onLaunchGame(selectedGame);
            });
        });
    };

    render();
}
