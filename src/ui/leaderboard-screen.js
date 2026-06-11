import { bindCurrentNodeScrollController } from "../util/current-node-scroll-controller.js";

const MOCK_LEADERBOARD_PLAYERS = Object.freeze([
    { rank: 1, name: "สมชาย ใจดี", score: 1500 },
    { rank: 2, name: "สมพร สดใส", score: 1480 },
    { rank: 3, name: "สมศรี ตั้งใจ", score: 1455 },
    { rank: 4, name: "วิชัย ใจเย็น", score: 1420 },
    { rank: 5, name: "มานี แข็งแรง", score: 1395 },
    { rank: 6, name: "ปิติ รอบคอบ", score: 1370 },
    { rank: 7, name: "ชูใจ ยิ้มง่าย", score: 1345 },
    { rank: 8, name: "นิภา ตั้งมั่น", score: 1310 },
    { rank: 9, name: "อนันต์ สุขใจ", score: 1295 },
    { rank: 10, name: "ดวงใจ พัฒนา", score: 1270 },
    { rank: 11, name: "กมล ใจดี", score: 1240 },
    { rank: 12, name: "วารี สดชื่น", score: 1215 },
    { rank: 13, name: "ธนา เรียนรู้", score: 1190 },
    { rank: 14, name: "ศิริ ตั้งใจ", score: 1165 },
    { rank: 15, name: "นภา อดทน", score: 1130 },
    { rank: 16, name: "อารีย์ สุขุม", score: 1105 },
    { rank: 17, name: "สมชาย ใจดี", score: 1500, current: true },
    { rank: 18, name: "ปกรณ์ ใจเย็น", score: 1030 },
    { rank: 19, name: "ลัดดา พากเพียร", score: 1005 },
    { rank: 20, name: "ภาคิน ฝึกฝน", score: 980 },
]);

