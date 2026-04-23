import Phaser from "phaser";
import ProgressBar from "../../../../util/layout/progress-bar";
import {
    HUB_COLORS,
    HUB_TEXT,
    HUB_TEXT_STYLES,
    HUB_TOP_BAR,
} from "../../constants";

export default class DailyGoalTopBar extends Phaser.GameObjects.Container {
    constructor(scene, x = 0, y = 0, options = {}) {
        super(scene, x, y);

        this.dailyTarget = Math.max(1, Number(options.dailyTarget) || 1);
        this.completedCount = Math.max(0, Number(options.completedCount) || 0);
        this.onProfile = typeof options.onProfile === "function" ? options.onProfile : () => {};

        scene.add.existing(this);
        this.rebuild();
    }

    setProgress(completedCount, dailyTarget = this.dailyTarget) {
        this.dailyTarget = Math.max(1, Number(dailyTarget) || 1);
        this.completedCount = Math.max(0, Math.min(Number(completedCount) || 0, this.dailyTarget));
        this.rebuild();
        return this;
    }

    setOnProfile(onProfile) {
        this.onProfile = typeof onProfile === "function" ? onProfile : () => {};
        return this;
    }

    rebuild() {
        this.removeAll(true);

        const panel = this.scene.add.graphics();
        panel.fillStyle(HUB_COLORS.topBar, 1);
        panel.fillRoundedRect(HUB_TOP_BAR.x, HUB_TOP_BAR.y, HUB_TOP_BAR.width, HUB_TOP_BAR.height, HUB_TOP_BAR.radius);
        panel.lineStyle(3, HUB_COLORS.topBarStroke, 1);
        panel.strokeRoundedRect(HUB_TOP_BAR.x, HUB_TOP_BAR.y, HUB_TOP_BAR.width, HUB_TOP_BAR.height, HUB_TOP_BAR.radius);
        panel.lineStyle(7, HUB_COLORS.topBarDivider, 1);
        panel.lineBetween(
            HUB_TOP_BAR.dividerX,
            HUB_TOP_BAR.y,
            HUB_TOP_BAR.dividerX,
            HUB_TOP_BAR.y + HUB_TOP_BAR.height,
        );

        const title = this.scene.add.text(HUB_TOP_BAR.titleX, HUB_TOP_BAR.titleY, HUB_TEXT.title, HUB_TEXT_STYLES.title);
        const progress = this.scene.add.text(
            HUB_TOP_BAR.progressTextX,
            HUB_TOP_BAR.progressTextY,
            HUB_TEXT.progressTemplate(this.dailyTarget),
            HUB_TEXT_STYLES.progress,
        );

        const progressRatio = Phaser.Math.Clamp(this.completedCount / Math.max(this.dailyTarget, 1), 0, 1);
        const progressBar = new ProgressBar(
            this.scene,
            HUB_TOP_BAR.progressTrackX + HUB_TOP_BAR.progressTrackWidth / 2,
            HUB_TOP_BAR.progressTrackY + HUB_TOP_BAR.progressTrackHeight / 2,
            {
                width: HUB_TOP_BAR.progressTrackWidth,
                height: HUB_TOP_BAR.progressTrackHeight,
                innerColor: HUB_COLORS.progress,
                backgroundColor: HUB_COLORS.track,
                borderColor: HUB_COLORS.track,
                borderWidth: 0,
                borderRadius: HUB_TOP_BAR.progressTrackRadius,
                value: progressRatio,
            },
        );

        const progressLabel = this.scene.add.text(
            HUB_TOP_BAR.progressLabelX,
            HUB_TOP_BAR.progressLabelY,
            `${this.completedCount}/${this.dailyTarget}`,
            HUB_TEXT_STYLES.progressCount,
        ).setOrigin(0.5);

        const profileButton = this.createProfileButton();
        this.add([panel, title, progress, progressBar.getContainer(), progressLabel, ...profileButton]);
        return this;
    }

    createProfileButton() {
        const button = this.scene.add.rectangle(
            HUB_TOP_BAR.adminX + HUB_TOP_BAR.adminWidth / 2,
            HUB_TOP_BAR.adminY + HUB_TOP_BAR.adminHeight / 2,
            HUB_TOP_BAR.adminWidth,
            HUB_TOP_BAR.adminHeight,
            HUB_COLORS.button,
            1,
        );
        button.setStrokeStyle(5, HUB_COLORS.nodeStroke, 1);
        button.setInteractive({ useHandCursor: true });
        button.on("pointerdown", () => {
            this.onProfile(this)
        });

        const icon = this.scene.add.text(
            HUB_TOP_BAR.adminX + HUB_TOP_BAR.adminWidth / 2,
            HUB_TOP_BAR.adminY + HUB_TOP_BAR.adminHeight / 2,
            HUB_TEXT.adminIcon,
            HUB_TEXT_STYLES.adminIcon,
        ).setOrigin(0.5);
        icon.setInteractive({ useHandCursor: true });
        icon.on("pointerdown", () => this.onProfile(this));

        const label = this.scene.add.text(
            HUB_TOP_BAR.adminX + HUB_TOP_BAR.adminWidth / 2,
            HUB_TOP_BAR.adminLabelY,
            HUB_TEXT.adminLabel,
            HUB_TEXT_STYLES.adminLabel,
        ).setOrigin(0.5);
        label.setInteractive({ useHandCursor: true });
        label.on("pointerdown", () => this.onProfile(this));

        return [button, icon, label];
    }
}
