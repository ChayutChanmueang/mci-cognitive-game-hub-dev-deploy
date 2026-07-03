// US-E7-01 · Floating-TopBar (Figma 3231:246). Ported from FloatingTopBar.vue.
// The teal column-heading bar (อันดับ / ชื่อ / คะแนน) with the trophy icon that
// floats above the leaderboard list. Geometry scaled by --gh-scale in components.css.

const TROPHY_SRC = "/assets/leaderboard/icon-trophy.png";

export function renderLeaderboardTopBar() {
  return `
    <div class="gh-leaderboard-top-bar" aria-hidden="true">
      <div class="gh-leaderboard-top-bar__bg"></div>
      <div class="gh-leaderboard-top-bar-clamp">
        <div class="gh-leaderboard-top-bar__content">
          <span class="gh-leaderboard-top-bar__label gh-leaderboard-top-bar__label--rank">อันดับ</span>
          <span class="gh-leaderboard-top-bar__label gh-leaderboard-top-bar__label--name">ชื่อ</span>
          <div class="gh-leaderboard-top-bar__score-head">
            <span class="gh-leaderboard-top-bar__score-head-label gh-leaderboard-top-bar__label">คะแนน</span>
            <div class="gh-leaderboard-top-bar__trophy">
              <img class="gh-leaderboard-top-bar__trophy-image" src="${TROPHY_SRC}" alt="" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>`;
}
