import { HubElement } from "./HubElement.js";
import { GameLaunchCard } from "./GameLaunchCard.js";
import { GameHubUtils } from "../../core/game-hub-screen/GameHubUtils.js";

/**
 * LevelNode
 * จุด Node เกมบนแผนที่แต่ละด่าน 
 */
export class LevelNode extends HubElement {
    html() {
        const node = this.options.nodeData || {};
        const index = Math.max(0, Number(this.options.index) || 0);
        const isDone = Boolean(this.options.isDone);
        const isCurrent = Boolean(this.options.isCurrent);
        const classes = [
            "hub-clean-level",
            isDone ? "is-done" : "",
            isCurrent ? "is-current" : "",
        ].filter(Boolean).join(" ");
        const nodeText = isDone
            ? "✓"
            : node.type === "game"
                ? String(node.gameNumber || index + 1)
                : node.emoji || "•";
        const sideLabel = node.title || `เกมที่ ${index + 1}`;

        return `
            <div class="${classes}">
                <div class="hub-clean-level__node" aria-hidden="true">
                    <span>${nodeText}</span>
                </div>
                <div class="hub-clean-level__side">
                    ${isCurrent ? `<div data-current-card></div>` : `<div class="hub-clean-game-pill">${GameHubUtils.escapeHtml(sideLabel)}</div>`}
                </div>
            </div>
        `;
    }

    bind() {
        if (!this.options.isCurrent) {
            return;
        }

        // นำ Card มาประกอบใน Node
        this.addChild(new GameLaunchCard({
            nodeData: this.options.nodeData,
            onAction: this.options.onAction,
        }), this.element?.querySelector("[data-current-card]"));
    }
}
