import Phaser from "phaser";

export default class ScrollContainer {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.width = options.width ?? scene.scale.width;
        this.height = options.height ?? scene.scale.height;
        this.contentHeight = Math.max(this.height, options.contentHeight ?? this.height);
        this.scrollY = Phaser.Math.Clamp(options.scrollY ?? 0, 0, this.getMaxScrollY());
        this.wheelMultiplier = options.wheelMultiplier ?? 0.8;
        this.dragMultiplier = options.dragMultiplier ?? 1.15;
        this.onScroll = typeof options.onScroll === "function" ? options.onScroll : () => {};
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScrollY = 0;

        this.viewport = scene.add.zone(this.x, this.y, this.width, this.height)
            .setOrigin(0)
            .setInteractive();
        this.container = scene.add.container(this.x, this.y);

        const maskShape = scene.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff, 1);
        maskShape.fillRect(this.x, this.y, this.width, this.height);
        this.maskShape = maskShape;
        this.mask = maskShape.createGeometryMask();
        this.container.setMask(this.mask);

        this.handleWheel = (_pointer, _objects, _deltaX, deltaY) => {
            this.setScrollY(this.scrollY + deltaY * this.wheelMultiplier);
        };

        this.handlePointerDown = (pointer) => {
            if (!this.viewport.getBounds().contains(pointer.x, pointer.y)) {
                return;
            }

            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.dragStartScrollY = this.scrollY;
        };

        this.handlePointerMove = (pointer) => {
            if (!this.isDragging) {
                return;
            }

            this.setScrollY(this.dragStartScrollY + (this.dragStartY - pointer.y) * this.dragMultiplier);
        };

        this.handlePointerUp = () => {
            this.isDragging = false;
        };

        scene.input.on("wheel", this.handleWheel);
        scene.input.on("pointerdown", this.handlePointerDown);
        scene.input.on("pointermove", this.handlePointerMove);
        scene.input.on("pointerup", this.handlePointerUp);
        scene.input.on("pointerupoutside", this.handlePointerUp);

        this.setScrollY(this.scrollY);
    }

    add(gameObject) {
        this.container.add(gameObject);
        return gameObject;
    }

    addMany(gameObjects = []) {
        this.container.add(gameObjects);
        return gameObjects;
    }

    getMaxScrollY() {
        return Math.max(0, this.contentHeight - this.height);
    }

    setContentHeight(contentHeight) {
        this.contentHeight = Math.max(this.height, Number(contentHeight) || this.height);
        return this.setScrollY(this.scrollY);
    }

    setScrollY(value) {
        this.scrollY = Phaser.Math.Clamp(value, 0, this.getMaxScrollY());
        this.container.y = this.y - this.scrollY;
        this.onScroll(this.scrollY, this.getMaxScrollY());
        return this;
    }

    scrollToTop(duration = 260) {
        if (duration <= 0) {
            return this.setScrollY(0);
        }

        this.scene.tweens.addCounter({
            from: this.scrollY,
            to: 0,
            duration,
            ease: "Sine.easeOut",
            onUpdate: (tween) => this.setScrollY(tween.getValue()),
        });

        return this;
    }

    destroy() {
        this.scene.input.off("wheel", this.handleWheel);
        this.scene.input.off("pointerdown", this.handlePointerDown);
        this.scene.input.off("pointermove", this.handlePointerMove);
        this.scene.input.off("pointerup", this.handlePointerUp);
        this.scene.input.off("pointerupoutside", this.handlePointerUp);
        this.container.destroy(true);
        this.viewport.destroy();
        this.maskShape.destroy();
    }
}
