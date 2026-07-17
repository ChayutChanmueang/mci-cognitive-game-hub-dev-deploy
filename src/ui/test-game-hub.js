import { VideoPlayer } from "../util/video-player/index.js";

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
    // US-E7-24: Physical group for the Fry Food (movement/accelerometer) game.
    Physical: {
        id: "Physical",
        nameTh: "กายภาพ",
        nameEn: "Physical",
        icon: "directions_run",
        tone: "sky",
        description: "ฝึกการเคลื่อนไหวและการควบคุมร่างกายผ่านการขยับ/เอียงอุปกรณ์ให้สัมพันธ์กับเกม",
    },
});

const CATEGORY_ORDER = ["Memory", "Visuospatial", "Attention", "Language", "Executive", "Physical"];
const PAGE_SIZE = 10;
const MINIO_VIDEO_BASE_URL = "https://minio-api-v4.kohtnas.com/mci-video-bucket";
const TEST_GAME_HUB_STYLESHEET_ID = "test-game-hub-style";
const TEST_GAME_HUB_STYLESHEET_HREF = "/test-game-hub-style.css";
const LEVEL_OPTIONS = Object.freeze([
    {
        value: 3,
        label: "ยาก",
        icon: "local_fire_department",
        description: "ระดับท้าทาย",
    },
    {
        value: 2,
        label: "กลาง",
        icon: "adjust",
        description: "ระดับสมดุล",
    },
    {
        value: 1,
        label: "ง่าย",
        icon: "spa",
        description: "ระดับเริ่มต้น",
    },
]);

function ensureTestGameHubStylesheet() {
    if (typeof document === "undefined") {
        return;
    }

    const existingLink = document.getElementById(TEST_GAME_HUB_STYLESHEET_ID);
    if (existingLink) {
        return;
    }

    const link = document.createElement("link");
    link.id = TEST_GAME_HUB_STYLESHEET_ID;
    link.rel = "stylesheet";
    link.href = TEST_GAME_HUB_STYLESHEET_HREF;
    document.head.appendChild(link);
}

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
    };
}

function createCategoryStates() {
    return CATEGORY_ORDER.reduce((accumulator, categoryId) => {
        accumulator[categoryId] = createCategoryState();
        return accumulator;
    }, {});
}

