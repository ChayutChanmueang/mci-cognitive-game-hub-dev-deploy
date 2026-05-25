import Phaser from "phaser";
import Theme from "../game-theme.js";

export default class ShadowRoundedPanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, options = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.panelWidth = width;
        this.panelHeight = height;
        this.options = this.buildOptions(options);

        scene.add.existing(this);
        this.setDepth(this.options.depth);
        this.redraw();
    }

    buildOptions(options = {}) {
        return {
            fillColor: Theme.colors.surfaceContainer,
            fillAlpha: 1,
            strokeColor: Theme.colors.outline,
            strokeAlpha: 1,
            strokeWidth: 0,
            radius: Theme.borderRadius.large,
            origin: [0.5, 0.5],
            depth: 0,
            shadows: [
                {
                    offsetX: 0,
                    offsetY: 14,
                    spread: 2,
                    color: Theme.colors.overlay,
                    alpha: 0.16
                }
            ],
            ...options
        };
    }

    redraw(options = null) {
        if (options) {
            this.options = this.buildOptions({
                ...this.options,
                ...options
            });
            this.setDepth(this.options.depth);
        }

        this.removeAll(true);

        for (const shadow of this.options.shadows ?? []) {
            this.add(this.createLayer({
                fillColor: shadow.color ?? Theme.colors.overlay,
                fillAlpha: shadow.alpha ?? 0.16,
                strokeWidth: 0,
                radius: shadow.radius ?? this.options.radius + (shadow.spread ?? 0),
                offsetX: shadow.offsetX ?? 0,
                offsetY: shadow.offsetY ?? 0,
                spread: shadow.spread ?? 0
            }));
        }

        this.add(this.createLayer(this.options));
        this.setSize(this.panelWidth, this.panelHeight);

        return this;
    }

    createLayer({
        fillColor,
        fillAlpha = 1,
        strokeColor = Theme.colors.outline,
        strokeAlpha = 1,
        strokeWidth = 0,
        radius = Theme.borderRadius.large,
        offsetX = 0,
        offsetY = 0,
        spread = 0
    }) {
        const [originX = 0.5, originY = 0.5] = this.options.origin;
        const width = this.panelWidth + spread;
        const height = this.panelHeight + spread;
        const graphics = this.scene.add.graphics();
        const drawX = -(width * originX) + offsetX;
        const drawY = -(height * originY) + offsetY;

        graphics.fillStyle(fillColor, fillAlpha);
        graphics.fillRoundedRect(drawX, drawY, width, height, radius);

        if (strokeWidth > 0 && strokeAlpha > 0) {
            graphics.lineStyle(strokeWidth, strokeColor, strokeAlpha);
            graphics.strokeRoundedRect(drawX, drawY, width, height, radius);
        }

        return graphics;
    }
}
