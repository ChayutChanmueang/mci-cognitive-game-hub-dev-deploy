// US-E7-01 · leaderboard-screen.js — composes the Figma leaderboard art (node 3231:15)
// from the ported components in src/ui/components/. This file owns only data loading,
// scroll scaffold, and back-button wiring; all visuals live in the components + CSS.
import { renderIconButtonBack } from "./components/icon-button-back.js";
import { renderBgRoundedLeaderboard } from "./components/bg-rounded-leaderboard.js";
import { renderLeaderboardTopBar } from "./components/leaderboard-top-bar.js";
import { renderLeaderboardRow, variantForRank } from "./components/leaderboard-row.js";
import { renderLeaderboardBottomStatus } from "./components/leaderboard-bottom-status.js";

function formatScore(value) {
    return new Intl.NumberFormat("en-US").format(Number(value) || 0);
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

    const renderRows = (players) =>
        players
            .map((player) =>
                renderLeaderboardRow({
                    rank: player.rank,
                    playerName: player.name,
                    score: formatScore(player.score),
                    variant: variantForRank(Number(player.rank)),
                    current: Boolean(player.current),
                }),
            )
            .join("");

    const renderContent = ({ players = [], currentRankInfo = null, loading = false } = {}) => {
        cleanup();

        const listMarkup = loading
            ? `
                <div class="gh-leaderboard-empty">
                    <md-circular-progress indeterminate aria-label="กำลังโหลดคะแนน"></md-circular-progress>
                    <p>กำลังโหลดคะแนน</p>
                </div>
            `
            : players.length
                ? `<div class="gh-leaderboard-list">${renderRows(players)}</div>`
                : `<div class="gh-leaderboard-empty"><p>ยังไม่มีข้อมูลคะแนน</p></div>`;

        const bottomMarkup = !loading && currentRankInfo?.rank
            ? renderLeaderboardBottomStatus({
                rank: currentRankInfo.rank,
                playerName: currentRankInfo.name || patientLabel,
                score: formatScore(currentRankInfo.score || 0),
            })
            : "";

        root.innerHTML = `
            <section class="hub-clean-screen leaderboard-screen" aria-labelledby="leaderboard-title">
                <div class="hub-clean-shell leaderboard-shell">
                    ${renderBgRoundedLeaderboard({
                        body: `
                            <div class="gh-leaderboard-stage">
                                <div class="gh-leaderboard-scroll" data-leaderboard-scroll>
                                    <div class="gh-leaderboard-content" data-leaderboard-section>
                                        ${listMarkup}
                                    </div>
                                </div>
                            </div>
                        `,
                    })}

                    <header class="gh-leaderboard-header">
                        ${renderIconButtonBack({ className: "gh-leaderboard-back", ariaLabel: "กลับ" })}
                        <h1 id="leaderboard-title" class="gh-leaderboard-header__title">ชุมชนพัฒนาสมอง</h1>
                        <p class="gh-leaderboard-header__subtitle">อันดับคะแนนรวมของผู้เล่นทั้งหมด</p>
                        <img class="gh-leaderboard-header__flower gh-leaderboard-header__flower--1" src="/assets/leaderboard/flower-1.png" alt="" aria-hidden="true" />
                        <img class="gh-leaderboard-header__flower gh-leaderboard-header__flower--2" src="/assets/leaderboard/flower-2.png" alt="" aria-hidden="true" />
                    </header>

                    ${renderLeaderboardTopBar()}

                    ${bottomMarkup}
                </div>
            </section>
        `;

        on(root.querySelector(".gh-leaderboard-back"), "click", () => onBack());
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