export function createTestGameHubState() {
    return {
        categoryStates: createCategoryStates(),
    };
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

    return "แตะเพื่อดูรายการเกม";
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
                        พร้อมทดสอบ
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
            <p>ตรวจสอบการเชื่อมต่อฐานข้อมูล แล้วลองเลือกหมวดนี้อีกครั้ง</p>
        </div>
    `;
}

function buildEmptyMarkup() {
    return `
        <div class="hub-empty-state">
            <span class="material-symbols-rounded">upcoming</span>
            <h3>ไม่พบเกมในหมวดนี้</h3>
            <p>หมวดนี้ยังไม่มีข้อมูลเกมในฐานข้อมูลตอนนี้</p>
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

function buildLevelDialogMarkup(game) {
    const levelOptionsHtml = LEVEL_OPTIONS.map((level) => `
        <button class="hub-level-option" type="button" data-level-value="${level.value}">
            <span class="material-symbols-rounded">${level.icon}</span>
            <span class="hub-level-option__copy">
                <strong>${escapeHtml(level.label)}</strong>
                <span>${escapeHtml(level.description)}</span>
            </span>
        </button>
    `).join("");

    return `
        <div class="hub-level-dialog" role="presentation">
            <button class="hub-level-dialog__backdrop" type="button" data-level-cancel aria-label="ปิด"></button>
            <section class="hub-level-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="hub-level-dialog-title">
                <div class="hub-level-dialog__header">
                    <div>
                        <p>เลือก Level</p>
                        <h2 id="hub-level-dialog-title">${escapeHtml(game.name)}</h2>
                    </div>
                    <md-outlined-icon-button data-level-cancel aria-label="ปิด">
                        <span class="material-symbols-rounded">close</span>
                    </md-outlined-icon-button>
                </div>
                <div class="hub-level-options">
                    ${levelOptionsHtml}
                </div>
            </section>
        </div>
    `;
}

// ---------------------------------------------------------------------------
// Video Popup — popup wrapper lives here; player UI comes from VideoPlayer util
// See: src/util/video-player/VideoPlayer.js
// ---------------------------------------------------------------------------

function getMinioVideoUrl(videoNumber) {
    const paddedVideoNumber = String(videoNumber).padStart(2, "0");

    //Test *******************************************************
    /*const videoURL = [];
    videoURL.push("https://rr1---sn-0opoxuui5pa5oq-c336.googlevideo.com/videoplayback?expire=1779788522&ei=ihYVauWdB4HCssUP5sSHsQo&ip=192.203.247.10&id=o-ANAczfUsiKeTPxCQioR_KzDiGGQGutVPtiltiOhT1PsG&itag=136&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=300&met=1779766922%2C&mh=Pl&mm=31%2C29&mn=sn-0opoxuui5pa5oq-c336%2Csn-uvu-c33lk&ms=au%2Crdu&mv=m&mvi=1&pl=24&rms=au%2Cau&initcwndbps=3060000&bui=AbKmrwozwirnpUVpG6YW8EzNjo3GprhBvVExEb8zmu5Ath5NKj80_-X8M5QH6DKX-Dv0td_Q6fgjOsZY&spc=96Xrvxa5rkzZFJ2M5BaZXl0BVnDTXAvFN1KuzuZ7tqyr&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=5798684&dur=35.624&lmt=1779766901178534&mt=1779766386&fvip=3&keepalive=yes&fexp=51565115%2C51565682&c=ANDROID_VR&txp=630A224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AHEqNM4wRQIgJSTnQzCI5FxG7sX5FP0gmeD5-OHC28zX9x0A0ad72-sCIQDahgdFYCexBbj0lh5rt5tz-may2BKeqwKobkfk8eBa9Q%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRAIgdMzYmI3hRP8r-C9iCfKTuSU6zDGaPj_OS6gx8CL9y84CIBTrf8n6DB1aaoiF3PLIydY25gdbwpP2rw31ZesBss4k&cpn=2Hey-OCUjZ7v5SG5")
    videoURL.push("https://rr5---sn-npoe7ndk.c.youtube.com/videoplayback?expire=1779788330&ei=yhUVaoWIKsS09fwP782tuAM&ip=192.203.247.10&cp=X19WamZ5dmQtOU1EU05WTUg6dlVXTmd1Y3NxdFUyYk05X0c5TWJ6cUc2eWJuRG15QWJwekhnVkxkcjJGdA&id=o-AOZqdE9q0brl2BwQDDuku2Ck3VNW8nGoKkdk3B9ZKk7H&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1779766730%2C&mh=Kb&mm=32%2C26&mn=sn-npoe7ndk%2Csn-30a7yner&ms=su%2Conr&mv=m&mvi=5&pl=24&rms=su%2Csu&sc=yes&ctier=A&pfa=5&gcr=th&initcwndbps=375000&hightc=yes&siu=1&bui=AbKmrwpIgx5siRKFh1m6rvnrTRGWpxgn20g_W1dLa7x_3g79uWDYbCdWyilSxIjA33SqSTuqLg&spc=96Xrv-II-SvVkh1VGkH7UUaRnsUmK65FXTOOZliMl1vk8x_ME8L1P5c&vprv=1&svpuc=1&mime=video%2Fmp4&ns=EKJ6506nfGsivgKxzFyQq9EV&rqh=1&gir=yes&clen=4952457&ratebypass=yes&dur=71.842&lmt=1779766570605605&mt=1779766369&fvip=5&fexp=51565116%2C51565682&c=WEB&sefc=1&txp=6300224&n=QcKe2mNaGTLE3g&sparams=expire%2Cei%2Cip%2Ccp%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cctier%2Cpfa%2Cgcr%2Chightc%2Csiu%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Csc%2Cinitcwndbps&lsig=APaTxxMwRQIhAOW1AuIXCuI7fXuFm4xqNPm_eDavlsgt_evss_lorZMyAiAjp_9zvesiiu3w3EE6B2jJEhkxERlO9FjLf1MGRPBj6g%3D%3D&sig=AHEqNM4wRQIhAKwQqAUdHH7GSE_wefFSP4prOcZgu9ge4I_2NNqZOZJnAiBSQ-wW9FAZ2JHZJyIjlHeoY5e_GvzzXIQSojr_f_gyQA%3D%3D&cver=2.20260206.01.00&cpn=s_8l5DK7z4CzWxcn");
*/
    return `${MINIO_VIDEO_BASE_URL}/mci-test-${paddedVideoNumber}.mp4`;
    //return videoURL[videoNumber];
}

function buildVideoPickerDialogMarkup(context) {
    return `
        <div class="hub-video-picker" role="presentation">
            <button class="hub-video-picker__backdrop" type="button" data-video-picker-cancel aria-label="ปิด"></button>
            <section class="hub-video-picker__panel" role="dialog" aria-modal="true" aria-labelledby="hub-video-picker-title">
                <div class="hub-video-picker__header">
                    <div>
                        <p>เลือกวิดีโอ</p>
                        <h2 id="hub-video-picker-title">${escapeHtml(context.name)}</h2>
                    </div>
                    <md-outlined-icon-button data-video-picker-cancel aria-label="ปิด">
                        <span class="material-symbols-rounded">close</span>
                    </md-outlined-icon-button>
                </div>
                <form class="hub-video-picker__form" data-video-picker-form>
                    <md-outlined-text-field
                        class="hub-video-picker__field"
                        label="หมายเลขวิดีโอ"
                        type="number"
                        inputmode="numeric"
                        min="0"
                        step="1"
                        value="4"
                        data-video-number-input
                    ></md-outlined-text-field>
                    <div class="hub-video-picker__actions">
                        <md-outlined-button type="button" data-video-picker-cancel>ยกเลิก</md-outlined-button>
                        <md-filled-button type="submit">
                            <span slot="icon" class="material-symbols-rounded">smart_display</span>
                            เปิดวิดีโอ
                        </md-filled-button>
                    </div>
                </form>
            </section>
        </div>
    `;
}

function promptVideoNumber(root, context) {
    return new Promise((resolve) => {
        const dialogContainer = document.createElement("div");
        dialogContainer.innerHTML = buildVideoPickerDialogMarkup(context);
        const dialog = dialogContainer.firstElementChild;

        if (!dialog) {
            resolve(null);
            return;
        }

        const cleanup = (videoNumber = null) => {
            document.removeEventListener("keydown", handleKeyDown);
            dialog.remove();
            resolve(videoNumber);
        };

        const numberInput = dialog.querySelector("[data-video-number-input]");
        const form = dialog.querySelector("[data-video-picker-form]");

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                cleanup(null);
            }
        };

        numberInput?.addEventListener("input", () => {
            numberInput.value = String(numberInput.value || "").replace(/\D/g, "");
        });

        form?.addEventListener("submit", (event) => {
            event.preventDefault();
            const rawVideoNumber = String(numberInput?.value || "").replace(/\D/g, "");
            if (!rawVideoNumber) {
                numberInput?.focus();
                return;
            }

            const videoNumber = Number(rawVideoNumber);
            cleanup(Number.isInteger(videoNumber) && videoNumber >= 0 ? videoNumber : null);
        });

        dialog.querySelectorAll("[data-video-picker-cancel]").forEach((button) => {
            button.addEventListener("click", () => cleanup(null));
        });

        document.addEventListener("keydown", handleKeyDown);
        (root.querySelector(".test-game-hub") ?? root).append(dialog);
        numberInput?.focus();
    });
}

