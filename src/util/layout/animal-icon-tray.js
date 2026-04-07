import Phaser from "phaser";

export default class AnimalIconTray extends Phaser.GameObjects.Container {
    constructor(scene, x, y, onSelected, onUnSelected, options = {}) {
        super(scene, x, y);

        this.onSelected = onSelected;
        this.onUnSelected = onUnSelected;
        this.itemSelected = null;
        this.scene = scene;
        this.items = [];
        this.itemViews = [];
        this.metrics = {
            rowCount: 0,
            totalHeight: 0,
            footerBounds: { x: 0, y: 0, width: 0, height: 0 }
        };
        this.options = {
            width: 600,
            maxItemsPerRow: 6,
            itemWidth: 92,
            itemHeight: 92,
            itemGap: 16,
            rowGap: 16,
            padding: 24,
            trayRadius: 28,
            trayFillColor: 0xffffff,
            trayFillAlpha: 1,
            trayStrokeColor: 0x5a697e,
            trayStrokeAlpha: 1,
            trayStrokeWidth: 4,
            itemRadius: 18,
            itemFillColor: 0xffffff,
            itemFillAlpha: 1,
            itemStrokeColor: 0x5a697e,
            itemStrokeAlpha: 1,
            itemStrokeWidth: 4,
            itemTextStyle: {
                fontFamily: '"Noto Color Emoji", "Segoe UI Emoji", sans-serif',
                fontSize: "56px"
            },
            footerReservedHeight: 0,
            footerOffset: 0,
            items: [],
            createItemContent: null
        };

        scene.add.existing(this);
        this.setConfig(options);
    }

    setConfig(options = {}) {
        this.options = {
            ...this.options,
            ...options,
            padding: normalizePadding(options.padding ?? this.options.padding)
        };

        if ("items" in options) {
            this.items = [...options.items];
        }

        this.rebuild();

        return this;
    }

    setItems(items = []) {
        this.items = [...items];
        this.rebuild();

        return this;
    }

    setFooterReservation(height, offset = this.options.footerOffset) {
        return this.setConfig({
            footerReservedHeight: height,
            footerOffset: offset
        });
    }

    measureHeight(itemCount = this.items.length) {
        const safeItemsPerRow = Math.max(1, this.options.maxItemsPerRow);
        const rowCount = itemCount > 0 ? Math.ceil(itemCount / safeItemsPerRow) : 0;
        const iconAreaHeight = rowCount > 0
            ? (rowCount * this.options.itemHeight) + ((rowCount - 1) * this.options.rowGap)
            : 0;

        return this.options.padding.top
            + iconAreaHeight
            + this.options.footerOffset
            + this.options.footerReservedHeight
            + this.options.padding.bottom;
    }

