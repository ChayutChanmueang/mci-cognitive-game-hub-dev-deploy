import { HubElement } from "./HubElement.js";
import { DailyGoalTopBar } from "./DailyGoalTopBar.js";
import { LevelMap } from "./LevelMap.js";
import { GameHubUtils } from "../../core/game-hub-screen/GameHubUtils.js";

/**
 * HubMapScreen
 * หน้าจอหลักของ Game Hub ทำหน้าที่รวม UI Component ย่อยๆเข้าด้วยกัน
 */
export class HubMapScreen extends HubElement {
    html() {
        const selectableGames = Array.isArray(this.options.selectableGames) ? this.options.selectableGames : [];
        const menuItems = selectableGames.map((game) => `
            <md-menu-item data-quick-game-item data-gid="${GameHubUtils.escapeHtml(game.gid)}">
                <div slot="headline">${GameHubUtils.escapeHtml(game.displayName || game.th_name || game.name || game.gid || "เกม")}</div>
                <div slot="supporting-text">${GameHubUtils.escapeHtml(game.gid || "")}</div>
            </md-menu-item>
        `).join("");
        const menuContent = menuItems || `
            <md-menu-item disabled>
                <div slot="headline">ไม่พบรายการเกม</div>
            </md-menu-item>
        `;

        return `
            <section class="hub-clean-screen">
                <div class="hub-clean-shell">
                    <div data-topbar></div>
                    <div data-stage></div>
                    <div class="hub-clean-logout">
                        <md-filled-button data-test-clear-history type="button">ลบประวัติการเล่น</md-filled-button>
                        <md-filled-button data-test-complete-all type="button">เล่นเกมครบทั้งหมด</md-filled-button>
                        <span class="hub-clean-quick-menu">
                            <md-filled-button data-test-quick-game-trigger type="button">เลือกเกมทดสอบ</md-filled-button>
                            <md-menu data-test-quick-game-menu positioning="popover">
                                ${menuContent}
                            </md-menu>
                        </span>
                        <md-filled-button data-test-daily-data-tools type="button">เครื่องมือจัดการข้อมูลรายวันเกม</md-filled-button>
                        <md-filled-button data-test-logout type="button">ออกจากระบบ</md-filled-button>
                    </div>
                </div>
            </section>
        `;
    }

    bind() {
        this.addChild(new DailyGoalTopBar({
            dailyGameTarget: this.options.dailyGameTarget,
            completedGameCount: this.options.completedGameCount,
            dailyGoal: this.options.dailyGoal,
            programDay: this.options.programDay,
            patientLabel: this.options.patientLabel,
            onProfile: this.options.onProfile,
        }), this.element?.querySelector("[data-topbar]"));

        this.addChild(new LevelMap({
            nodes: this.options.nodes,
            completedCount: this.options.completedCount,
            isLoading: this.options.isLoading,
            initialScrollTop: this.options.initialScrollTop,
            daySections: this.options.daySections,
            historyRecords: this.options.historyRecords,
            startedProgram: this.options.startedProgram,
            activeProgramDay: this.options.activeProgramDay,
            currentProgramDay: this.options.programDay,
            onScrollChange: this.options.onScrollChange,
            onNodeAction: this.options.onNodeAction,
        }), this.element?.querySelector("[data-stage]"));

        const selectableGameMap = new Map(
            (Array.isArray(this.options.selectableGames) ? this.options.selectableGames : [])
                .map((game) => [String(game?.gid || "").trim(), game])
                .filter(([gid]) => Boolean(gid)),
        );
        
        // Test-only hub controls for QA shortcuts
        const testQuickGameTrigger = this.element?.querySelector("[data-test-quick-game-trigger]");
        const testQuickGameMenu = this.element?.querySelector("[data-test-quick-game-menu]");
        if (testQuickGameMenu && testQuickGameTrigger) {
            testQuickGameMenu.anchorElement = testQuickGameTrigger;
            this.on(testQuickGameTrigger, "click", () => {
                testQuickGameMenu.open = !testQuickGameMenu.open;
            });
        }

        const quickGameItems = this.element?.querySelectorAll("[data-quick-game-item]") || [];
        quickGameItems.forEach((item) => {
            this.on(item, "click", async () => {
                const gid = String(item.getAttribute("data-gid") || "").trim();
                const selectedGame = selectableGameMap.get(gid);
                if (!selectedGame) {
                    return;
                }

                await this.options.onTestQuickGameSelect?.(selectedGame);
                if (testQuickGameMenu) {
                    testQuickGameMenu.open = false;
                }
            });
        });

        this.on(this.element?.querySelector("[data-test-clear-history]"), "click", async () => {
            try {
                await this.options.onTestClearHistory?.();
            } catch (error) {
                console.error("Unable to clear test history:", error);
            }
        });

        this.on(this.element?.querySelector("[data-test-complete-all]"), "click", async () => {
            try {
                await this.options.onTestCompleteAll?.();
            } catch (error) {
                console.error("Unable to write complete-all test history:", error);
            }
        });

        this.on(this.element?.querySelector("[data-test-daily-data-tools]"), "click", async () => {
            try {
                await this.options.onTestDailyDataTools?.();
            } catch (error) {
                console.error("Unable to open daily game data test tools:", error);
            }
        });

        this.on(this.element?.querySelector("[data-test-logout]"), "click", () => {
            this.options.onTestLogout?.();
        });
    }
}
