// US-E7-01 · Leaderboard-Row (Figma 3231:179 / :190 / :201 / :212 / :223).
// Ported from the verified demo (LeaderboardRow.vue). One base card with five
// visual states selected by `variant`:
//   gold / silver / bronze  -> top-3 medal cards (coin art behind the rank number)
//   bronze-you              -> current player highlight (orange ring)
//   other                   -> ordinary non-medal row
// Geometry authored at the 1080px Figma frame; scaled by --gh-scale in components.css.
import { escapeText, escapeAttr } from "./escape.js";

// Number-free coin artwork per rank (3258:26/33/40), served from public/.
const MEDAL_SRC = {
  1: "/assets/leaderboard/golden-coin.svg",
  2: "/assets/leaderboard/silver-coin.svg",
  3: "/assets/leaderboard/bronze-coin.svg",
};

export function variantForRank(rank) {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "other";
}

/**
 * @param {object}        opts
 * @param {number|string} opts.rank
 * @param {string}        opts.playerName
 * @param {number|string} opts.score        pre-formatted score text
 * @param {string}        [opts.variant]    gold | silver | bronze | bronze-you | other
 * @param {boolean}       [opts.current]    forces the "you" highlight regardless of rank
 */
export function renderLeaderboardRow({
  rank = "",
  playerName = "",
  score = "",
  variant = "other",
  current = false,
} = {}) {
  const medalSrc = MEDAL_SRC[Number(rank)] || "";
  const dataVariant = current && variant !== "bronze-you" ? `${variant} you` : variant;

  return `
    <article class="gh-leaderboard-row" data-variant="${escapeAttr(dataVariant)}" data-rank="${escapeAttr(rank)}">
      <div class="gh-leaderboard-row__content">
        <div class="gh-leaderboard-row__rank-cell">
          ${medalSrc ? `<img class="gh-leaderboard-row__medal" src="${escapeAttr(medalSrc)}" alt="" aria-hidden="true" />` : ""}
          <span class="gh-leaderboard-row__rank">${escapeText(rank)}</span>
        </div>
        <div class="gh-leaderboard-row__name">
            <p class="gh-leaderboard-row__name-text" title="${escapeAttr(playerName)}">${escapeText(playerName)}</p>
        </div>
        <div class="gh-leaderboard-row__score-cell">
          <span class="gh-leaderboard-row__score">${escapeText(score)}</span>
        </div>
      </div>
    </article>`;
}
