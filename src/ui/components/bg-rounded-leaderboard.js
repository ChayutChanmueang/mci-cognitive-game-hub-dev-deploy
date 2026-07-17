// US-E7-01 · BG-Rounded-Leaderboard (Figma 3231:253 / child 3231:251).
// Ported from BgRoundedLeaderboard.vue: the cream rounded surface behind the list.
// Pure CSS, no image. It stretches from below the header to the bottom of the shell
// (positioned/sized via components.css) and now also wraps the scrolling list, so it
// accepts the list markup via `body` and clips it to the panel's rounded top.

/**
 * @param {object} [opts]
 * @param {string} [opts.body]  inner markup (the scroll stage), already trusted HTML
 */
export function renderBgRoundedLeaderboard({ body = "" } = {}) {
  return `<div class="gh-bg-rounded-leaderboard">${body}</div>`;
}
