import Phaser from "phaser";
import { createThaiText, getThaiFontFamily } from "../thai-text.js";
import Theme from "../game-theme.js";

export default class InlineContentLayout extends Phaser.GameObjects.Container {
    constructor(scene, x, y, items = [], options = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.items = Array.isArray(items) ? [...items] : [];
        this.options = this.buildOptions(options);
        this.itemContainers = [];

        scene.add.existing(this);
        this.rebuild();
    }

    buildOptions(options = {}) {
        return {
            width: 0,
            height: 0,
            gap: 18,
            justify: "center",
            align: "center",
            textStyle: {
                fontFamily: getThaiFontFamily(),
                fontSize: "44px",
                fontStyle: "bold",
                color: Theme.toCssColor(Theme.colors.onSurface)
            },
            ...options,
            textStyle: {
                fontFamily: getThaiFontFamily(),
                fontSize: "44px",
                fontStyle: "bold",
                color: Theme.toCssColor(Theme.colors.onSurface),
                ...(options.textStyle ?? {})
            }
        };
    }

    setItems(items = []) {
        this.items = Array.isArray(items) ? [...items] : [];
        return this.rebuild();
    }

    setLayoutOptions(options = {}) {
        this.options = this.buildOptions({
            ...this.options,
            ...options,
            textStyle: {
                ...this.options.textStyle,
                ...(options.textStyle ?? {})
            }
        });
        return this.rebuild();
    }

    rebuild() {
        this.removeAll(true);
        this.itemContainers = this.items
            .map((item, index) => this.createItemContainer(item, index))
            .filter(Boolean);

        const gapTotal = Math.max(0, this.itemContainers.length - 1) * this.options.gap;
        const contentWidth = this.itemContainers.reduce((width, item) => width + item.width, 0) + gapTotal;
        const contentHeight = this.itemContainers.reduce((height, item) => Math.max(height, item.height), 0);
        const width = Math.max(this.options.width, contentWidth);
        const height = Math.max(this.options.height, contentHeight);
        let cursorX = this.resolveStartX(width, contentWidth);

        for (const item of this.itemContainers) {
            item.setPosition(cursorX, this.resolveY(height, item.height));
            this.add(item);
            cursorX += item.width + this.options.gap;
        }

        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;
        this.setSize(width, height);

        return this;
    }

    createItemContainer(item, index) {
        const object = this.createItemObject(item, index);

        if (!object) {
            return null;
        }

        const bounds = object.getBounds();
        const width = Math.max(1, bounds.width || object.displayWidth || object.width || 1);
        const height = Math.max(1, bounds.height || object.displayHeight || object.height || 1);
        const container = this.scene.add.container(0, 0);

        object.setPosition?.(object.x - bounds.x, object.y - bounds.y);
        container.add(object);
        container.setSize(width, height);

        return container;
    }

    createItemObject(item, index) {
        if (!item) {
            return null;
        }

        if (typeof item.create === "function") {
            return item.create(this.scene, item, index);
        }

        if (item.object) {
            return item.object;
        }

        if (item.texture) {
            const image = this.scene.add.image(0, 0, item.texture, item.frame);
            image.setOrigin(0.5);

            if (item.displayWidth || item.displayHeight) {
                image.setDisplaySize(
                    item.displayWidth ?? image.displayWidth,
                    item.displayHeight ?? image.displayHeight
                );
            }

            return image;
        }

        return createThaiText(
            this.scene,
            0,
            0,
            item.text ?? "",
            {
                ...this.options.textStyle,
                ...(item.style ?? {})
            },
            {
                origin: [0, 0],
                ...(item.textOptions ?? {})
            }
        );
    }

    resolveStartX(width, contentWidth) {
        if (this.options.justify === "right" || this.options.justify === "end") {
            return width - contentWidth;
        }

        if (this.options.justify === "center") {
            return (width - contentWidth) / 2;
        }

        return 0;
    }

    resolveY(height, itemHeight) {
        if (this.options.align === "bottom" || this.options.align === "end") {
            return height - itemHeight;
        }

        if (this.options.align === "center") {
            return (height - itemHeight) / 2;
        }

        return 0;
    }

    getMetrics() {
        return {
            width: this.width,
            height: this.height,
            contentWidth: this.contentWidth,
            contentHeight: this.contentHeight
        };
    }
}
