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

export function renderLeaderboardScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        patientLabel = "ผู้เล่น",
        onBack = () => {},
        loadPlayers,
        getUserRank,
    } = options;

    let activeCleanup = [];

    const cleanup = () => {
        activeCleanup.forEach((handler) => handler());
        activeCleanup = [];
    };

    const on = (target, eventName, handler, listenerOptions) => {
        if (!target) return;
        target.addEventListener(eventName, handler, listenerOptions);
        activeCleanup.push(() => target.removeEventListener(eventName, handler, listenerOptions));
    };

    const renderContent = ({ players = [], currentRankInfo = null, loading = false } = {}) => {
        cleanup();

        root.innerHTML = `
            <section class="hub-clean-screen leaderboard-screen" aria-labelledby="leaderboard-title">
                <div class="hub-clean-shell leaderboard-shell">
                    <header class="leaderboard-clean-topbar leaderboard-topbar">
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
                                ${loading ? `
                                    <div class="hub-clean-empty">
                                        <md-circular-progress indeterminate aria-label="กำลังโหลดคะแนน"></md-circular-progress>
                                        <p>กำลังโหลดคะแนน</p>
                                    </div>
                                ` : players.length ? `
                                    <div class="leaderboard-list">
                                        ${players.map(renderLeaderboardRow).join("")}
                                    </div>
                                ` : `
                                    <div class="hub-clean-empty">
                                        <p>ยังไม่มีข้อมูลคะแนน</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </section>
                    ${!loading && currentRankInfo?.rank ? `
                        <aside class="leaderboard-bottom-bar" aria-label="อันดับของผู้เล่นคนนี้">
                            ${renderLeaderboardRow({
                                rank: currentRankInfo.rank,
                                name: currentRankInfo.name || patientLabel,
                                score: currentRankInfo.score || 0,
                                current: false,
                            })}
                        </aside>
                    ` : ""}
                </div>
            </section>
        `;

        on(root.querySelector(".leaderboard-back"), "click", () => onBack());
        on(root.querySelector(".leaderboard-back"), "keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            onBack();
        });
    };

    renderContent({ loading: true });

    Promise.all([
        loadPlayers?.({ offset: 0, limit: 10 }),
        getUserRank?.(),
    ]).then(([leaderboardResult, rankResult]) => {
        renderContent({
            players: leaderboardResult?.players || [],
            currentRankInfo: rankResult || null,
        });
    }).catch(() => {
        renderContent({});
    });
}