    rebuild() {
        this.removeAll(true);
        this.itemViews = [];

        const {
            width,
            maxItemsPerRow,
            itemWidth,
            itemHeight,
            itemGap,
            rowGap,
            padding,
            trayRadius,
            trayFillColor,
            trayFillAlpha,
            trayStrokeColor,
            trayStrokeAlpha,
            trayStrokeWidth,
            itemRadius,
            itemFillColor,
            itemFillAlpha,
            itemStrokeColor,
            itemStrokeAlpha,
            itemStrokeWidth,
            itemTextStyle,
            footerReservedHeight,
            footerOffset,
            createItemContent
        } = this.options;

        const safeItemsPerRow = Math.max(1, maxItemsPerRow);
        const rowCount = this.items.length > 0 ? Math.ceil(this.items.length / safeItemsPerRow) : 0;
        const iconAreaHeight = rowCount > 0
            ? (rowCount * itemHeight) + ((rowCount - 1) * rowGap)
            : 0;
        const totalHeight = this.measureHeight();
        const background = this.scene.add.graphics();

        background.fillStyle(trayFillColor, trayFillAlpha);
        background.lineStyle(trayStrokeWidth, trayStrokeColor, trayStrokeAlpha);
        background.fillRoundedRect(0, 0, width, totalHeight, trayRadius);
        background.strokeRoundedRect(0, 0, width, totalHeight, trayRadius);

        this.add(background);
        this.setSize(width, totalHeight);

        for (let row = 0; row < rowCount; row++) {
            const startIndex = row * safeItemsPerRow;
            const rowItems = this.items.slice(startIndex, startIndex + safeItemsPerRow);
            const rowWidth = (rowItems.length * itemWidth) + (Math.max(0, rowItems.length - 1) * itemGap);
            const rowStartX = (width - rowWidth) / 2;
            const centerY = padding.top + (row * (itemHeight + rowGap)) + (itemHeight / 2);

            for (let column = 0; column < rowItems.length; column++) {
                const item = rowItems[column];
                const index = startIndex + column;
                const centerX = rowStartX + (column * (itemWidth + itemGap)) + (itemWidth / 2);
                const itemContainer = this.scene.add.container(centerX, centerY);
                const itemBackground = this.scene.add.graphics();

                itemBackground.fillStyle(itemFillColor, itemFillAlpha);
                itemBackground.lineStyle(itemStrokeWidth, itemStrokeColor, itemStrokeAlpha);
                itemBackground.fillRoundedRect(-(itemWidth / 2), -(itemHeight / 2), itemWidth, itemHeight, itemRadius);
                itemBackground.strokeRoundedRect(-(itemWidth / 2), -(itemHeight / 2), itemWidth, itemHeight, itemRadius);

                itemContainer.add(itemBackground);

                const content = createItemContent
                    ? createItemContent(this.scene, item, index, { width: itemWidth, height: itemHeight })
                    : this.createDefaultItemContent(item, itemTextStyle);

                if (Array.isArray(content)) {
                    itemContainer.add(content);
                }
                else if (content) {
                    itemContainer.add(content);
                }

                itemContainer.setSize(itemWidth, itemHeight);
                itemContainer.setInteractive(
                    new Phaser.Geom.Rectangle(0, 0, itemWidth, itemHeight),
                    Phaser.Geom.Rectangle.Contains
                );
                itemContainer.on("pointerdown", () => {
                    this.emit("itemclick", item, index, itemContainer);
                    const newData = { id: item.id, icon: item.icon, index: index };

                    if (this.itemSelected != null && this.itemSelected.id !== newData.id){
                        this.onUnSelected(this.itemSelected);
                    }

                    this.itemSelected = newData;
                    this.onSelected(this.itemSelected);
                });

                this.add(itemContainer);
                this.itemViews.push({
                    index,
                    item,
                    container: itemContainer
                });
            }
        }

        this.metrics = {
            rowCount,
            totalHeight,
            footerBounds: {
                x: 0,
                y: padding.top + iconAreaHeight + footerOffset,
                width,
                height: footerReservedHeight
            }
        };

        return this;
    }

    createDefaultItemContent(item, style) {
        return this.scene.add.text(
            0,
            0,
            item.icon ?? item.label ?? "?",
            style
        ).setOrigin(0.5);
    }

    getMetrics() {
        return {
            ...this.metrics
        };
    }

    getFooterBounds(worldSpace = false) {
        if (!worldSpace) {
            return {
                ...this.metrics.footerBounds
            };
        }

        return {
            x: this.x + this.metrics.footerBounds.x,
            y: this.y + this.metrics.footerBounds.y,
            width: this.metrics.footerBounds.width,
            height: this.metrics.footerBounds.height
        };
    }

    getItemViews() {
        return [...this.itemViews];
    }
}

function normalizePadding(padding) {
    if (typeof padding === "number") {
        return {
            top: padding,
            right: padding,
            bottom: padding,
            left: padding
        };
    }

    return {
        top: padding?.top ?? 0,
        right: padding?.right ?? 0,
        bottom: padding?.bottom ?? 0,
        left: padding?.left ?? 0
    };
}
