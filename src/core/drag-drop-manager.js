import Phaser from "phaser";

export default class DragDropManager {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.snapDuration = options.snapDuration ?? 150;
        this.returnDuration = options.returnDuration ?? 180;
        this.defaultEase = options.ease ?? "Sine.easeOut";

        this.draggables = new Map();
        this.dropZones = new Map();

        this.onDragStart = this.handleDragStart.bind(this);
        this.onDrag = this.handleDrag.bind(this);
        this.onDragEnd = this.handleDragEnd.bind(this);
        this.onDrop = this.handleDrop.bind(this);
        this.onDragEnter = this.handleDragEnter.bind(this);
        this.onDragLeave = this.handleDragLeave.bind(this);

        scene.input.on("dragstart", this.onDragStart);
        scene.input.on("drag", this.onDrag);
        scene.input.on("dragend", this.onDragEnd);
        scene.input.on("drop", this.onDrop);
        scene.input.on("dragenter", this.onDragEnter);
        scene.input.on("dragleave", this.onDragLeave);
    }

    registerDraggable(config = {}) {
        const handle = config.handle;
        const target = config.target ?? handle;

        if (!handle || !target) {
            throw new Error("registerDraggable requires both a handle and a target.");
        }

        handle.setInteractive(config.interactiveConfig ?? { draggable: true });
        this.scene.input.setDraggable(handle);

        this.draggables.set(handle, {
            handle,
            target,
            data: config.data ?? null,
            returnOnMiss: config.returnOnMiss ?? true,
            snapOnDrop: config.snapOnDrop ?? true,
            homeX: config.homeX ?? target.x,
            homeY: config.homeY ?? target.y,
            offsetX: 0,
            offsetY: 0,
            dropZoneId: null,
            onDragStart: config.onDragStart ?? null,
            onDrag: config.onDrag ?? null,
            onDragEnd: config.onDragEnd ?? null,
            onDrop: config.onDrop ?? null,
            onInvalidDrop: config.onInvalidDrop ?? null
        });

        return target;
    }

    registerDropZone(config = {}) {
        const zone = config.zone;

        if (!zone) {
            throw new Error("registerDropZone requires a zone.");
        }

        zone.setInteractive(config.interactiveConfig ?? { dropZone: true });

        this.dropZones.set(zone, {
            zone,
            id: config.id ?? zone.name ?? Phaser.Utils.String.UUID(),
            snapTarget: config.snapTarget ?? zone,
            accepts: config.accepts ?? null,
            onDrop: config.onDrop ?? null,
            onDragEnter: config.onDragEnter ?? null,
            onDragLeave: config.onDragLeave ?? null
        });

        return zone;
    }

    moveHome(handle, duration = this.returnDuration) {
        const draggable = this.draggables.get(handle);

        if (!draggable) {
            return;
        }

        this.tweenTarget(draggable.target, draggable.homeX, draggable.homeY, duration);
    }

    moveHomeByTarget(target, duration = this.returnDuration) {
        const draggable = this.findDraggableByTarget(target);

        if (!draggable) {
            return;
        }

        this.tweenTarget(draggable.target, draggable.homeX, draggable.homeY, duration);
    }

    setHome(handle, x, y) {
        const draggable = this.draggables.get(handle);

        if (!draggable) {
            return;
        }

        draggable.homeX = x;
        draggable.homeY = y;
    }

    destroy() {
        this.scene.input.off("dragstart", this.onDragStart);
        this.scene.input.off("drag", this.onDrag);
        this.scene.input.off("dragend", this.onDragEnd);
        this.scene.input.off("drop", this.onDrop);
        this.scene.input.off("dragenter", this.onDragEnter);
        this.scene.input.off("dragleave", this.onDragLeave);

        this.draggables.clear();
        this.dropZones.clear();
        this.scene = null;
    }

    handleDragStart(pointer, handle) {
        const draggable = this.draggables.get(handle);

        if (!draggable) {
            return;
        }

        draggable.offsetX = draggable.target.x - handle.x;
        draggable.offsetY = draggable.target.y - handle.y;
        draggable.dropZoneId = null;

        if (draggable.onDragStart) {
            draggable.onDragStart({ pointer, handle, target: draggable.target, data: draggable.data });
        }
    }

    handleDrag(pointer, handle, dragX, dragY) {
        const draggable = this.draggables.get(handle);

        if (!draggable) {
            return;
        }

        draggable.target.x = dragX + draggable.offsetX;
        draggable.target.y = dragY + draggable.offsetY;

        if (draggable.onDrag) {
            draggable.onDrag({
                pointer,
                handle,
                target: draggable.target,
                x: draggable.target.x,
                y: draggable.target.y,
                data: draggable.data
            });
        }
    }

    handleDrop(pointer, handle, zone) {
        const draggable = this.draggables.get(handle);
        const dropZone = this.dropZones.get(zone);

        if (!draggable || !dropZone) {
            return;
        }

        if (!this.acceptsDrop(draggable, dropZone)) {
            if (draggable.returnOnMiss) {
                this.moveHome(handle);
            }

            if (draggable.onInvalidDrop) {
                draggable.onInvalidDrop({ pointer, handle, target: draggable.target, zone, data: draggable.data });
            }

            return;
        }

        draggable.dropZoneId = dropZone.id;

        if (draggable.snapOnDrop) {
            this.snapToZone(draggable, dropZone);
        }

        if (dropZone.onDrop) {
            dropZone.onDrop({ pointer, handle, target: draggable.target, zone, data: draggable.data, zoneId: dropZone.id });
        }

        if (draggable.onDrop) {
            draggable.onDrop({ pointer, handle, target: draggable.target, zone, data: draggable.data, zoneId: dropZone.id });
        }
    }

    handleDragEnd(pointer, handle, dropped) {
        const draggable = this.draggables.get(handle);

        if (!draggable) {
            return;
        }

        if (!dropped && draggable.returnOnMiss) {
            this.moveHome(handle);
        }

        if (draggable.onDragEnd) {
            draggable.onDragEnd({
                pointer,
                handle,
                target: draggable.target,
                dropped,
                zoneId: draggable.dropZoneId,
                data: draggable.data
            });
        }
    }

    handleDragEnter(pointer, handle, zone) {
        const draggable = this.draggables.get(handle);
        const dropZone = this.dropZones.get(zone);

        if (!draggable || !dropZone || !dropZone.onDragEnter) {
            return;
        }

        dropZone.onDragEnter({ pointer, handle, target: draggable.target, zone, data: draggable.data, zoneId: dropZone.id });
    }

    handleDragLeave(pointer, handle, zone) {
        const draggable = this.draggables.get(handle);
        const dropZone = this.dropZones.get(zone);

        if (!draggable || !dropZone || !dropZone.onDragLeave) {
            return;
        }

        dropZone.onDragLeave({ pointer, handle, target: draggable.target, zone, data: draggable.data, zoneId: dropZone.id });
    }

    acceptsDrop(draggable, dropZone) {
        if (!dropZone.accepts) {
            return true;
        }

        return dropZone.accepts({
            target: draggable.target,
            handle: draggable.handle,
            data: draggable.data,
            zone: dropZone.zone,
            zoneId: dropZone.id
        });
    }

    snapToZone(draggable, dropZone) {
        const snapTarget = dropZone.snapTarget;

        this.tweenTarget(draggable.target, snapTarget.x, snapTarget.y, this.snapDuration);
    }

    findDraggableByTarget(target) {
        for (const draggable of this.draggables.values()) {
            if (draggable.target === target) {
                return draggable;
            }
        }

        return null;
    }

    tweenTarget(target, x, y, duration) {
        this.scene.tweens.add({
            targets: target,
            x,
            y,
            duration,
            ease: this.defaultEase
        });
    }
}
