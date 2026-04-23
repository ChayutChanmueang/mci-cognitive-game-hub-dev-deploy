import Phaser from "phaser";
import {
    HUB_CATEGORY_LABELS,
    HUB_COLORS,
    HUB_NODE,
    HUB_TEXT,
    HUB_TEXT_STYLES,
} from "../../constants";

function getCategoryLabel(category) {
    return HUB_CATEGORY_LABELS[category] || HUB_CATEGORY_LABELS.default;
}

export default class GameLaunchCard extends Phaser.GameObjects.Container {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y);

        this.gameData = options.gameData || null;
        this.onLaunch = typeof options.onLaunch === "function" ? options.onLaunch : () => {};

        scene.add.existing(this);
        this.rebuild();
    }

    setGameData(gameData) {
        this.gameData = gameData;
        this.rebuild();
        return this;
    }

    setOnLaunch(onLaunch) {
        this.onLaunch = typeof onLaunch === "function" ? onLaunch : () => {};
        return this;
    }

    rebuild() {
        this.removeAll(true);

        const game = this.gameData || {};
        const panel = this.scene.add.graphics();
        panel.fillStyle(HUB_COLORS.cardFill, 1);
        panel.fillRoundedRect(0, 0, HUB_NODE.cardWidth, HUB_NODE.cardHeight, HUB_NODE.cardRadius);
        panel.lineStyle(4, HUB_COLORS.cardStroke, 1);
        panel.strokeRoundedRect(0, 0, HUB_NODE.cardWidth, HUB_NODE.cardHeight, HUB_NODE.cardRadius);

        const title = this.scene.add.text(
            HUB_NODE.cardWidth / 2,
            HUB_NODE.cardTitleY,
            game.name || HUB_TEXT.defaultCurrentGame,
            {
                ...HUB_TEXT_STYLES.cardTitle,
                wordWrap: { width: HUB_NODE.cardWidth - 48, useAdvancedWrap: true },
            },
        ).setOrigin(0.5, 0);

        const subtitle = this.scene.add.text(
            HUB_NODE.cardWidth / 2,
            HUB_NODE.cardSubtitleY,
            getCategoryLabel(game.mci_group),
            HUB_TEXT_STYLES.cardSubtitle,
        ).setOrigin(0.5, 0);

        const button = this.createLaunchButton();
        this.add([panel, title, subtitle, ...button]);
        return this;
    }

    createLaunchButton() {
        const button = this.scene.add.rectangle(
            HUB_NODE.cardButtonX + HUB_NODE.cardButtonWidth / 2,
            HUB_NODE.cardButtonY + HUB_NODE.cardButtonHeight / 2,
            HUB_NODE.cardButtonWidth,
            HUB_NODE.cardButtonHeight,
            HUB_COLORS.button,
            1,
        );
        button.setStrokeStyle(5, HUB_COLORS.buttonStroke, 1);
        button.setInteractive({ useHandCursor: true });
        button.on("pointerdown", () => this.launch());

        const label = this.scene.add.text(
            HUB_NODE.cardButtonX + HUB_NODE.cardButtonWidth / 2,
            HUB_NODE.cardButtonY + HUB_NODE.cardButtonHeight / 2,
            HUB_TEXT.startButton,
            HUB_TEXT_STYLES.cardButton,
        ).setOrigin(0.5);
        label.setInteractive({ useHandCursor: true });
        label.on("pointerdown", () => this.launch());

        return [button, label];
    }

    launch() {
        this.onLaunch(this.gameData, this);
    }
}
