import { EventBus } from "../core/EventBus.js";

export class StartMenuPanel {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.element = null;
        this.resizeHandler = this.resizePanel.bind(this);
    }

    render() {
        const overlay = document.createElement("div");
        overlay.className = "result-overlay";

        const title = this.options.title || "คนเลี้ยงสัตว์";
        const description = this.options.description || "เกมคัดเลือกอาหารให้ถูกต้อง";
        const instructions = this.options.instructions || "แตะอาหารที่สัตว์ชนิดนั้นไม่สามารถกินได้ออกจากสายพาน";
        const level = this.options.level || 1;
        const levelDetail = this.options.levelDetail !== undefined
            ? this.options.levelDetail
            : `${level} สายพาน`;
        const panelBorderColor = this.options.panelBorderColor || null;
        const panelHeaderColor = this.options.panelHeaderColor || null;
        const primaryFontColor = this.options.primaryFontColor || '#945E17';
        const secondaryFontColor = this.options.secondaryFontColor || '#DE8519';
        const titleFontSize = this.options.titleFontSize || null;
        const coverImage = this.options.coverImage || null;
        const hideLevelInfo = this.options.hideLevelInfo || false;

        let levelText = "ง่าย";
        let starCount = 1;
        if (level === 2) {
            levelText = "ปานกลาง";
            starCount = 2;
        } else if (level === 3) {
            levelText = "ยาก";
            starCount = 3;
        }

        let starsHtml = "";
        for (let i = 1; i <= 3; i++) {
            const isYellow = i <= starCount;
            const src = isYellow ? "assets/common/ui_icon/star_yellow.png" : "assets/common/ui_icon/star_gray.png";
            starsHtml += `<img src="${src}" style="width: 62px; height: 60px; object-fit: contain;" />`;
        }

        const coverStyle = coverImage 
            ? `background-image: url('${coverImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;` 
            : "";

        overlay.innerHTML = `
            <div class="result-backdrop"></div>
            <div style="position: absolute; top: 16px; left: 16px; z-index: 100;">
                <md-icon-button id="start-menu-exit-button" aria-label="ออกจากเกม" style="--md-icon-button-icon-color: white;">
                    <md-icon class="material-symbols-rounded">arrow_back</md-icon>
                </md-icon-button>
            </div>
            <div class="result-panel" id="gameover-result-panel">
                <div class="result-header">
                    <h2 style="${titleFontSize ? `font-size: ${titleFontSize};` : ''}">${title}</h2>
                </div>
                <div class="result-description" style="color: ${primaryFontColor};">${description}</div>
                <div class="result-picture result-picture--start" style="${coverStyle}"></div>
                <div class="result-how-to-play-title" style="color: ${primaryFontColor};">วิธีการเล่น</div>
                <div class="result-how-to-play-text" style="color: ${secondaryFontColor};">${instructions}</div>
                ${hideLevelInfo ? "" : `
                <div class="result-divider"></div>
                <div class="result-level-info">
                    <span style="color: ${primaryFontColor};">ระดับ :</span>
                    <span style="color: #F6C234; margin-right: 16px;">${levelText}</span>
                    <div class="result-level-stars">
                        ${starsHtml}
                    </div>
                </div>
                <div class="result-level-detail" style="color: ${secondaryFontColor};">${levelDetail}</div>
                `}
                <button id="result-exit-button" class="result-btn-home result-btn-home--start">เริ่มเล่นเกม</button>
            </div>
        `;

        this.element = overlay;
        this.root.appendChild(overlay);

        // Apply per-game panel colour overrides
        const panel = overlay.querySelector("#gameover-result-panel");
        const header = overlay.querySelector(".result-header");
        if (panel && panelBorderColor) {
            panel.style.borderColor = panelBorderColor;
        }
        if (header && panelHeaderColor) {
            header.style.backgroundColor = panelHeaderColor;
        }

        const btn = overlay.querySelector("#result-exit-button");
        if (btn) {
            const handleExit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                EventBus.emit('audio:play', 'ui:click');
                this.destroy();
                EventBus.emit("startmenu:start-game");
            };
            btn.addEventListener("click", handleExit);
            btn.addEventListener("pointerdown", handleExit);
        }

        const backBtn = overlay.querySelector("#start-menu-exit-button");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                EventBus.emit('audio:play', 'ui:click');
                // Emitting this will trigger the main.js confirmation popup
                EventBus.emit("minigame:exit-request");
            });
        }

        window.addEventListener("resize", this.resizeHandler);
        // Delay slightly to ensure DOM is ready and window size is accurate
        requestAnimationFrame(() => {
            this.resizePanel();
            EventBus.emit('audio:play', 'ui:popup');
        });
    }

    resizePanel() {
        if (!this.element) return;
        const panel = this.element.querySelector("#gameover-result-panel");
        if (!panel) return;

        const availableWidth = window.innerWidth * 0.9;
        // Total height of panel (1319) + gap (40) + button (228) = 1587px.
        // It sits 112px from top. Leave a small gap at the bottom of the screen.
        const availableHeight = window.innerHeight - 112 - 40;

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
