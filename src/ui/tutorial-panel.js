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
                    top: 280px;
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
                    top: 352px;
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
                    top: 434px;
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
                    <div style="position: absolute; top: 280px; left: 67px; width: 160px; height: 70px;">
                        <svg width="160" height="70" viewBox="0 0 160 70" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0;">
                            <path d="M 15 0 L 130 0 C 138 0, 142 3, 147 10 L 156 25 C 160 31, 160 39, 156 45 L 147 60 C 142 67, 138 70, 130 70 L 15 70 C 6.7 70, 0 63.3, 0 55 L 0 15 C 0 6.7, 6.7 0, 15 0 Z" fill="#6A9A4E" />
                        </svg>
                        <div style="position: absolute; top: 0; left: 0; width: 145px; height: 70px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'Noto Looped Thai', sans-serif; font-size: 36px; font-weight: 700;">กินได้</div>
                    </div>
                    <div style="position: absolute; top: 265px; left: 257px; display: flex; align-items: center; gap: 15px; height: 100px;">
                        <img src="assets/zoo-feeder/food/Apple.png" style="height: 100px; width: auto; object-fit: contain;" />
                        <img src="assets/zoo-feeder/food/Corn.png" style="height: 100px; width: auto; object-fit: contain;" />
                        <img src="assets/zoo-feeder/food/Plant.png" style="height: 100px; width: auto; object-fit: contain;" />
                    </div>
                </div>
                <div style="
                    position: absolute;
                    top: 850px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 774px;
                    height: 386px;
                    background-color: #FFFBF7;
                    border: 3px solid #F9A347;
                    border-radius: 50px;
                    box-sizing: border-box;
                ">
                    <div style="
                        position: absolute;
                        top: 50px;
                        left: 65px;
                        font-family: 'Noto Looped Thai', sans-serif;
                        font-size: 56px;
                        color: #F9A347;
                        font-weight: 500;
                        white-space: nowrap;
                    ">สัตว์กินเนื้อ</div>
                    <div style="
                        position: absolute;
                        top: 80px;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                    ">
                        <img src="assets/zoo-feeder/animal/icons/H_Bear.png" style="width: 220px; height: 220px; object-fit: contain;" />
                        <img src="assets/zoo-feeder/animal/icons/H_Fox.png" style="width: 220px; height: 220px; object-fit: contain;" />
                        <img src="assets/zoo-feeder/animal/icons/H_Li.png" style="width: 220px; height: 220px; object-fit: contain;" />
                    </div>
                    <div style="position: absolute; top: 280px; left: 67px; width: 160px; height: 70px;">
                        <svg width="160" height="70" viewBox="0 0 160 70" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0;">
                            <path d="M 15 0 L 130 0 C 138 0, 142 3, 147 10 L 156 25 C 160 31, 160 39, 156 45 L 147 60 C 142 67, 138 70, 130 70 L 15 70 C 6.7 70, 0 63.3, 0 55 L 0 15 C 0 6.7, 6.7 0, 15 0 Z" fill="#F9A347" />
                        </svg>
                        <div style="position: absolute; top: 0; left: 0; width: 145px; height: 70px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'Noto Looped Thai', sans-serif; font-size: 36px; font-weight: 700;">กินได้</div>
                    </div>
                    <div style="position: absolute; top: 265px; left: 257px; display: flex; align-items: center; gap: 15px; height: 100px;">
                        <img src="assets/zoo-feeder/food/Beef.png" style="height: 100px; width: auto; object-fit: contain;" />
                        <img src="assets/zoo-feeder/food/Chick.png" style="height: 100px; width: auto; object-fit: contain;" />
                        <img src="assets/zoo-feeder/food/Fish.png" style="height: 100px; width: auto; object-fit: contain;" />
                    </div>
                </div>
                <div style="
                    position: absolute;
                    top: 1266px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 774px;
                    height: 300px;
                    background-color: #FFF9F9;
                    border: 3px solid #DF5F5F;
                    border-radius: 50px;
                    box-sizing: border-box;
                ">
                    <div style="
                        position: absolute;
                        top: 40px;
                        left: 65px;
                        display: flex;
                        align-items: center;
                        gap: 20px;
                    ">
                        <span style="
                            font-family: 'Noto Looped Thai', sans-serif;
                            font-size: 56px;
                            color: #DF5F5F;
                            font-weight: 500;
                            white-space: nowrap;
                        ">สิ่งที่กินไม่ได้</span>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#DF5F5F"/>
                            <path d="M8 8L16 16M16 8L8 16" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div style="
                        position: absolute;
                        top: 100px;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                    ">
                        <img src="assets/zoo-feeder/food/Battery.png" style="width: 170px; height: 170px; object-fit: contain;" />
                        <img src="assets/zoo-feeder/food/Boot.png" style="width: 170px; height: 170px; object-fit: contain;" />
                        <img src="assets/zoo-feeder/food/Bottle.png" style="width: 170px; height: 170px; object-fit: contain;" />
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
