import { EventBus } from "../core/EventBus.js";

export class TutorialPanel {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.element = null;
        this.resizeHandler = this.resizePanel.bind(this);
    }

    render() {
        const overlay = document.createElement("div");
        overlay.className = "result-overlay";
        overlay.style.paddingTop = "25px";

        const title = this.options.title || "วิธีการเล่น";
        const panelBorderColor = this.options.panelBorderColor || '#DE8D23';
        const panelHeaderColor = this.options.panelHeaderColor || '#FEA837';
        const primaryFontColor = this.options.primaryFontColor || '#945E17';

        overlay.innerHTML = `
            <div class="result-backdrop"></div>
            <div class="result-panel result-panel--tutorial" id="tutorial-result-panel">
                <div class="result-header">
                    <h2>${title}</h2>
                </div>
                <div style="
                    position: absolute;
                    top: 250px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 52px;
                    color: #945E17;
                    font-weight: 500;
                    white-space: nowrap;
                ">เกมคัดเลือกอาหารให้ถูกต้อง</div>
                <div style="
                    position: absolute;
                    top: 322px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 32px;
                    color: #DE8519;
                    font-weight: 500;
                    white-space: nowrap;
                ">เลือกอาหารที่สัตว์กินไม่ได้ออกจากสายพาน</div>
                <div style="
                    position: absolute;
                    top: 404px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 774px;
                    height: 386px;
                    background-color: #FCFFF9;
                    border: 3px solid #A3C58D;
                    border-radius: 50px;
                    box-sizing: border-box;
                ">
                    <div style="
                        position: absolute;
                        top: 50px;
                        left: 65px;
                        font-family: 'Noto Looped Thai', sans-serif;
                        font-size: 56px;
                        color: #4D9C22;
                        font-weight: 500;
                        white-space: nowrap;
                    ">สัตว์กินพืช</div>
                    <div style="
                        position: absolute;
                        top: 80px;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                    ">
                        <img src="assets/zoo-feeder/animal/icons/H_Cow.png" style="width: 220px; height: 220px; object-fit: contain;" />
                        <img src="assets/zoo-feeder/animal/icons/H_ele.png" style="width: 220px; height: 220px; object-fit: contain;" />
                        <img src="assets/zoo-feeder/animal/icons/H_Pan.png" style="width: 220px; height: 220px; object-fit: contain;" />
                    </div>
                </div>
                <button id="tutorial-start-button" class="result-btn-home result-btn-home--start result-btn-home--tutorial">เริ่มเล่นเกม</button>
            </div>
        `;

        this.element = overlay;
        this.root.appendChild(overlay);

        // Apply per-game panel colour overrides
        const panel = overlay.querySelector("#tutorial-result-panel");
        const header = overlay.querySelector(".result-header");
        if (panel && panelBorderColor) {
            panel.style.borderColor = panelBorderColor;
        }
        if (header && panelHeaderColor) {
            header.style.backgroundColor = panelHeaderColor;
        }

        const btn = overlay.querySelector("#tutorial-start-button");
        if (btn) {
            const handleStart = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.destroy();
                if (this.options.onStart) {
                    this.options.onStart();
                }
            };
            btn.addEventListener("click", handleStart);
            btn.addEventListener("pointerdown", handleStart);
        }

        window.addEventListener("resize", this.resizeHandler);
        // Delay slightly to ensure DOM is ready and window size is accurate
        requestAnimationFrame(() => this.resizePanel());
    }

    resizePanel() {
        if (!this.element) return;
        const panel = this.element.querySelector("#tutorial-result-panel");
        if (!panel) return;

        const availableWidth = window.innerWidth * 0.9;
        // Total height of panel (1700) + gap (40) + button (228) = 1968px.
        // It sits 25px from top. Leave a small gap at the bottom of the screen.
        const availableHeight = window.innerHeight - 25 - 40;

        const scaleX = availableWidth / 876;
        const scaleY = availableHeight / 1968;

        // Scale down to a maximum of 85% of original size
        const scale = Math.min(0.85, scaleX, scaleY);

        panel.style.transform = `scale(${scale})`;
    }

    destroy() {
        window.removeEventListener("resize", this.resizeHandler);
        this.element?.remove();
    }
}
