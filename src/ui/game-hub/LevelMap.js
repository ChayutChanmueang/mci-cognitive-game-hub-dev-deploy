import { HubElement } from "./HubElement.js";
import { LevelNode } from "./LevelNode.js";
import { GameHubUtils } from "../../core/game-hub-screen/GameHubUtils.js";
import { GameHubHistoryManager } from "../../core/game-hub-screen/GameHubHistoryManager.js";
import { DomObjectPool } from "../../core/game-hub-screen/DomObjectPool.js";

/**
 * LevelMap
 * Component สำหรับวาดเส้นทางแผนที่ของเกมทั้งหมด (รองรับ Object Pool)
 */
export class LevelMap extends HubElement {
    constructor(options = {}) {
        super(options);
        // สร้าง Object Pool สำหรับนำ UI Node มารีไซเคิล
        this.nodePool = new DomObjectPool({
            createMember: (opt) => new LevelNode(opt),
            maxSize: 30
        });
    }

    html() {
        return `
            <section class="hub-clean-stage">
                <div class="hub-clean-scroll" data-hub-scroll>
                    <div class="hub-clean-content">
                        <div data-day-section-list></div>
                        ${this.options.isLoading ? this.loadingHtml() : ""}
                    </div>
                </div>
                <md-fab class="hub-clean-fab" aria-label="เลื่อนกลับด้านบน" data-scroll-top>
                    <md-icon class="material-symbols-rounded" slot="icon">arrow_upward</md-icon>
                </md-fab>
            </section>
        `;
    }

    loadingHtml() {
        return `
            <div class="hub-clean-empty">
                <md-circular-progress indeterminate aria-label="กำลังโหลดรายการเกม"></md-circular-progress>
                <p>กำลังโหลดรายการเกม</p>
            </div>
        `;
    }

    bind() {
        const scrollArea = this.element?.querySelector("[data-hub-scroll]");
        const scrollTop = this.element?.querySelector("[data-scroll-top]");
        const updateFab = () => {
            const value = scrollArea?.scrollTop || 0;
            scrollTop?.classList.toggle("is-visible", value > 160);
            this.options.onScrollChange?.(value);
        };

        this.renderNodes();
        this.on(scrollArea, "scroll", updateFab, { passive: true });
        this.on(scrollTop, "click", () => scrollArea?.scrollTo({ top: 0, behavior: "smooth" }));

        requestAnimationFrame(() => {
            if (scrollArea) {
                const initialScrollTop = Math.max(0, Number(this.options.initialScrollTop) || 0);
                if (initialScrollTop > 0) {
                    scrollArea.scrollTop = initialScrollTop;
                } else {
                    const currentDay = Number(this.options.currentProgramDay);
                    const currentSection = Number.isFinite(currentDay)
                        ? this.element?.querySelector(`[data-program-day="${currentDay}"]`)
                        : null;
                    if (currentSection) {
                        scrollArea.scrollTop = Math.max(0, currentSection.offsetTop - scrollArea.offsetTop);
                    }
                }
                updateFab();
            }
        });
    }

    renderNodes() {
        const daySections = Array.isArray(this.options.daySections) ? this.options.daySections : [];
        const list = this.element?.querySelector("[data-day-section-list]");

        // คืนค่า Node เก่ากลับเข้า Object Pool ก่อนทำการเรนเดอร์ใหม่
        this.nodePool.releaseAll();

        daySections.forEach((daySection) => {
            const nodes = daySection?.nodes || [];
            const dayHistory = GameHubHistoryManager.getHistoryRecordsForProgramDay(
                this.options.historyRecords || [],
                this.options.startedProgram,
                Number(daySection?.day || 1),
            );
            const completion = GameHubHistoryManager.getProgramDayCompletion(daySection, dayHistory);
            const currentNodeIndex = completion.completedCount >= nodes.length ? -1 : completion.completedCount;
            const section = document.createElement("section");
            section.className = "hub-clean-day-section";
            section.dataset.programDay = String(daySection?.day || "");
            section.innerHTML = `
                <div class="hub-clean-day-divider">
                    <span></span>
                    <strong>วันที่ ${GameHubUtils.escapeHtml(daySection?.day || "")}</strong>
                    <span></span>
                </div>
                <div class="hub-clean-levels" data-level-list></div>
            `;
            list?.append(section);

            const nodeList = section.querySelector("[data-level-list]");
            nodes.forEach((node, index) => {
                // ดึง Node ออกมาจาก Object Pool (หรือสร้างใหม่ถ้าไม่มี)
                const levelNode = this.nodePool.acquire({
                    nodeData: node,
                    index,
                    isDone: index < completion.completedCount,
                    isCurrent: currentNodeIndex >= 0 && index === currentNodeIndex,
                    onAction: this.options.onNodeAction,
                });
                this.addChild(levelNode, nodeList);
            });
        });
    }

    destroy() {
        super.destroy();
        // คืนหน่วยความจำในส่วนของ Object Pool อย่างสมบูรณ์
        this.nodePool.destroy();
    }
}
