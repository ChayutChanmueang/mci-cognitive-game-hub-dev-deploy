import { HubElement } from "./HubElement.js";
import { DaySection } from "./DaySection.js";
import { DomObjectPool } from "../../core/game-hub-screen/DomObjectPool.js";

/**
 * LevelMap
 * Component สำหรับวาดเส้นทางแผนที่ของเกมทั้งหมด
 * คลาสนี้จัดการ Object Pool สำหรับ "DaySection" (กลุ่มของวัน)
 * และส่งต่อหน้าที่จัดการ LevelNode ไปให้ DaySection
 */
export class LevelMap extends HubElement {
    constructor(options = {}) {
        super(options);
        // สร้าง Object Pool สำหรับนำ DaySection Component มารีไซเคิล
        this.daySectionPool = new DomObjectPool({
            createMember: (opt) => new DaySection(opt),
            maxSize: 10 // จำนวนวันน่าจะไม่เกิน 10 วันที่แสดงพร้อมกันบนหน้าจอ
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

        this.renderDaySections();
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

    renderDaySections() {
        const daySectionsData = Array.isArray(this.options.daySections) ? this.options.daySections : [];
        const list = this.element?.querySelector("[data-day-section-list]");

        // 1. คืน DaySection เก่ากลับเข้า Object Pool
        this.daySectionPool.releaseAll();
        // เคลียร์ children ออกให้หมดก่อน
        this.children = [];
        
        if (!list) return;
        list.innerHTML = ""; // เคลียร์ DOM container เก่า

        // 2. ดึง DaySection ออกมาจาก Pool ตามข้อมูลและวาดลง DOM
        daySectionsData.forEach((daySectionData) => {
            const daySectionComponent = this.daySectionPool.acquire({
                daySectionData: daySectionData,
                historyRecords: this.options.historyRecords,
                startedProgram: this.options.startedProgram,
                onNodeAction: this.options.onNodeAction
            });
            
            // ให้ LevelMap เก็บ DaySection ไว้ในฐานะลูก
            this.addChild(daySectionComponent, list);
        });
    }

    destroy() {
        super.destroy();
        // คืนหน่วยความจำของ DaySection Pool
        this.daySectionPool.destroy();
    }
}
