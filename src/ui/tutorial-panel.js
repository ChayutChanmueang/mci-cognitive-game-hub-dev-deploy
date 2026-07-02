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

        const title            = this.options.title            || "วิธีการเล่น";
        const description      = this.options.description      || "";
        const panelBorderColor = this.options.panelBorderColor || '#DE8D23';
        const panelHeaderColor = this.options.panelHeaderColor || '#FEA837';
        const primaryFontColor = this.options.primaryFontColor || '#945E17';
        const secondaryFontColor = this.options.secondaryFontColor || '#DE8519';

        // -------------------------------------------------------------------
        // Build category cards dynamically from theme data
        // -------------------------------------------------------------------
        const receiverSetting  = this.options.receiverSetting  || {};
        const itemSpriteLibrary = this.options.itemSpriteLibrary || {};
        const themeAssets      = this.options.themeAssets       || {};

        // Collect the categories that have a receiver (i.e. "acceptable" categories)
        const acceptedCategories = new Set(
            Object.values(receiverSetting).map(r => r.AcceptableCategory)
        );

        // Group receivers by their AcceptableCategory so that multiple receivers
        // sharing the same category appear on the SAME card with multiple icons.
        const categoryCardMap = {};
        for (const receiver of Object.values(receiverSetting)) {
            const cat = receiver.AcceptableCategory;
            if (!categoryCardMap[cat]) {
                const sprites = itemSpriteLibrary[cat] || [];
                categoryCardMap[cat] = {
                    label: receiver.Label || cat,
                    icons: [],
                    items: sprites.slice(0, 3).map(key => themeAssets[key] || ""),
                };
            }
            if (receiver.Icon) {
                categoryCardMap[cat].icons.push(receiver.Icon);
            }
        }

        // Categories that have NO receiver → shown in the "reject" card
        const rejectCategories = Object.keys(itemSpriteLibrary).filter(
            cat => !acceptedCategories.has(cat)
        );
        const rejectItems = rejectCategories.flatMap(cat =>
            (itemSpriteLibrary[cat] || []).slice(0, 3).map(key => themeAssets[key] || "")
        ).slice(0, 3);

        // Colour palette for accept cards (cycles if more than the list length)
        const cardPalettes = [
            { bg: '#FCFFF9', border: '#A3C58D', labelColor: '#4D9C22', badgeFill: '#6A9A4E' },
            { bg: '#FFFBF7', border: '#F9A347', labelColor: '#F9A347', badgeFill: '#F9A347' },
            { bg: '#F7FBFF', border: '#5B9FD4', labelColor: '#2A7CC7', badgeFill: '#4A9FE0' },
            { bg: '#FBF7FF', border: '#A67CD4', labelColor: '#7B4CC7', badgeFill: '#9A6AE0' },
        ];

        const buildCategoryCard = (catData, index, topOffset) => {
            const pal = cardPalettes[index % cardPalettes.length];
            const iconHtml = catData.icons
                .map(iconKey => themeAssets[iconKey] || iconKey)
                .filter(src => src)
                .map(src => `<img src="${src}" style="width: 220px; height: 220px; object-fit: contain;" />`)
                .join("");
            const itemImgs = catData.items
                .map(src => src ? `<img src="${src}" style="height: 100px; width: auto; object-fit: contain;" />` : "")
                .join("");

            return `
                <div style="
                    position: absolute;
                    top: ${topOffset}px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 774px;
                    height: 386px;
                    background-color: ${pal.bg};
                    border: 3px solid ${pal.border};
                    border-radius: 50px;
                    box-sizing: border-box;
                ">
                    <div style="
                        position: absolute;
                        top: 50px;
                        left: 65px;
                        font-family: 'Noto Looped Thai', sans-serif;
                        font-size: 56px;
                        color: ${pal.labelColor};
                        font-weight: 500;
                        white-space: nowrap;
                    ">${catData.label}</div>
                    <div style="
                        position: absolute;
                        top: 80px;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                    ">${iconHtml}</div>
                    <div style="position: absolute; top: 280px; left: 67px; width: 160px; height: 70px;">
                        <svg width="160" height="70" viewBox="0 0 160 70" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0;">
                            <path d="M 15 0 L 130 0 C 138 0, 142 3, 147 10 L 156 25 C 160 31, 160 39, 156 45 L 147 60 C 142 67, 138 70, 130 70 L 15 70 C 6.7 70, 0 63.3, 0 55 L 0 15 C 0 6.7, 6.7 0, 15 0 Z" fill="${pal.badgeFill}" />
                        </svg>
                        <div style="position: absolute; top: 0; left: 0; width: 145px; height: 70px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'Noto Looped Thai', sans-serif; font-size: 36px; font-weight: 700;">รับได้</div>
                    </div>
                    <div style="position: absolute; top: 265px; left: 257px; display: flex; align-items: center; gap: 15px; height: 100px;">
                        ${itemImgs}
                    </div>
                </div>`;
        };

        const buildRejectCard = (itemPaths, topOffset) => {
            const itemImgs = itemPaths
                .map(src => src ? `<img src="${src}" style="width: 170px; height: 170px; object-fit: contain;" />` : "")
                .join("");
            return `
                <div style="
                    position: absolute;
                    top: ${topOffset}px;
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
                        ">สิ่งที่ทิ้งออก</span>
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
                    ">${itemImgs}</div>
                </div>`;
        };

        // -------------------------------------------------------------------
        // Assemble the full HTML
        // -------------------------------------------------------------------
        const cardEntries = Object.values(categoryCardMap);
        const CARD_HEIGHT = 386;
        const CARD_GAP    = 30;
        const CARDS_START = 434;

        let cardsHtml = "";
        cardEntries.forEach((cardData, i) => {
            cardsHtml += buildCategoryCard(cardData, i, CARDS_START + i * (CARD_HEIGHT + CARD_GAP));
        });

        const rejectTopOffset  = CARDS_START + cardEntries.length * (CARD_HEIGHT + CARD_GAP);
        const rejectHtml       = rejectItems.length > 0 ? buildRejectCard(rejectItems, rejectTopOffset) : "";
        const totalRejectHeight = rejectItems.length > 0 ? 300 + CARD_GAP : 0;
        const totalPanelHeight  = rejectTopOffset + totalRejectHeight + 228; // 228 = button area

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
                    color: ${primaryFontColor};
                    font-weight: 500;
                    white-space: nowrap;
                ">${description}</div>
                <div style="
                    position: absolute;
                    top: 352px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: 'Noto Looped Thai', sans-serif;
                    font-size: 32px;
                    color: ${secondaryFontColor};
                    font-weight: 500;
                    white-space: nowrap;
                ">${this.options.subdescription || ""}</div>
                ${cardsHtml}
                ${rejectHtml}
                <button id="tutorial-start-button" class="result-btn-home result-btn-home--start result-btn-home--tutorial">เริ่มเล่นเกม</button>
            </div>
        `;

        this._totalPanelHeight = totalPanelHeight;
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
        requestAnimationFrame(() => this.resizePanel());
    }

    resizePanel() {
        if (!this.element) return;
        const panel = this.element.querySelector("#tutorial-result-panel");
        if (!panel) return;

        const availableWidth  = window.innerWidth * 0.9;
        const availableHeight = window.innerHeight - 25 - 40;

        const scaleX = availableWidth  / 876;
        const scaleY = availableHeight / (this._totalPanelHeight || 1968);

        const scale = Math.min(0.85, scaleX, scaleY);
        panel.style.transform = `scale(${scale})`;
    }

    destroy() {
        window.removeEventListener("resize", this.resizeHandler);
        this.element?.remove();
    }
}
