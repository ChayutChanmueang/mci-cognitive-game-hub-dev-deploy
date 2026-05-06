import { HubElement } from "./HubElement.js";
import { GameHubUtils } from "../../core/game-hub-screen/GameHubUtils.js";

/**
 * GameLaunchCard
 * Card สำหรับแสดงข้อมูลและปุ่มสำหรับเข้าเล่นเกม
 */
export class GameLaunchCard extends HubElement {
    html() {
        const node = this.options.nodeData || {};
        const type = node.type || "game";

        if (type === "rest") {
            return `
                <article class="hub-clean-current-card">
                    <p>พักยืดเส้น</p>
                    <h2>${GameHubUtils.escapeHtml(node.title || "พักยืดเส้นยืดสาย")}</h2>
                    <span>พักสายตา ยืดเส้น และผ่อนคลายก่อนเล่นต่อ</span>
                    <md-outlined-button data-hub-launch-game type="button">บันทึกการพัก</md-outlined-button>
                </article>
            `;
        }

        const game = node.gameData || {};
        const categoryId = game.mci_group || "Attention";
        const gameDisplayName = game.displayName || game.th_name || game.name || node.title || "เกมฝึกสมอง";

        return `
            <article class="hub-clean-current-card">
                <p>${GameHubUtils.escapeHtml(GameHubUtils.getCategoryLabel(categoryId))}</p>
                <h2>${GameHubUtils.escapeHtml(gameDisplayName)}</h2>
                <span>${GameHubUtils.escapeHtml(GameHubUtils.getCategoryDescription(categoryId))}</span>
                <md-outlined-button data-hub-launch-game type="button">เริ่มเกม</md-outlined-button>
            </article>
        `;
    }

    bind() {
        const node = this.options.nodeData || {};
        this.on(this.element?.querySelector("[data-hub-launch-game]"), "click", () => {
            this.options.onAction?.(node);
        });
    }
}
