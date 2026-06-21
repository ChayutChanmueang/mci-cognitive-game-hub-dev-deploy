// GameHub-UI components — isolation preview harness (dev only).
//
// The ported components are pure functions returning HTML strings, so the
// harness just calls them and injects the markup onto a neutral stage — the
// production analogue of the demo App.vue workbench. As each Part lands, import
// its render function and add a row via `addRow(...)`.

import "../components.css";
import { renderPassNode } from "../nodes/pass-node.js";
import { renderCurrentNumberNode } from "../nodes/current-number-node.js";
import { renderNextNumberNode } from "../nodes/next-number-node.js";
import { renderCurrentFryFoodNode } from "../nodes/current-fryfood-node.js";
import { renderCurrentLine } from "../path/current-line.js";
import { renderDotLine } from "../path/dot-line.js";
import { renderDaySectionHeader } from "../day-section.js";
import { renderStartGameButton } from "../start-game-button.js";
import { renderLessonCard } from "../lesson-card.js";
import { renderFab } from "../fab-button.js";
import { renderHeaderBar } from "../header-bar.js";

const root = document.getElementById("preview-root");

/**
 * Render a labelled row of component samples.
 * @param {string} title  section caption
 * @param {Array<{caption:string, html:string, dark?:boolean}>} items
 */
export function addRow(title, items) {
  const row = document.createElement("section");
  row.className = "preview-row";
  row.innerHTML = items
    .map(
      (item) => `
        <figure class="preview-item"${item.wide ? ' style="width:100%;max-width:980px"' : ""}>
          <div class="preview-stage${item.dark ? " preview-stage--dark" : ""}"${
            item.wide ? ' style="width:100%;justify-content:flex-start;overflow-x:auto"' : ""
          }>${item.html}</div>
          <figcaption>${item.caption}</figcaption>
        </figure>`,
    )
    .join("");

  const heading = document.createElement("h2");
  heading.style.cssText = "font-size:14px;margin:0 0 12px;opacity:.8;";
  heading.textContent = title;

  root.appendChild(heading);
  root.appendChild(row);
}

// ── Part 1 · node states ───────────────────────────────────────────────────
addRow("Part 1 · node states", [
  { caption: "Pass · 3108:28 (done)", html: renderPassNode() },
  { caption: "Current · 3108:113 (#1)", html: renderCurrentNumberNode(1) },
  { caption: "Next · 3108:19 (#2)", html: renderNextNumberNode(2) },
  { caption: "Current variant · 3108:8 (fry-food)", html: renderCurrentFryFoodNode() },
]);

// two-digit overflow check (days can have 10+ nodes)
addRow("Part 1 · two-digit number check", [
  { caption: "Next · #10", html: renderNextNumberNode(10) },
  { caption: "Current · #10", html: renderCurrentNumberNode(10) },
]);

// ── Part 2 · path connectors (white — shown on a dark stage) ────────────────
addRow("Part 2 · path connectors", [
  { caption: "Current-Line · 3108:10 (24×166)", html: renderCurrentLine(), dark: true },
  { caption: "Dot-Line · 3108:27 (24×99)", html: renderDotLine(), dark: true },
]);

// ── Part 3 · day section (1080px wide — scrollable, dark stage shows the divider)
addRow("Part 3 · day section", [
  { caption: "Day-Section · 3108:7 (1080×98)", html: renderDaySectionHeader("วันที่ 1"), dark: true, wide: true },
]);

// ── Part 4 · start button + lesson card ─────────────────────────────────────
addRow("Part 4 · start button + lesson card", [
  { caption: "Start-Game-Button · 3108:68", html: renderStartGameButton() },
  { caption: "Start-Game-Button (disabled)", html: renderStartGameButton({ disabled: true }) },
]);
addRow("Part 4 · lesson card (composite)", [
  { caption: "LessonCard · 3108:26 (nested button)", html: renderLessonCard() },
]);

// ── Part 5 · floating action buttons ────────────────────────────────────────
addRow("Part 5 · FAB buttons", [
  { caption: "Go-To-Top · 3108:3 (arrow up)", html: renderFab({ icon: "arrow", action: "scroll-top", ariaLabel: "เลื่อนไปยังจุดปัจจุบัน" }) },
  {
    caption: 'arrow down (data-scroll-direction="down")',
    // simulate the controller's down-state to verify the CSS rotation
    html: renderFab({ icon: "arrow" }).replace("<button ", '<button data-scroll-direction="down" '),
  },
  { caption: "Leaderboard · 3108:4 (trophy)", html: renderFab({ icon: "trophy", action: "leaderboard", ariaLabel: "เปิดหน้าคะแนนผู้เล่น" }) },
]);

// ── Part 6 · header bar (1080-scale, wide/scroll; parameterized) ─────────────
addRow("Part 6 · header bar (Figma defaults)", [
  { caption: "Header-Bar · 3108:2 (958×344)", html: renderHeaderBar(), dark: true, wide: true },
]);
addRow("Part 6 · header bar (dynamic data)", [
  {
    caption: "patientLabel / day / goal / progress 7-of-10",
    html: renderHeaderBar({
      patientLabel: "สมหญิง ใจดี",
      goalTitle: "เป้าหมายของวันที่ 3",
      goalSummary: "ทำภารกิจ 10 ขั้นตอน ให้ครบตามแผนประจำวัน",
      progress: 0.7,
      done: 7,
      total: 10,
    }),
    dark: true,
    wide: true,
  },
]);

if (!root.children.length) {
  root.innerHTML =
    '<div class="preview-empty">No components yet — Part 0 scaffold only. Add the first node component in Part 1.</div>';
}
