// US-E7-01 · Bottom-Status-Player (Figma 3231:236). Ported from BottomStatusPlayer.vue.
// The pinned "your rank" bar with the orange highlight surface. Shows the current
// player's rank/name/score; the coin medal appears only when they are in the top 3.
// Geometry authored at the 1080px Figma frame; scaled by --gh-scale in components.css.
import { escapeText, escapeAttr } from "./escape.js";

const MEDAL_SRC = {
  1: "/assets/leaderboard/golden-coin.svg",
  2: "/assets/leaderboard/silver-coin.svg",
  3: "/assets/leaderboard/bronze-coin.svg",
};

/**
 * @param {object}        opts
 * @param {number|string} opts.rank
 * @param {string}        opts.playerName
 * @param {number|string} opts.score       pre-formatted score text
 */
export function renderLeaderboardBottomStatus({ rank = "", playerName = "", score = "" } = {}) {
  const medalSrc = MEDAL_SRC[Number(rank)] || "";

  return `
    <aside class="gh-leaderboard-bottom" aria-label="อันดับของคุณ">
      <div class="gh-leaderboard-bottom__panel"></div>
      <div class="gh-leaderboard-bottom__content">
        <div class="gh-leaderboard-bottom__rank-cell">
          ${medalSrc ? `<img class="gh-leaderboard-bottom__medal" src="${escapeAttr(medalSrc)}" alt="" aria-hidden="true" />` : ""}
          <span class="gh-leaderboard-bottom__rank">${escapeText(rank)}</span>
        </div>
        <div class="gh-leaderboard-bottom__name"></div>
        <p class="gh-leaderboard-bottom__name-text" title="${escapeAttr(playerName)}">${escapeText(playerName)}</p>
        <div class="gh-leaderboard-bottom__score-cell">
          <span class="gh-leaderboard-bottom__score">${escapeText(score)}</span>
        </div>
      </div>
    </aside>`;
}
