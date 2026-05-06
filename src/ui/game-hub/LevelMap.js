import { HubElement } from "./HubElement.js";
import { DaySection } from "./DaySection.js";

export class LevelMap extends HubElement {
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
            if (!scrollArea) {
                return;
            }

            const initialScrollTop = Math.max(0, Number(this.options.initialScrollTop) || 0);
            if (initialScrollTop > 0) {
                scrollArea.scrollTop = initialScrollTop;
            } else {
                const activeDay = Number(this.options.activeProgramDay || this.options.currentProgramDay);
                const activeSection = Number.isFinite(activeDay)
                    ? this.element?.querySelector(`[data-program-day="${activeDay}"]`)
                    : null;
                if (activeSection) {
                    scrollArea.scrollTop = Math.max(0, activeSection.offsetTop - scrollArea.offsetTop);
                }
            }
            updateFab();
        });
    }

    renderDaySections() {
        const list = this.element?.querySelector("[data-day-section-list]");
        const daySections = Array.isArray(this.options.daySections) ? this.options.daySections : [];

        if (!list) {
            return;
        }

        daySections.forEach((daySection) => {
            this.addChild(new DaySection({
                daySectionData: daySection,
                historyRecords: this.options.historyRecords || [],
                startedProgram: this.options.startedProgram,
                activeProgramDay: this.options.activeProgramDay,
                onNodeAction: this.options.onNodeAction,
            }), list);
        });
    }
}
