import { HubElement } from "./HubElement.js";
import { LevelNode } from "./LevelNode.js";
import { GameHubUtils } from "../../core/game-hub-screen/GameHubUtils.js";
import { GameHubHistoryManager } from "../../core/game-hub-screen/GameHubHistoryManager.js";
import { DomObjectPool } from "../../core/game-hub-screen/DomObjectPool.js";

/**
 * DaySection
 * Component สำหรับแสดงผล Section ของแต่ละวันในแผนที่
 * คลาสนี้จะจัดการ Object Pool ของ LevelNode (เกมในแต่ละวัน) ของตัวเอง
 * ซึ่งเป็นตัวอย่างของ Nested Pooling (Pool ซ้อน Pool) ที่มีประสิทธิภาพ
 */
export class DaySection extends HubElement {
    constructor(options = {}) {
        super(options);
        // แต่ละ DaySection จะมี Pool สำหรับ Node เกมของตัวเอง
        this.nodePool = new DomObjectPool({
            createMember: (opt) => new LevelNode(opt),
            maxSize: 30 // ตั้งค่าขนาด Pool สำหรับ Node ภายในวัน
        });
    }

    html() {
        const day = this.options.daySectionData?.day || "";
        return `
            <section class="hub-clean-day-section" data-program-day="${day}">
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
        this.renderNodes();
    }

    /**
     * เมื่อถูกนำกลับมาใช้ใหม่ (จาก Object Pool ของ LevelMap)
     * จะต้องทำการ Reset และวาด Node ลูกๆ ใหม่ทั้งหมด
     */
    reset(options) {
        super.reset(options);
        // อัปเดต data attribute ของ element หลัก
        if (this.element) {
            this.element.dataset.programDay = this.options.daySectionData?.day || "";
        }
    }

    renderNodes() {
        const daySection = this.options.daySectionData || {};
        const nodes = daySection.nodes || [];
        const list = this.element?.querySelector("[data-level-list]");

        // คืน Node เก่าของวันกลับเข้า Pool ก่อนวาดใหม่
        this.nodePool.releaseAll();
        // เคลียร์ children เก่าออกจาก HubElement base class
        this.children = []; 

        if (!list) return;
        list.innerHTML = ""; // เคลียร์ DOM เก่า

        const dayHistory = GameHubHistoryManager.getHistoryRecordsForProgramDay(
            this.options.historyRecords || [],
            this.options.startedProgram,
            Number(daySection.day || 1),
        );
        const completion = GameHubHistoryManager.getProgramDayCompletion(daySection, dayHistory);
        const currentNodeIndex = completion.completedCount >= nodes.length ? -1 : completion.completedCount;

        nodes.forEach((node, index) => {
            // ดึง Node เกมจาก Pool ของ DaySection นี้
            const levelNode = this.nodePool.acquire({
                nodeData: node,
                index,
                isDone: index < completion.completedCount,
                isCurrent: currentNodeIndex >= 0 && index === currentNodeIndex,
                onAction: this.options.onNodeAction,
            });
            // เพิ่ม LevelNode ที่ได้จาก Pool เป็นลูกของ DaySection
            this.addChild(levelNode, list);
        });
    }

    /**
     * ทำลาย Pool ของตัวเองเมื่อ Component ถูกทำลาย
     */
    destroy() {
        super.destroy();
        this.nodePool.destroy();
    }
}