/**
 * Show a video popup for the given game.
 * The popup (backdrop, panel, header, close) is owned by this module.
 * The player controls (play/pause/replay/progress) are handled by VideoPlayer.
 *
 * @param {HTMLElement} root
 * @param {{ name: string }} game
 * @param {number} videoNumber
 * @returns {Promise<void>}
 */
function showVideoPopup(root, game, videoNumber) {
    return new Promise((resolve) => {
        const paddedVideoNumber = String(videoNumber).padStart(2, "0");
        const videoUrl = getMinioVideoUrl(videoNumber);

        // ── Build popup shell ─────────────────────────────────────────────────
        const wrapper = document.createElement("div");
        wrapper.innerHTML = /* html */ `
            <div class="hub-video-popup" role="presentation">
                <button class="hub-video-popup__backdrop" type="button" data-vp-close aria-label="ปิด"></button>
                <section class="hub-video-popup__panel" role="dialog" aria-modal="true" aria-labelledby="hub-vp-title">
                    <div class="hub-video-popup__header">
                        <div class="hub-video-popup__title-group">
                            <span class="material-symbols-rounded hub-video-popup__icon">smart_display</span>
                            <div>
                                <p class="hub-video-popup__label">วิดีโอตัวอย่าง ${paddedVideoNumber}</p>
                                <h2 id="hub-vp-title" class="hub-video-popup__title">${escapeHtml(game.name)}</h2>
                            </div>
                        </div>
                        <md-outlined-icon-button data-vp-close aria-label="ปิด" type="button">
                            <span class="material-symbols-rounded">close</span>
                        </md-outlined-icon-button>
                    </div>
                    <!-- Player slot: VideoPlayer mounts here -->
                    <div class="hub-video-popup__player-slot"></div>
                </section>
            </div>
        `;
        const popup      = wrapper.firstElementChild;
        const playerSlot = popup.querySelector(".hub-video-popup__player-slot");

        // ── Mount VideoPlayer into the slot ───────────────────────────────────
        const player = VideoPlayer.mount(playerSlot, {
            src:   videoUrl,
            label: `วิดีโอตัวอย่าง ${paddedVideoNumber} เกม ${game.name}`,
        });

        // ── Cleanup ───────────────────────────────────────────────────────────
        const cleanup = () => {
            document.removeEventListener("keydown", handleKeyDown);
            player.destroy();
            popup.remove();
            resolve();
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") cleanup();
        };

        popup.querySelectorAll("[data-vp-close]").forEach((btn) => {
            btn.addEventListener("click", cleanup);
        });

        document.addEventListener("keydown", handleKeyDown);
        (root.querySelector(".test-game-hub") ?? root).append(popup);

        // Animate in
        requestAnimationFrame(() => popup.classList.add("is-open"));
    });
}



