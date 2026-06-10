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
        offset: 0,
        hasMore: true,
        loadingMore: false,
        total: null,
    };

    let activeCleanup = [];
    let observer = null;

    const cleanup = () => {
        activeCleanup.forEach((handler) => handler());
        activeCleanup = [];
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };

    const on = (target, eventName, handler, listenerOptions) => {
        if (!target) {
            return;
        }
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
                        <div class="leaderboard-summary">
                            <span>อันดับของคุณ</span>
                            <md-circular-progress indeterminate aria-label="กำลังโหลด" data-summary-loading></md-circular-progress>
                            <strong data-summary-value style="display: none;">-/-</strong>
                        </div>
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
                            <div class="leaderboard-list" data-leaderboard-list></div>
                            <div class="hub-clean-empty" data-leaderboard-load-more style="display: none;" aria-live="polite">
                                <md-circular-progress indeterminate aria-label="กำลังโหลดเพิ่มเติม"></md-circular-progress>
                            </div>
                            <div class="hub-clean-empty" data-leaderboard-initial-loading>
                                <md-circular-progress indeterminate aria-label="กำลังโหลดคะแนน"></md-circular-progress>
                                <p>กำลังโหลดคะแนน</p>
                            </div>
                            <div data-scroll-sentinel style="height: 1px;"></div>
                        </div>
                    </div>
                    <md-fab class="hub-clean-fab leaderboard-fab" aria-label="เลื่อนไปยังอันดับของคุณ" data-scroll-top>
                        <md-icon class="material-symbols-rounded" slot="icon">arrow_upward</md-icon>
                    </md-fab>
                </section>
                <aside class="leaderboard-bottom-bar" aria-label="อันดับของผู้เล่นคนนี้" data-leaderboard-bottom-bar style="display: none;"></aside>
            </div>
        </section>
    `;

    bindCurrentNodeScrollController({
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
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }
        event.preventDefault();
        onBack();
    });

    const getListEl = () => root.querySelector("[data-leaderboard-list]");
    const getSentinelEl = () => root.querySelector("[data-scroll-sentinel]");

    const updateSummary = () => {
        const currentPlayer = state.players.find((player) => player.current);
        const loadingEl = root.querySelector("[data-summary-loading]");
        const valueEl = root.querySelector("[data-summary-value]");
        if (!valueEl) {
            return;
        }
        valueEl.textContent = `${currentPlayer?.rank || "-"}/${state.total || "-"}`;
        if (loadingEl) {
            loadingEl.style.display = "none";
        }
        valueEl.style.display = "";
    };

    const updateBottomBar = () => {
        const currentPlayer = state.players.find((player) => player.current);
        const bottomBarEl = root.querySelector("[data-leaderboard-bottom-bar]");
        if (!bottomBarEl || !currentPlayer) {
            return;
        }
        bottomBarEl.innerHTML = renderLeaderboardRow({ ...currentPlayer, current: false });
        bottomBarEl.style.display = "";
    };

    const appendRows = (newPlayers) => {
        const listEl = getListEl();
        if (!listEl) {
            return;
        }
        const fragment = document.createDocumentFragment();
        newPlayers.forEach((player) => {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = renderLeaderboardRow(player);
            const el = wrapper.firstElementChild;
            if (el) {
                fragment.appendChild(el);
            }
        });
        listEl.appendChild(fragment);
    };

    const setLoadingMore = (show) => {
        const loadMoreEl = root.querySelector("[data-leaderboard-load-more]");
        if (loadMoreEl) {
            loadMoreEl.style.display = show ? "" : "none";
        }
    };

    const loadNextPage = async () => {
        if (state.loadingMore || !state.hasMore) {
            return;
        }

        state.loadingMore = true;
        setLoadingMore(true);

        try {
            const result = await loadPlayers({ offset: state.offset, limit: pageSize });
            const newPlayers = Array.isArray(result?.players) ? result.players : [];
            const isFirstPage = state.offset === 0;

            state.players = [...state.players, ...newPlayers];
            state.offset += newPlayers.length;
            state.hasMore = result?.hasMore ?? (newPlayers.length >= pageSize);
            if (result?.total != null) {
                state.total = result.total;
            }

            if (isFirstPage) {
                const initialLoadingEl = root.querySelector("[data-leaderboard-initial-loading]");
                if (initialLoadingEl) {
                    initialLoadingEl.remove();
                }
            }

            appendRows(newPlayers);
            updateSummary();
            updateBottomBar();

            if (!state.hasMore) {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
                const sentinelEl = getSentinelEl();
                if (sentinelEl) {
                    sentinelEl.remove();
                }
            }
        } catch (error) {
            console.warn("Unable to load leaderboard players:", error);
        } finally {
            state.loadingMore = false;
            setLoadingMore(false);
        }
    };

    const sentinelEl = getSentinelEl();
    if (sentinelEl && typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadNextPage();
                }
            },
            { rootMargin: "200px" },
        );
        observer.observe(sentinelEl);
        activeCleanup.push(() => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        });
    }

    await loadNextPage();
}
