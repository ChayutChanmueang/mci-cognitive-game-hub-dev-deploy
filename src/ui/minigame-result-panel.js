import { EventBus } from "../core/EventBus.js";

export class MinigameResultPanel {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.element = null;
        this.resizeHandler = this.resizePanel.bind(this);
    }

    render() {
        const overlay = document.createElement("div");
        overlay.className = "result-overlay";

        const title = "จบเกม";
        const formattedScore = (this.options.score || 0).toLocaleString();

        overlay.innerHTML = `
            <div class="result-backdrop"></div>
            <div class="result-panel" id="gameover-result-panel">
                <div class="result-header">
                    <h2>${title}</h2>
                </div>
                <div class="result-picture"></div>
                <div class="result-compliment">คุณทำได้ยอดเยี่ยมมาก</div>
                <div class="result-score-box">
                    <div class="result-score-label">คะแนนของคุณ</div>
                    <div class="result-score-value">${formattedScore}</div>
                </div>
                <button id="result-exit-button" class="result-btn-home">กลับหน้าหลัก</button>
            </div>
        `;

        this.element = overlay;
        this.root.appendChild(overlay);

        // Apply per-game panel colour overrides
        const panel = overlay.querySelector("#gameover-result-panel");
        const header = overlay.querySelector(".result-header");
        if (panel && this.options.panelBorderColor) {
            panel.style.borderColor = this.options.panelBorderColor;
        }
        if (header && this.options.panelHeaderColor) {
            header.style.backgroundColor = this.options.panelHeaderColor;
        }

        const btn = overlay.querySelector("#result-exit-button");
        if (btn) {
            const handleExit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.destroy();
                EventBus.emit("minigame:exit-confirmed");
            };
            btn.addEventListener("click", handleExit);
            btn.addEventListener("pointerdown", handleExit);
        }

        window.addEventListener("resize", this.resizeHandler);
        // Delay slightly to ensure DOM is ready and window size is accurate
        requestAnimationFrame(() => this.resizePanel());
    }

    resizePanel() {
        if (!this.element) return;
        const panel = this.element.querySelector("#gameover-result-panel");
        if (!panel) return;

        const availableWidth = window.innerWidth * 0.9;
        // Total height of panel (1319) + gap (40) + button (228) = 1587px.
        // It sits 157px from top. Leave a small gap at the bottom of the screen.
        const availableHeight = window.innerHeight - 157 - 40;

        const scaleX = availableWidth / 876;
        const scaleY = availableHeight / 1587;

        // Scale down to a maximum of 85% of original size
        const scale = Math.min(0.85, scaleX, scaleY);

        panel.style.transform = `scale(${scale})`;
    }

    destroy() {
        window.removeEventListener("resize", this.resizeHandler);
        this.element?.remove();
    }
}