// ---------------------------------------------------------------------------
// Level Prompt
// ---------------------------------------------------------------------------

function promptGameLevel(root, game) {
    return new Promise((resolve) => {
        const dialogContainer = document.createElement("div");
        dialogContainer.innerHTML = buildLevelDialogMarkup(game);
        const dialog = dialogContainer.firstElementChild;

        if (!dialog) {
            resolve(null);
            return;
        }

        const cleanup = (levelValue = null) => {
            document.removeEventListener("keydown", handleKeyDown);
            dialog.remove();
            resolve(levelValue);
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                cleanup(null);
            }
        };

        dialog.querySelectorAll("[data-level-value]").forEach((button) => {
            button.addEventListener("click", () => {
                const levelValue = Number(button.getAttribute("data-level-value"));
                cleanup(Number.isFinite(levelValue) ? levelValue : null);
            });
        });

        dialog.querySelectorAll("[data-level-cancel]").forEach((button) => {
            button.addEventListener("click", () => cleanup(null));
        });

        document.addEventListener("keydown", handleKeyDown);
        (root.querySelector(".test-game-hub") || root).append(dialog);
        dialog.querySelector("[data-level-value]")?.focus();
    });
}

function buildSelectionMarkup({ activeCategory, categoryStates }) {
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
        <section class="test-game-hub hub-screen hub-screen--selection">
            <div class="hub-shell">
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
            <md-fab class="hub-video-fab" label="วิดีโอ" variant="primary" aria-label="ดูวิดีโอตัวอย่าง" data-video-picker-trigger>
                <md-icon class="material-symbols-rounded" slot="icon">smart_display</md-icon>
            </md-fab>
        </section>
    `;
}

export async function renderTestGameHubScreen(root, options = {}) {
    if (!root) {
        return;
    }

    ensureTestGameHubStylesheet();

    const {
        loadGamesByCategory,
        initialCategory = "Attention",
        onLaunchGame = () => {},
        onStateChange = () => {},
        sharedState = null,
    } = options;

    const categoryStates = sharedState?.categoryStates || createCategoryStates();

    if (sharedState && !sharedState.categoryStates) {
        sharedState.categoryStates = categoryStates;
    }

    const categoryRailScroll = sharedState?.categoryRailScroll || { left: 0, top: 0 };

    if (sharedState && !sharedState.categoryRailScroll) {
        sharedState.categoryRailScroll = categoryRailScroll;
    }

    const scene = "selection";
    let activeCategory = CATEGORY_META[initialCategory] ? initialCategory : "Attention";

    const captureCategoryRailScroll = () => {
        const categoryRail = root.querySelector(".hub-category-rail");
        if (!categoryRail) {
            return;
        }

        categoryRailScroll.left = categoryRail.scrollLeft;
        categoryRailScroll.top = categoryRail.scrollTop;
    };

    const restoreCategoryRailScroll = () => {
        const categoryRail = root.querySelector(".hub-category-rail");
        if (!categoryRail) {
            return;
        }

        categoryRail.scrollLeft = categoryRailScroll.left;
        categoryRail.scrollTop = categoryRailScroll.top;
        categoryRail.addEventListener("scroll", captureCategoryRailScroll, { passive: true });
    };

    const render = () => {
        captureCategoryRailScroll();

        root.innerHTML = buildSelectionMarkup({
            activeCategory,
            categoryStates,
        });

        restoreCategoryRailScroll();

        root.querySelectorAll("[data-category-id]").forEach((button) => {
            button.addEventListener("click", async () => {
                activeCategory = button.getAttribute("data-category-id") || activeCategory;
                render();
                onStateChange({ scene, activeCategory });
                await ensureCategoryLoaded(activeCategory);
            });
        });

        root.querySelector("#hub-load-more-button")?.addEventListener("click", async () => {
            await loadCategoryPage(activeCategory, true);
        });

        root.querySelector("[data-video-picker-trigger]")?.addEventListener("click", async () => {
            const activeCategoryMeta = CATEGORY_META[activeCategory] || CATEGORY_META.Attention;
            const videoContext = {
                name: `วิดีโอหมวด${activeCategoryMeta.nameTh}`,
            };
            const selectedVideoNumber = await promptVideoNumber(root, videoContext);
            if (selectedVideoNumber == null) {
                return;
            }

            await showVideoPopup(root, videoContext, selectedVideoNumber);
        });

        root.querySelectorAll("[data-game-gid]").forEach((button) => {
            button.addEventListener("click", async () => {
                const gid = String(button.getAttribute("data-game-gid") || "").trim();
                const selectedGame = categoryStates[activeCategory].items.find((game) => game.gid === gid);

                if (!selectedGame) {
                    return;
                }

                try {
                    const selectedLevel = await promptGameLevel(root, selectedGame);
                    if (!selectedLevel) {
                        return;
                    }

                    await onLaunchGame({
                        ...selectedGame,
                        level: selectedLevel,
                    });
                } catch (error) {
                    console.error("Unable to launch selected game:", error);
                }
            });
        });
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
                throw new Error("Missing loadGamesByCategory");
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
        } catch (error) {
            console.warn(`Unable to load games for ${categoryId}:`, error);
            state.loading = false;
            state.initialized = true;
            state.error = error?.message || "Unable to load games";
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

    if (scene === "selection") {
        await ensureCategoryLoaded(activeCategory);
    }
}