const DEFAULT_PAGE_SIZE = 20;

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatScore(value) {
    return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function renderRankBadge(player) {
    if (player.rank > 3) {
        return `<span class="leaderboard-rank-number">${escapeHtml(player.rank)}</span>`;
    }

    return `
        <span class="leaderboard-medal leaderboard-medal--${escapeHtml(player.rank)}" aria-label="อันดับ ${escapeHtml(player.rank)}">
            <span>${escapeHtml(player.rank)}</span>
        </span>
    `;
}

function renderLeaderboardRow(player) {
    const classes = ["leaderboard-row", player.current ? "is-current" : ""]
        .filter(Boolean)
        .join(" ");

    return `
        <article class="${classes}" data-leaderboard-row data-rank="${escapeHtml(player.rank)}">
            <div class="leaderboard-rank">${renderRankBadge(player)}</div>
            <div class="leaderboard-player-name">${escapeHtml(player.name)}</div>
            <div class="leaderboard-score">${escapeHtml(formatScore(player.score))}</div>
        </article>
    `;
}

function createDefaultLoadPlayers(staticPlayers) {
    const sorted = [...staticPlayers].sort((a, b) => Number(a.rank) - Number(b.rank));
    return ({ offset, limit }) => Promise.resolve({
        players: sorted.slice(offset, offset + limit),
        hasMore: offset + limit < sorted.length,
        total: sorted.length,
    });
}

export async function renderLeaderboardScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        loadPlayers: loadPlayersFn,
        getUserRank: getUserRankFn,
        players: staticPlayers,
        patientLabel = "ผู้เล่น",
        onBack = () => {},
        pageSize = DEFAULT_PAGE_SIZE,
    } = options;

    const loadPlayers = loadPlayersFn
        || createDefaultLoadPlayers(staticPlayers || MOCK_LEADERBOARD_PLAYERS);

    const state = {
        scrollTop: 0,
        players: [],
        topOffset: 0,
        bottomOffset: 0,
        hasMoreTop: false,
        hasMoreBottom: true,
        loadingTop: false,
        loadingBottom: false,
        total: null,
    };

    let activeCleanup = [];
    let topObserver = null;
    let bottomObserver = null;

    const cleanup = () => {
        activeCleanup.forEach((handler) => handler());
        activeCleanup = [];
        if (topObserver) { topObserver.disconnect(); topObserver = null; }
        if (bottomObserver) { bottomObserver.disconnect(); bottomObserver = null; }
    };

    const on = (target, eventName, handler, listenerOptions) => {
        if (!target) return;
        target.addEventListener(eventName, handler, listenerOptions);
        activeCleanup.push(() => target.removeEventListener(eventName, handler, listenerOptions));
    };

    cleanup();
    root.innerHTML = `
        <section class="hub-clean-screen leaderboard-screen" aria-labelledby="leaderboard-title">
            <div class="hub-clean-shell leaderboard-shell">
                <header class="hub-clean-topbar leaderboard-topbar">
                    <div class="hub-clean-profile leaderboard-back" role="button" tabindex="0" aria-label="กลับไปหน้าเกม">
                        <md-filled-tonal-icon-button aria-label="กลับไปหน้าเกม">
                            <md-icon class="material-symbols-rounded">arrow_back</md-icon>
                        </md-filled-tonal-icon-button>
                        <strong>กลับ</strong>
                    </div>
                    <div class="hub-clean-goal">
                        <p class="hub-clean-eyebrow">${escapeHtml(patientLabel)}</p>
                        <h1 id="leaderboard-title">ชุมชนพัฒนาสมอง</h1>
                        <p>อันดับคะแนนรวมของผู้เล่นทั้งหมด</p>
                    </div>
                </header>
                <section class="hub-clean-stage leaderboard-stage">
                    <div class="hub-clean-scroll leaderboard-scroll" data-leaderboard-scroll>
                        <div class="hub-clean-content leaderboard-content" data-leaderboard-section>
                            <div class="leaderboard-table-head" aria-hidden="true">
                                <span>อันดับ</span>
                                <span>ชื่อ</span>
                                <span>คะแนน</span>
                            </div>
                            <div class="hub-clean-empty" data-leaderboard-load-top style="display: none;" aria-live="polite">
                                <md-circular-progress indeterminate aria-label="กำลังโหลดเพิ่มเติม"></md-circular-progress>
                            </div>
                            <div class="leaderboard-list" data-leaderboard-list></div>
                            <div class="hub-clean-empty" data-leaderboard-load-more style="display: none;" aria-live="polite">
                                <md-circular-progress indeterminate aria-label="กำลังโหลดเพิ่มเติม"></md-circular-progress>
                            </div>
                            <div class="hub-clean-empty" data-leaderboard-initial-loading>
                                <md-circular-progress indeterminate aria-label="กำลังโหลดคะแนน"></md-circular-progress>
                                <p>กำลังโหลดคะแนน</p>
                            </div>
                            <div data-scroll-sentinel-bottom style="height: 1px;"></div>
                        </div>
                    </div>
                    <md-fab class="hub-clean-fab leaderboard-fab" aria-label="เลื่อนไปยังด้านบน" data-scroll-top>
                        <md-icon class="material-symbols-rounded" slot="icon">arrow_upward</md-icon>
                    </md-fab>
                </section>
                <aside class="leaderboard-bottom-bar" aria-label="อันดับของผู้เล่นคนนี้" data-leaderboard-bottom-bar style="display: none;"></aside>
            </div>
        </section>
    `;

    const controller = bindCurrentNodeScrollController({
        root,
        state,
        activeSectionSelector: "[data-leaderboard-section]",
        scrollAreaSelector: "[data-leaderboard-scroll]",
        currentNodeSelector: ".leaderboard-row.is-current",
        completedNodeSelector: ".leaderboard-row",
        fallbackNodeSelector: ".leaderboard-row",
        offsetElementSelector: ".leaderboard-topbar",
        scrollButtonTarget: "top",
        on,
    });

    on(root.querySelector(".leaderboard-back"), "click", () => onBack());
    on(root.querySelector(".leaderboard-back"), "keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onBack();
    });

    const getListEl = () => root.querySelector("[data-leaderboard-list]");
    const getScrollAreaEl = () => root.querySelector("[data-leaderboard-scroll]");

    const updateBottomBar = (externalPlayer = null) => {
        const currentPlayer = state.players.find((p) => p.current) ?? externalPlayer;
        const bottomBarEl = root.querySelector("[data-leaderboard-bottom-bar]");
        if (!bottomBarEl || !currentPlayer?.rank) return;
        bottomBarEl.innerHTML = renderLeaderboardRow({ ...currentPlayer, current: false });
        bottomBarEl.style.display = "";
    };

    const appendRows = (newPlayers) => {
        const listEl = getListEl();
        if (!listEl) return;
        const fragment = document.createDocumentFragment();
        newPlayers.forEach((player) => {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = renderLeaderboardRow(player);
            const el = wrapper.firstElementChild;
            if (el) fragment.appendChild(el);
        });
        listEl.appendChild(fragment);
    };

    const prependRows = (newPlayers) => {
        const listEl = getListEl();
        const scrollAreaEl = getScrollAreaEl();
        if (!listEl || !scrollAreaEl) return;
        const fragment = document.createDocumentFragment();
        newPlayers.forEach((player) => {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = renderLeaderboardRow(player);
            const el = wrapper.firstElementChild;
            if (el) fragment.appendChild(el);
        });
        const prevHeight = scrollAreaEl.scrollHeight;
        listEl.prepend(fragment);
        scrollAreaEl.scrollTop += scrollAreaEl.scrollHeight - prevHeight;
    };

    const setLoadingBottom = (show) => {
        const el = root.querySelector("[data-leaderboard-load-more]");
        if (el) el.style.display = show ? "" : "none";
    };

    const setLoadingTop = (show) => {
        const el = root.querySelector("[data-leaderboard-load-top]");
        if (el) el.style.display = show ? "" : "none";
    };

    const loadPrevPage = async () => {
        if (state.loadingTop || !state.hasMoreTop) return;
        state.loadingTop = true;
        setLoadingTop(true);
        try {
            const newOffset = Math.max(0, state.topOffset - pageSize);
            const result = await loadPlayers({ offset: newOffset, limit: pageSize });
            const newPlayers = Array.isArray(result?.players) ? result.players : [];
            state.topOffset = newOffset;
            state.hasMoreTop = newOffset > 0;
            state.players = [...newPlayers, ...state.players];
            if (result?.total != null) state.total = result.total;
            prependRows(newPlayers);
            if (!state.hasMoreTop) {
                topObserver?.disconnect();
                topObserver = null;
                root.querySelector("[data-scroll-sentinel-top]")?.remove();
            }
        } catch (error) {
            console.warn("Unable to load prev leaderboard page:", error);
        } finally {
            state.loadingTop = false;
            setLoadingTop(false);
        }
    };

    const loadNextPage = async () => {
        if (state.loadingBottom || !state.hasMoreBottom) return;
        state.loadingBottom = true;
        setLoadingBottom(true);
        try {
            const result = await loadPlayers({ offset: state.bottomOffset, limit: pageSize });
            const newPlayers = Array.isArray(result?.players) ? result.players : [];
            const isFirstLoad = state.players.length === 0;
            state.players = [...state.players, ...newPlayers];
            state.bottomOffset += newPlayers.length;
            state.hasMoreBottom = result?.hasMore ?? (newPlayers.length >= pageSize);
            if (result?.total != null) state.total = result.total;
            if (isFirstLoad) {
                root.querySelector("[data-leaderboard-initial-loading]")?.remove();
            }
            appendRows(newPlayers);
            updateBottomBar();
            if (!state.hasMoreBottom) {
                bottomObserver?.disconnect();
                bottomObserver = null;
                root.querySelector("[data-scroll-sentinel-bottom]")?.remove();
            }
        } catch (error) {
            console.warn("Unable to load leaderboard players:", error);
        } finally {
            state.loadingBottom = false;
            setLoadingBottom(false);
        }
    };

    // Always start from top (rank 1)
    state.topOffset = 0;
    state.bottomOffset = 0;
    state.hasMoreTop = false;

    // Fetch user's rank immediately for summary + bottom bar (non-blocking)
    if (typeof getUserRankFn === "function") {
        getUserRankFn().then((rankResult) => {
            if (rankResult?.total != null) state.total = rankResult.total;
            updateBottomBar({
                rank: rankResult?.rank,
                name: rankResult?.name,
                score: rankResult?.score ?? 0,
            });
        }).catch(() => {});
    }

    // Set up bottom observer
    const scrollAreaEl = getScrollAreaEl();
    const bottomSentinelEl = root.querySelector("[data-scroll-sentinel-bottom]");
    if (bottomSentinelEl && typeof IntersectionObserver !== "undefined") {
        bottomObserver = new IntersectionObserver(
            (entries) => { if (entries[0]?.isIntersecting) loadNextPage(); },
            { root: scrollAreaEl, rootMargin: "200px" },
        );
        bottomObserver.observe(bottomSentinelEl);
        activeCleanup.push(() => { bottomObserver?.disconnect(); bottomObserver = null; });
    }

    // Load initial page (at startOffset)
    await loadNextPage();

    // Set up top observer only if there are pages above (when starting from a non-zero offset)
    if (state.hasMoreTop) {
        const listEl = getListEl();
        const topSentinel = document.createElement("div");
        topSentinel.setAttribute("data-scroll-sentinel-top", "");
        topSentinel.style.height = "1px";
        listEl?.before(topSentinel);

        topObserver = new IntersectionObserver(
            (entries) => { if (entries[0]?.isIntersecting) loadPrevPage(); },
            { root: scrollAreaEl, rootMargin: "200px" },
        );
        topObserver.observe(topSentinel);
        activeCleanup.push(() => { topObserver?.disconnect(); topObserver = null; });
    }
}
