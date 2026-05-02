import { EventBus } from "../core/EventBus.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export class MinigameResultPanel {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.element = null;
    }

    render() {
        const { score = 0, highScore = 0, gameTitle = "จบเกม" } = this.options;
        
        const overlay = document.createElement("div");
        overlay.className = "result-overlay";
        overlay.innerHTML = `
            <div class="result-backdrop"></div>
            <div class="result-card">
                <div class="result-card__header">
                    <span class="material-symbols-rounded result-icon">workspace_premium</span>
                    <h2>${escapeHtml(gameTitle)}</h2>
                </div>
                
                <div class="result-stats">
                    <div class="result-stat">
                        <span class="result-stat__label">คะแนนที่ได้</span>
                        <span class="result-stat__value">${score}</span>
                    </div>
                    <div class="result-stat result-stat--secondary">
                        <span class="result-stat__label">คะแนนสูงสุด</span>
                        <span class="result-stat__value">${highScore}</span>
                    </div>
                </div>
                
                <div class="result-actions">
                    <md-outlined-button id="result-exit-button" type="button">กลับหน้าหลัก</md-outlined-button>
                    <md-filled-button id="result-retry-button" type="button">เล่นอีกครั้ง</md-filled-button>
                </div>
            </div>
        `;

        this.element = overlay;
        this.root.appendChild(overlay);

        overlay.querySelector("#result-exit-button")?.addEventListener("click", () => {
            this.destroy();
            EventBus.emit("minigame:exit-confirmed");
        });

        overlay.querySelector("#result-retry-button")?.addEventListener("click", () => {
            this.destroy();
            EventBus.emit("minigame:retry-request");
        });
    }

    destroy() {
        this.element?.remove();
    }
}
