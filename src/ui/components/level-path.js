// Part 8 · Level-path composition (1080 design scale).
//
// Builds the scrollable day/level list from node data using the Part 1–4 ported
// components. This holds the node-state selection + connector-state logic that
// will later drive game-hub-screen.js renderNode/renderDaySection. Pure functions
// returning HTML strings — no listeners (parent bind() wires clicks via the
// data-* hooks the components already emit).
//
// Node state (per EXPORT.md Part 1):
//   pass    -> renderPassNode            (already played)
//   current -> renderCurrentNumberNode   (on now) / fryfood variant for PHY001
//   next    -> renderNextNumberNode      (not reached / not passed)
//   rest/checkin -> emoji coin (Open Decision 5: keep emoji)
// Connector state (per EXPORT.md Part 2): solid line leaves the current node
// (current -> next); every other connector is dotted.
import { renderPassNode } from "./nodes/pass-node.js";
import { renderCurrentNumberNode } from "./nodes/current-number-node.js";
import { renderNextNumberNode } from "./nodes/next-number-node.js";
import { renderCurrentFryFoodNode, renderNextFryFoodNode } from "./nodes/current-fryfood-node.js";
import { renderCurrentLine } from "./path/current-line.js";
import { renderDotLine } from "./path/dot-line.js";
import { renderDaySectionHeader } from "./day-section.js";
import { renderLessonCard } from "./lesson-card.js";
import { escapeText, escapeAttr } from "./escape.js";

// rest/checkin: shown in a coin matching the node's done/next look. A gender-specific
// character image (node.image) replaces the emoji glyph when provided; the emoji is
// kept as the fallback for when no image is supplied.
function renderEmojiNode(emoji, { done = false, image = "", type = "" } = {}) {
  const cls = done ? "gh-emoji-node gh-emoji-node--done" : "gh-emoji-node";
  // rest (sitting) and check-in (standing) characters sit differently on the coin, so
  // the image + its standard Character_Shadow (US-E7-14 #4) carry a per-type modifier
  // class so each can be tuned independently. Shadow is placed before the image so it
  // paints behind it.
  const variant = type === "rest" || type === "checkin" ? type : "";
  const imageCls = `gh-emoji-node__image${variant ? ` gh-emoji-node-${variant}__image` : ""}`;
  const shadowCls = `character-shadow gh-emoji-node__shadow${variant ? ` gh-emoji-node-${variant}__shadow` : ""}`;
  const face = image
    ? `<span class="${shadowCls}" aria-hidden="true"></span><img class="${imageCls}" src="${escapeAttr(image)}" alt="" aria-hidden="true" />`
    : `<span class="gh-emoji-node__glyph">${escapeText(emoji)}</span>`;
  return `
    <div class="${cls}">
      <div class="gh-emoji-node__base"></div>
      <div class="gh-emoji-node__mid"></div>
      <div class="gh-emoji-node__top"></div>
      ${face}
    </div>`;
}

function renderNodeGlyph(node) {
  if (node.type === "rest" || node.type === "checkin") {
    return renderEmojiNode(node.emoji || (node.type === "rest" ? "🏋️" : "🏁"), {
      done: node.state === "pass",
      image: node.image,
      type: node.type,
    });
  }
  if (node.state === "pass") return renderPassNode();
  if (node.fryfood && node.state !== "current") return renderNextFryFoodNode();
  if (node.state === "current") {
    return node.fryfood ? renderCurrentFryFoodNode() : renderCurrentNumberNode(node.number);
  }
  return renderNextNumberNode(node.number);
}

// side content next to a node: lesson card for the current node (with a start
// button only for games — current rest/check-in get a button-less card), label
// pill for every other node.
function renderSide(node) {
  if (node.state === "current") {
    return renderLessonCard({
      category: node.category,
      title: node.title,
      description: node.description,
      nodeId: node.id,
      day: node.day,
      disabled: node.disabled,
      showButton: node.type === "game",
    });
  }
  const label = node.sideLabel || node.title || "";
  if (!label) return "";
  return `<div class="gh-game-pill">${escapeText(label)}</div>`;
}

function renderConnector(fromNode) {
  // solid leaves the current node; otherwise dotted
  return fromNode.state === "current" ? renderCurrentLine() : renderDotLine();
}

function renderNodeRow(node) {
  const stateCls = `gh-level-row--${node.state || "next"}`;
  return `
    <div class="gh-level-row ${stateCls}">
      <div class="gh-level-row__rail">${renderNodeGlyph(node)}</div>
      <div class="gh-level-row__side">${renderSide(node)}</div>
    </div>`;
}

/**
 * @param {Array<{day:number, label:string, nodes:Array}>} daySections
 * @returns {string} HTML for the scrollable level path
 */
export function renderLevelPath(daySections) {
  const days = (daySections || [])
    .map((section) => {
      const rows = (section.nodes || [])
        .map((node, i, arr) => {
          const row = renderNodeRow(node);
          const connector =
            i < arr.length - 1
              ? `<div class="gh-level-connector">${renderConnector(node)}</div>`
              : "";
          return row + connector;
        })
        .join("");
      return `
        <section class="gh-day-block" data-program-day="${escapeText(section.day)}">
          <div class="gh-day-block__header">${renderDaySectionHeader(section.label)}</div>
          <div class="gh-level-list">${rows}</div>
        </section>`;
    })
    .join("");
  return `
    <div class="gh-level-path">
      <div class="gh-level-path__spacer gh-level-path__spacer--top" aria-hidden="true"></div>
      ${days}
      <div class="gh-level-path__spacer gh-level-path__spacer--bottom" aria-hidden="true"></div>
    </div>`;
}
