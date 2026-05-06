import { HubElement } from "./HubElement.js";
import { LevelNode } from "./LevelNode.js";
import { GameHubUtils } from "../../core/game-hub-screen/GameHubUtils.js";
import { GameHubHistoryManager } from "../../core/game-hub-screen/GameHubHistoryManager.js";

export class DaySection extends HubElement {
    html() {
        const day = this.options.daySectionData?.day || "";
        return `
            <section class="hub-clean-day-section" data-program-day="${GameHubUtils.escapeHtml(day)}">
                <div class="hub-clean-day-divider">
                    <span></span>
                    <strong>วันที่ ${GameHubUtils.escapeHtml(day)}</strong>
                    <span></span>
                </div>
                <div class="hub-clean-levels" data-level-list></div>
            </section>
        `;
    }

    bind() {
        const daySection = this.options.daySectionData || {};
        const nodes = Array.isArray(daySection.nodes) ? daySection.nodes : [];
        const list = this.element?.querySelector("[data-level-list]");

        if (!list) {
            return;
        }

        const day = Number(daySection.day || 1);
        const dayHistory = GameHubHistoryManager.getHistoryRecordsForProgramDay(
            this.options.historyRecords || [],
            this.options.startedProgram,
            day,
        );
        const completion = GameHubHistoryManager.getProgramDayCompletion(daySection, dayHistory);
        const isActiveDay = Number(this.options.activeProgramDay) === day;
        const currentNodeIndex = isActiveDay && completion.completedCount < nodes.length
            ? completion.completedCount
            : -1;

        nodes.forEach((node, index) => {
            this.addChild(new LevelNode({
                nodeData: node,
                index,
                isDone: index < completion.completedCount,
                isCurrent: index === currentNodeIndex,
                onAction: this.options.onNodeAction,
            }), list);
        });
    }
}
