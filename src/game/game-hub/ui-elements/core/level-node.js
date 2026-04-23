import Phaser from "phaser";
import GameLaunchCard from "./game-launch-card";
import {
    HUB_COLORS,
    HUB_LAYOUT,
    HUB_NODE,
    HUB_TEXT_STYLES,
} from "../../constants";

export default class LevelNode extends Phaser.GameObjects.Container {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y);

        this.gameData = options.gameData || null;
        this.index = Math.max(0, Number(options.index) || 0);
        this.isDone = Boolean(options.isDone);
        this.isCurrent = Boolean(options.isCurrent);
        this.isLocked = Boolean(options.isLocked);
        this.onLaunch = typeof options.onLaunch === "function" ? options.onLaunch : () => {};

        scene.add.existing(this);
        this.rebuild();
    }

    setState({ isDone = this.isDone, isCurrent = this.isCurrent, isLocked = this.isLocked } = {}) {
        this.isDone = Boolean(isDone);
        this.isCurrent = Boolean(isCurrent);
        this.isLocked = Boolean(isLocked);
        this.rebuild();
        return this;
    }

    setGameData(gameData) {
        this.gameData = gameData;
        this.rebuild();
        return this;
    }

    rebuild() {
        this.removeAll(true);

        const radius = this.isCurrent ? HUB_NODE.currentRadius : HUB_NODE.radius;
        const fillColor = this.isDone
            ? HUB_COLORS.doneNode
            : this.isCurrent
                ? HUB_COLORS.currentNodeFill
                : HUB_COLORS.nodeFill;

        const circle = this.scene.add.circle(0, 0, radius, fillColor, 1);
        circle.setStrokeStyle(
            this.isCurrent ? HUB_NODE.currentStrokeWidth : HUB_NODE.strokeWidth,
            HUB_COLORS.nodeStroke,
            1,
        );
        circle.setInteractive({ useHandCursor: !this.isLocked });
        circle.on("pointerdown", () => this.launch());

        const icon = this.createNodeIcon();
        icon.setInteractive({ useHandCursor: !this.isLocked });
        icon.on("pointerdown", () => this.launch());

        this.add([circle, icon]);

        if (this.isCurrent) {
            this.add(this.createCurrentGameCard());
        }

        return this;
    }

    createNodeIcon() {
        if (this.isCurrent) {
            return this.scene.add.text(0, 12, HUB_NODE.avatarEmoji, {
                fontSize: HUB_NODE.avatarFontSize,
            }).setOrigin(0.5);
        }

        const icon = this.isDone ? "✓" : this.isLocked ? "" : String(this.index + 1);

        return this.scene.add.text(0, 0, icon, {
            ...HUB_TEXT_STYLES.nodeIcon,
            fontSize: this.isLocked ? HUB_NODE.lockFontSize : HUB_NODE.iconFontSize,
            color: this.isLocked ? "#6c6c6c" : "#202020",
        }).setOrigin(0.5);
    }

    createCurrentGameCard() {
        return new GameLaunchCard(this.scene, HUB_LAYOUT.currentCardX - HUB_LAYOUT.nodeX, -96, {
            gameData: this.gameData,
            onLaunch: () => this.launch(),
        });
    }

    launch() {
        if (this.isLocked) {
            return;
        }

        this.onLaunch(this.gameData, this);
    }
}
