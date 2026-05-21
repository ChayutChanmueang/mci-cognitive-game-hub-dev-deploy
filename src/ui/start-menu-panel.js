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

        overlay.innerHTML = `
            <div class="result-backdrop"></div>
            <div class="result-panel" id="gameover-result-panel">
                <div class="result-header">
                    <h2>${title}</h2>
                </div>
                <div style="
                    position: absolute;
                    top: 240px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 40px;
                    font-weight: 500;
                    color: ${primaryFontColor};
                    text-align: center;
                    white-space: nowrap;
                ">${description}</div>
                <div class="result-picture" style="height: 520px; top: 320px;"></div>
                <div style="
                    position: absolute;
                    top: 890px;
                    left: 120px;
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 56px;
                    font-weight: 700;
                    color: ${primaryFontColor};
                ">วิธีการเล่น</div>
                <div style="
                    position: absolute;
                    top: 930px;
                    left: 120px;
                    right: 120px;
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 40px;
                    font-weight: 500;
                    color: ${secondaryFontColor};
                    line-height: 1.4;
                ">${instructions}</div>
                <div style="
                    position: absolute;
                    top: 1070px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 745px;
                    border-top: 4px dashed #E3E3E3CC;
                "></div>
                <div style="
                    position: absolute;
                    top: 1105px;
                    left: 120px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 56px;
                    font-weight: 700;
                ">
                    <span style="color: ${primaryFontColor};">ระดับ :</span>
                    <span style="color: #F6C234; margin-right: 16px;">${levelText}</span>
                    <div style="display: flex; gap: 8px; align-items: center; position: relative; top: -5px;">
                        ${starsHtml}
                    </div>
                </div>
                <div style="
                    position: absolute;
                    top: 1200px;
                    left: 120px;
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 40px;
                    font-weight: 500;
                    color: ${secondaryFontColor};
                ">${levelDetail}</div>
                <button id="result-exit-button" class="result-btn-home" style="
                    background: linear-gradient(to bottom, #7DD74C, #4A9D1D);
                    color: #FFFFFF;
                    box-shadow: inset 0 -10px 0 0 #42861D, 0 10px 20px rgba(0, 0, 0, 0.15);
                ">เริ่มเล่นเกม</button>
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
                this.destroy();
                EventBus.emit("startmenu:start-game");
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
