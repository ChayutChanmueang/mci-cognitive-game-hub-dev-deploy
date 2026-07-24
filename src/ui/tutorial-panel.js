import { EventBus } from "../core/EventBus.js";

export class TutorialPanel {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.element = null;
        this.resizeHandler = this.resizePanel.bind(this);
        this.pages = [];
        this.currentPage = 0;
    }

    render() {
        const overlay = document.createElement("div");
        overlay.className = "result-overlay";
        overlay.style.alignItems = "flex-start";
        overlay.style.paddingTop = "0";

        const title = this.options.title || "วิธีการเล่น";
        const description = this.options.description || "";
        const panelBorderColor = this.options.panelBorderColor || '#DE8D23';
        const panelHeaderColor = this.options.panelHeaderColor || '#FEA837';
        const primaryFontColor = this.options.primaryFontColor || '#945E17';
        const secondaryFontColor = this.options.secondaryFontColor || '#DE8519';

        // -------------------------------------------------------------------
        // Build category cards dynamically from theme data
        // -------------------------------------------------------------------
        const receiverSetting = this.options.receiverSetting || {};
        const itemSpriteLibrary = this.options.itemSpriteLibrary || {};
        const themeAssets = this.options.themeAssets || {};

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
                    cat: cat,
                    label: receiver.Label || cat,
                    icons: [],
                    items: sprites.slice(0, 3).map(key => ({ key: key, src: themeAssets[key] || "" })),
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
            (itemSpriteLibrary[cat] || []).slice(0, 3).map(key => ({ key: key, src: themeAssets[key] || "" }))
        ).slice(0, 3);

        // Colour palette for accept cards (cycles if more than the list length)
        const cardPalettes = [
            { bg: '#FCFFF9', border: '#A3C58D', labelColor: '#4D9C22', badgeFill: '#6A9A4E' },
            { bg: '#FFFBF7', border: '#F9A347', labelColor: '#F9A347', badgeFill: '#F9A347' },
            { bg: '#F7FBFF', border: '#5B9FD4', labelColor: '#2A7CC7', badgeFill: '#4A9FE0' },
            { bg: '#FBF7FF', border: '#A67CD4', labelColor: '#7B4CC7', badgeFill: '#9A6AE0' },
        ];

        const categoryStyles = this.options.categoryStyles || {};

        const buildItemChip = (item, itemNames, { isFigma, rotateDeg = 0 }) => {
            if (!item.src) return "";
            const itemMarginTop = isFigma ? (rotateDeg ? "-55px" : "-45px") : "0px";
            const transformStyle = rotateDeg ? ` transform: rotate(${rotateDeg}deg);` : "";
            const itemGap = isFigma ? "20px" : "10px";
            return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: ${itemGap};">
                    <img src="${item.src}" style="height: 175px; width: auto; object-fit: contain; filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.25)); margin-top: ${itemMarginTop};${transformStyle}" />
                    ${itemNames[item.key] ? `<span style="font-family: 'Noto Sans Thai Looped', sans-serif; font-size: 40px; color: #81512E; text-shadow: -3px -3px 0 #FFF, 3px -3px 0 #FFF, -3px 3px 0 #FFF, 3px 3px 0 #FFF, -3px 0px 0 #FFF, 3px 0px 0 #FFF, 0px -3px 0 #FFF, 0px 3px 0 #FFF; font-weight: 600; text-align: center; margin-top: -5px;">${itemNames[item.key]}</span>` : ""}
                </div>
            `;
        };

        const buildCategoryCard = (catData, index) => {
            const catStyle = categoryStyles[catData.cat] || {};
            const titleBgColor = catStyle.titleBgColor || '#7DC850';
            const titleShadow = catStyle.titleShadow || 'inset 0 3.56px 14.25px #8EFF4A, 0 2.38px 2.97px #BF5B1361';
            const itemsBgColor = catStyle.itemsBgColor || 'rgba(73, 205, 56, 0.2)';

            const pal = cardPalettes[index % cardPalettes.length];
            const isFigma = this.options.variant === "figma";
            const iconHtml = catData.icons
                .map(iconKey => themeAssets[iconKey] || iconKey)
                .filter(src => src)
                .map(src => {
                    const lowerSrc = src.toLowerCase();
                    const isLion = lowerSrc.includes('lion') || lowerSrc.includes('_li.png');
                    const isBear = lowerSrc.includes('bear');
                    const isFox = lowerSrc.includes('fox');
                    
                    let figmaHeight = 273;
                    let normalHeight = 328.9;
                    
                    if (isLion) {
                        figmaHeight = 250;
                        normalHeight = 250;
                    } else if (isBear) {
                        figmaHeight += 10;
                        normalHeight += 10;
                    }
                    
                    let imgStyle = `height: ${isFigma ? figmaHeight + 'px' : normalHeight + 'px'}; width: auto; object-fit: contain; filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.25));`;
                    if (isFigma && isLion) {
                        imgStyle += ` margin-top: 10px;`;
                    } else if (isFigma && isFox) {
                        imgStyle += ` margin-left: 20px; margin-right: -20px;`;
                    }
                    
                    return `<img src="${src}" style="${imgStyle}" />`;
                })
                .join("");
            const itemNames = this.options.itemNames || {};
            const itemImgs = catData.items
                .map(item => buildItemChip(item, itemNames, { isFigma }))
                .join("");

            const titlePadding = isFigma ? "0 38px" : "0 45px";
            const iconRowGap = isFigma ? "0px" : "20px";
            const chipContainerRadius = isFigma ? "52px" : "70px";
            const chipContainerPadding = isFigma ? "56px 52px 26px" : "26px 52px";
            const chipAlignItems = isFigma ? "flex-end" : "center";
            const captionGap = isFigma ? "45px" : "20px";

            return `
                <div style="
                    position: relative;
                    width: 774px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-sizing: border-box;
                ">
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        height: 114px;
                        padding: ${titlePadding};
                        background-color: ${titleBgColor};
                        border-radius: 30.88px;
                        box-shadow: ${titleShadow};
                        font-family: 'Noto Sans Thai Looped', sans-serif;
                        font-size: 60px;
                        font-weight: 600;
                        color: #FFFFFF;
                        white-space: nowrap;
                        margin-bottom:0px;
                    ">${catData.label}</div>
                    <div style="
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        gap: ${iconRowGap};
                        margin-bottom: 20px;
                        ${isFigma && catData.cat === 'Meat' ? 'transform: translateX(20px);' : ''}
                    ">${iconHtml}</div>
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${captionGap};">
                        <span style="font-family: 'Noto Sans Thai Looped', sans-serif; font-size: 48px; color: #945E17; font-weight: 500;">
                            ${this.options.acceptText || "สิ่งที่รับได้ :"}
                        </span>
                        <div style="display: flex; align-items: ${chipAlignItems}; justify-content: center; gap: 26px; background-color: ${itemsBgColor}; border-radius: ${chipContainerRadius}; padding: ${chipContainerPadding};">
                            ${itemImgs}
                        </div>
                    </div>
                </div>`;
        };

        const buildRejectCard = (rejectItems) => {
            const isFigma = this.options.variant === "figma";
            const iconHtml = isFigma 
                ? `<img src="assets/zoo-feeder/etc/Garbage.png" style="height: 307.6px; width: auto; object-fit: contain; filter: drop-shadow(0px 14px 5px rgba(80,80,80,0.25));" />`
                : `<img src="assets/zoo-feeder/etc/Garbage.png" style="width: 246.5px; height: 246.5px; object-fit: contain;" />`;
            const itemNames = this.options.itemNames || {};
            const rotations = [-8, 0, 10];
            const itemImgs = rejectItems
                .map((item, idx) => buildItemChip(item, itemNames, { isFigma, rotateDeg: isFigma ? rotations[idx % rotations.length] : 0 }))
                .join("");

            const titlePadding = isFigma ? "0 38px" : "0 45px";
            const iconRowGap = isFigma ? "0px" : "20px";
            const chipContainerRadius = isFigma ? "52px" : "70px";
            const chipContainerPadding = isFigma ? "56px 52px 26px" : "26px 52px";
            const chipAlignItems = isFigma ? "flex-end" : "center";
            const captionGap = isFigma ? "45px" : "20px";

            return `
                <div style="
                    position: relative;
                    width: 774px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-sizing: border-box;
                ">
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        height: 114px;
                        padding: ${titlePadding};
                        background-color: #F04E4E;
                        border-radius: 30.88px;
                        box-shadow: inset 0px 3px 12px 0px #FD7979, 0px 2px 2.5px 0px #BF5B1361;
                        font-family: 'Noto Sans Thai Looped', sans-serif;
                        font-size: 60px;
                        font-weight: 600;
                        color: #FFFFFF;
                        white-space: nowrap;
                        margin-bottom: ${isFigma ? '20px' : '46px'};
                    ">สิ่งที่กินไม่ได้</div>
                    <div style="
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        gap: ${iconRowGap};
                        margin-bottom: 20px;
                    ">${iconHtml}</div>
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${captionGap};">
                        <span style="font-family: 'Noto Sans Thai Looped', sans-serif; font-size: 48px; color: #945E17; font-weight: 500;">
                            ${this.options.rejectText || "ของที่ต้องคัดออก :"}
                        </span>
                        <div style="display: flex; align-items: ${chipAlignItems}; justify-content: center; gap: 26px; background-color: #F9A97033; border-radius: ${chipContainerRadius}; padding: ${chipContainerPadding};">
                            ${itemImgs}
                        </div>
                    </div>
                </div>`;
        };

        // -------------------------------------------------------------------
        // Assemble pages
        // -------------------------------------------------------------------
        const cardEntries = Object.values(categoryCardMap);

        this.pages = [];
        cardEntries.forEach((cardData, i) => {
            this.pages.push(buildCategoryCard(cardData, i));
        });

        if (rejectItems.length > 0) {
            this.pages.push(buildRejectCard(rejectItems));
        }

        const isFigma = this.options.variant === "figma";
        const wrapperClass = isFigma ? "tutorial-wrapper tutorial-wrapper--figma" : "tutorial-wrapper";
        const panelClass = isFigma ? "result-panel dynamic-panel result-panel--tutorial result-panel--tutorial-figma" : "result-panel dynamic-panel result-panel--tutorial";
        const navRowClass = isFigma ? "tutorial-nav-row tutorial-nav-row--figma" : "tutorial-nav-row";
        const navBtnClass = isFigma ? "result-btn-home tutorial-nav-btn tutorial-nav-btn--figma" : "result-btn-home tutorial-nav-btn";
        const descFontSize = isFigma ? "56px" : "52px";
        const subDescFontSize = isFigma ? "44px" : "32px";
        const subDescMarginTop = isFigma ? "4px" : "18px";
        const pageContentGap = isFigma ? "20px" : "30px";

        overlay.innerHTML = `
            <div class="result-backdrop"></div>
            <div class="${wrapperClass}" id="tutorial-wrapper">
                <div class="${panelClass}" id="tutorial-result-panel">
                    <div class="result-header">
                        <h2>${title}</h2>
                    </div>
                    <div style="
                        position: relative;
                        width: 90%;
                        text-align: center;
                        font-family: 'Noto Sans Thai Looped', sans-serif;
                        font-size: ${descFontSize};
                        color: ${primaryFontColor};
                        font-weight: 500;
                        white-space: normal;
                        line-height: 1.2;
                        margin-top: 35px;
                    ">${description}</div>
                    ${this.options.subdescription ? `
                    <div style="
                        position: relative;
                        width: 90%;
                        text-align: center;
                        font-family: 'Noto Sans Thai Looped', sans-serif;
                        font-size: ${subDescFontSize};
                        color: ${secondaryFontColor};
                        font-weight: 500;
                        white-space: normal;
                        line-height: 1.3;
                        margin-top: ${subDescMarginTop};
                    ">${this.options.subdescription}</div>` : ""}
                    <div id="tutorial-page-content" style="
                        display: flex;
                        flex-direction: column;
                        gap: ${pageContentGap};
                        margin-top: 20px;
                        align-items: center;
                        width: 100%;
                    ">
                        <!-- Page content injected here -->
                    </div>
                </div>
                <div class="${navRowClass}">
                    <button id="tutorial-back-button" class="${navBtnClass} tutorial-nav-btn--back">ย้อนกลับ</button>
                    <button id="tutorial-forward-button" class="${navBtnClass} tutorial-nav-btn--forward">ถัดไป</button>
                </div>
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
        // Override the fixed base .result-panel height so the panel shrinks to fit content
        if (panel) {
            panel.style.height = 'auto';
            if (this.options.variant === "figma") {
                panel.style.paddingBottom = "45px";
            }
        }

        const backBtn = overlay.querySelector("#tutorial-back-button");
        const forwardBtn = overlay.querySelector("#tutorial-forward-button");
        const pageContent = overlay.querySelector("#tutorial-page-content");

        const renderPage = (index) => {
            if (index < 0 || index >= this.pages.length) return;
            this.currentPage = index;
            pageContent.innerHTML = this.pages[this.currentPage];

            // Update Back Button
            if (this.currentPage === 0) {
                backBtn.classList.add("tutorial-nav-btn--hidden");
            } else {
                backBtn.classList.remove("tutorial-nav-btn--hidden");
            }

            // Update Forward/Start Button
            if (this.currentPage === this.pages.length - 1) {
                forwardBtn.textContent = this.options.startButtonText || "เริ่มเล่นเกม";
                forwardBtn.classList.remove("tutorial-nav-btn--forward");
                forwardBtn.classList.add("tutorial-nav-btn--start");
            } else {
                forwardBtn.textContent = "ถัดไป";
                forwardBtn.classList.remove("tutorial-nav-btn--start");
                forwardBtn.classList.add("tutorial-nav-btn--forward");
            }

            // Optional: call resizePanel to adapt to any height differences, though we use fixed height mostly
            setTimeout(() => this.resizePanel(), 0);
        };

        let lastActionTime = 0;

        if (backBtn) {
            const handleBack = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (Date.now() - lastActionTime < 200) return;
                lastActionTime = Date.now();

                if (this.currentPage > 0) {
                    renderPage(this.currentPage - 1);
                }
            };
            backBtn.addEventListener("click", handleBack);
            backBtn.addEventListener("pointerdown", handleBack);
        }

        if (forwardBtn) {
            const handleForward = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (Date.now() - lastActionTime < 200) return;
                lastActionTime = Date.now();

                if (this.currentPage < this.pages.length - 1) {
                    renderPage(this.currentPage + 1);
                } else {
                    this.destroy();
                    if (this.options.onStart) {
                        this.options.onStart();
                    }
                }
            };
            forwardBtn.addEventListener("click", handleForward);
            forwardBtn.addEventListener("pointerdown", handleForward);
        }

        // Render initial page
        renderPage(0);

        window.addEventListener("resize", this.resizeHandler);
        requestAnimationFrame(() => this.resizePanel());
    }

    resizePanel() {
        if (!this.element) return;
        const wrapper = this.element.querySelector("#tutorial-wrapper");
        if (!wrapper) return;

        // Briefly remove transform to measure true layout dimensions
        wrapper.style.transform = 'none';
        wrapper.style.marginTop = '0px';

        const actualWidth = wrapper.offsetWidth || 876;
        const actualHeight = wrapper.offsetHeight || 1200;

        const widthMultiplier = this.options.variant === "figma" ? 0.95 : 0.9;
        const availableWidth = window.innerWidth * widthMultiplier;
        const availableHeight = window.innerHeight - 25 - 40;

        const scaleX = availableWidth / actualWidth;
        const scaleY = availableHeight / actualHeight;

        // Scale down only when content doesn't fit; never scale up beyond 1.0
        const scale = Math.min(1.0, scaleX, scaleY);

        // Manually calculate the exact top margin needed to perfectly center the SCALED content
        const scaledHeight = actualHeight * scale;
        const emptyVerticalSpace = window.innerHeight - scaledHeight;
        let marginTop = Math.max(0, emptyVerticalSpace / 2);

        wrapper.style.transformOrigin = "top center";
        wrapper.style.marginTop = `${marginTop}px`;
        wrapper.style.transform = `scale(${scale})`;
    }

    destroy() {
        window.removeEventListener("resize", this.resizeHandler);
        this.element?.remove();
    }
}
