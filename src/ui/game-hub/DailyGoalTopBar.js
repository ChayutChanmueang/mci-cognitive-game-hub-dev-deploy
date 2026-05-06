import { HubElement } from "./HubElement.js";
import { GameHubUtils } from "../../core/game-hub-screen/GameHubUtils.js";

/**
 * DailyGoalTopBar
 * ส่วนหัวของ Game Hub สำหรับแสดงแถบความคืบหน้ารายวัน
 */
export class DailyGoalTopBar extends HubElement {
    html() {
        const completedGameCount = Math.max(0, Number(this.options.completedGameCount) || 0);
        const dailyGameTarget = Math.max(0, Number(this.options.dailyGameTarget) || 0);
        const progress = dailyGameTarget > 0
            ? Math.min(1, completedGameCount / dailyGameTarget)
            : 0;
        const progressClass = progress >= 0.5 ? "is-half-passed" : "";
        const patientLabel = this.options.patientLabel || "ผู้เล่น";
        const programDay = Number(this.options.programDay) || 1;
        const dailyGoal = String(this.options.dailyGoal || "").trim()
            || (dailyGameTarget > 0
                ? `ทำภารกิจ ${dailyGameTarget} เกม ให้ครบตามแผนประจำวัน`
                : "ยังไม่พบรายการเกมประจำวัน");

        return `
            <header class="hub-clean-topbar">
                <div class="hub-clean-goal">
                    <p class="hub-clean-eyebrow">${GameHubUtils.escapeHtml(patientLabel)}</p>
                    <h1>เป้าหมายของวันที่ ${programDay}</h1>
                    <p>${GameHubUtils.escapeHtml(dailyGoal)}</p>
                    <div class="hub-clean-progress ${progressClass}" style="--hub-progress: ${progress};">
                        <md-linear-progress value="${progress}" aria-label="ทำแล้ว ${completedGameCount} จาก ${dailyGameTarget} เกม"></md-linear-progress>
                        <span>${completedGameCount}/${dailyGameTarget}</span>
                    </div>
                </div>
                <div class="hub-clean-profile" role="button" tabindex="0" aria-label="เปิดโปรไฟล์ผู้เล่น">
                    <md-filled-tonal-icon-button aria-label="เปิดโปรไฟล์ผู้เล่น">
                        <md-icon class="material-symbols-rounded">person</md-icon>
                    </md-filled-tonal-icon-button>
                    <strong>โปรไฟล์</strong>
                </div>
            </header>
        `;
    }

    bind() {
        const profile = this.element?.querySelector(".hub-clean-profile");
        const openProfile = () => this.options.onProfile?.();

        this.on(profile, "click", openProfile);
        this.on(profile, "keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            openProfile();
        });
    }
}
