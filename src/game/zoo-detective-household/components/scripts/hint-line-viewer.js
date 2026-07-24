import Phaser from "phaser";
import { createThaiText, getThaiTextStyle } from "../../../../util/thai-text.js";

export default class HintLineViewer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, hints = [], options = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.hints = Array.isArray(hints) ? [...hints] : [];
        this.currentIndex = -1;
        this.options = this.buildOptions(options);
        this.background = null;
        this.textObject = null;

        scene.add.existing(this);
        this.rebuild();
    }

    buildOptions(options) {
        return {
            width: 520,
            minHeight: 180,
            padding: 24,
            radius: 24,
            fillColor: 0xffffff,
            fillAlpha: 1,
            strokeColor: 0x1fd11a,
            strokeAlpha: 1,
            strokeWidth: 6,
            emptyText: "",
            textStyle: {
                fontSize: "36px",
                fontStyle: "bold",
                color: "#7d7790",
                align: "left"
            },
            textOptions: {
                origin: [0, 0],
                wrapWidth: 472
            },
            contentFactory: null,
            onHintShown: null,
            onAllHintsShown: null,
            ...options,
            textStyle: {
                fontSize: "36px",
                fontStyle: "bold",
                color: "#7d7790",
                align: "left",
                ...(options.textStyle ?? {})
            },
            textOptions: {
                origin: [0, 0],
                ...(options.textOptions ?? {})
            }
        };
    }

    rebuild() {
        this.removeAll(true);

        const displayedText = this.getDisplayedText();
        const wrapWidth = this.resolveWrapWidth();
        const textOptions = {
            ...this.options.textOptions,
            wrapWidth
        };

        if (typeof this.options.contentFactory === "function") {
            this.textObject = this.options.contentFactory(this.scene, displayedText, {
                width: wrapWidth,
                height: Math.max(1, this.options.minHeight - (this.options.padding * 2))
            });
            this.textObject.setPosition(this.options.padding, this.options.padding);
        } else {
            this.textObject = createThaiText(
                this.scene,
                this.options.padding,
                this.options.padding,
                displayedText,
                getThaiTextStyle(this.options.textStyle),
                textOptions
            );
        }

        const contentHeight = this.textObject.height + (this.options.padding * 2);
        const panelHeight = Math.max(this.options.minHeight, contentHeight);

        this.background = this.scene.add.graphics();
        this.background.fillStyle(this.options.fillColor, this.options.fillAlpha);
        this.background.lineStyle(this.options.strokeWidth, this.options.strokeColor, this.options.strokeAlpha);
        this.background.fillRoundedRect(0, 0, this.options.width, panelHeight, this.options.radius);
        this.background.strokeRoundedRect(0, 0, this.options.width, panelHeight, this.options.radius);

        this.add([this.background, this.textObject]);
        this.setSize(this.options.width, panelHeight);

        return this;
    }

    resolveWrapWidth() {
        if (this.options.textOptions.wrapWidth) {
            return this.options.textOptions.wrapWidth;
        }

        return Math.max(1, this.options.width - (this.options.padding * 2));
    }

    getDisplayedText() {
        if (this.currentIndex < 0 || this.currentIndex >= this.hints.length) {
            return this.options.emptyText;
        }

        return this.hints[this.currentIndex] ?? this.options.emptyText;
    }

    setOptions(options = {}) {
        this.options = this.buildOptions({
            ...this.options,
            ...options,
            textStyle: {
                ...this.options.textStyle,
                ...(options.textStyle ?? {})
            },
            textOptions: {
                ...this.options.textOptions,
                ...(options.textOptions ?? {})
            }
        });

        return this.rebuild();
    }

    reset(startIndex = -1) {
        this.currentIndex = Phaser.Math.Clamp(startIndex, -1, Math.max(this.hints.length - 1, -1));

        return this.rebuild();
    }

    hasNextHint() {
        for (const hint of this.hints) {
            console.log(`hint : ${hint}`)
        }
        return this.currentIndex + 1 < this.hints.length;
    }

    getCurrentHint() {
        if (this.currentIndex < 0 || this.currentIndex >= this.hints.length) {
            return null;
        }

        return this.hints[this.currentIndex];
    }

    showNextHint() {
        if (!this.hasNextHint()) {
            this.options.onAllHintsShown?.({
                currentIndex: this.currentIndex,
                totalHints: this.hints.length,
                hints: [...this.hints]
            });
            return null;
        }

        this.currentIndex += 1;
        const hintIndex = this.currentIndex;
        const hintText = this.getCurrentHint();

        this.rebuild();

        this.options.onHintShown?.({
            hintIndex,
            hintText,
            currentIndex: this.currentIndex,
            totalHints: this.hints.length
        });

        if (!this.hasNextHint()) {
            this.options.onAllHintsShown?.({
                currentIndex: this.currentIndex,
                totalHints: this.hints.length,
                hints: [...this.hints]
            });
        }

        return hintText;
    }

    revealAll() {
        this.currentIndex = this.hints.length - 1;

        return this.rebuild();
    }

    isComplete() {
        return this.currentIndex >= this.hints.length - 1;
    }

    getState() {
        return {
            currentIndex: this.currentIndex,
            totalHints: this.hints.length,
            currentHint: this.hints[this.currentIndex] ?? null,
            remainingHints: this.currentIndex < 0
                ? [...this.hints]
                : this.hints.slice(this.currentIndex + 1)
        };
    }

    destroy(fromScene) {
        this.background = null;
        this.textObject = null;
        super.destroy(fromScene);
    }
}
