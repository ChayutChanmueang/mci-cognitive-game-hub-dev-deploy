import Phaser from "phaser";
import {
    HUB_BACKGROUND_DECORATIONS,
    HUB_BOTTOM_ACTION,
    HUB_CATEGORY_LABELS,
    HUB_COLORS,
    HUB_FALLBACK_GAMES,
    HUB_ICON_BUTTON,
    HUB_LAYOUT,
    HUB_NODE,
    HUB_NODE_PATH_XS,
    HUB_SCROLL,
    HUB_SPARKLE_DECORATION,
    HUB_TEXT,
    HUB_TEXT_STYLES,
    HUB_TOP_BAR,
    HUB_VIEW,
} from "../constants";

function escapeText(value, fallback = "") {
    const parsed = String(value || "").trim();
    return parsed || fallback;
}

function getCategoryLabel(category) {
    return HUB_CATEGORY_LABELS[category] || HUB_CATEGORY_LABELS.default;
}

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("game-hub-scene");
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartScrollY = 0;
        this.currentGameIndex = 0;
    }

    create() {
        this.options = this.game.registry.get("hubOptions") || {};
        this.games = this.normalizeGames(this.options.games);
        this.dailyTarget = Math.max(1, Number(this.options.dailyTarget) || this.games.length || HUB_FALLBACK_GAMES.length);
        this.completedCount = Math.max(0, Math.min(Number(this.options.completedCount) || 0, this.dailyTarget));
        this.currentGameIndex = Math.min(this.completedCount, Math.max(0, this.games.length - 1));

        this.cameras.main.setBackgroundColor(HUB_VIEW.sceneBackgroundColor);
        this.createBackground();
        this.content = this.add.container(0, 0);
        this.createMapPath();
        this.createTopBar();
        this.createBottomAction();
        this.createScrollControls();
        this.updateProgressSummary();
        this.scrollToCurrentNode();
    }

    normalizeGames(items) {
        const source = Array.isArray(items) && items.length ? items : HUB_FALLBACK_GAMES;
        return source.slice(0, HUB_LAYOUT.maxGames).map((item, index) => ({
            gid: escapeText(item?.gid, `HUB${String(index + 1).padStart(3, "0")}`),
            name: escapeText(item?.name, `เกมที่ ${index + 1}`),
            mci_group: escapeText(item?.mci_group, "Attention"),
            index,
        }));
    }

    createBackground() {
        this.add.rectangle(0, 0, HUB_VIEW.width, HUB_VIEW.height, HUB_COLORS.background).setOrigin(0);
        HUB_BACKGROUND_DECORATIONS.forEach(({ x, y, radius, color, alpha }) => {
            this.add.circle(x, y, radius, color, alpha);
        });

        for (let i = 0; i < HUB_SPARKLE_DECORATION.count; i += 1) {
            const x = HUB_SPARKLE_DECORATION.startX + ((i * HUB_SPARKLE_DECORATION.xStep) % HUB_SPARKLE_DECORATION.widthModulo);
            const y = HUB_SPARKLE_DECORATION.startY + i * HUB_SPARKLE_DECORATION.yStep;
            const radius = HUB_SPARKLE_DECORATION.radius
                + (i % HUB_SPARKLE_DECORATION.radiusVariants) * HUB_SPARKLE_DECORATION.radiusStep;
            this.add.circle(x, y, radius, HUB_SPARKLE_DECORATION.color, HUB_SPARKLE_DECORATION.alpha);
        }
    }

    createTopBar() {
        const topBar = this.add.container(0, 0).setDepth(1000);
        const panel = this.add.graphics();
        panel.fillStyle(HUB_COLORS.topBar, HUB_TOP_BAR.alpha);
        panel.fillRoundedRect(HUB_TOP_BAR.x, HUB_TOP_BAR.y, HUB_VIEW.width - HUB_TOP_BAR.widthInset, HUB_TOP_BAR.height, HUB_TOP_BAR.radius);
        panel.lineStyle(HUB_TOP_BAR.strokeWidth, HUB_COLORS.topBarStroke, 1);
        panel.strokeRoundedRect(HUB_TOP_BAR.x, HUB_TOP_BAR.y, HUB_VIEW.width - HUB_TOP_BAR.widthInset, HUB_TOP_BAR.height, HUB_TOP_BAR.radius);

        const patientLabel = escapeText(this.options.patientLabel, HUB_TEXT.defaultPlayer);
        const hnCode = escapeText(this.options.patientCode, "");
        const hnLabel = hnCode ? `HN${hnCode}` : HUB_TEXT.defaultHn;

        const title = this.add.text(HUB_TOP_BAR.titleX, HUB_TOP_BAR.titleY, HUB_TEXT.title, HUB_TEXT_STYLES.title);

        this.progressText = this.add.text(HUB_TOP_BAR.progressTextX, HUB_TOP_BAR.progressTextY, "", HUB_TEXT_STYLES.progress);

        const progressTrack = this.add.graphics();
        progressTrack.fillStyle(HUB_COLORS.track, 1);
        progressTrack.fillRoundedRect(
            HUB_TOP_BAR.progressTrackX,
            HUB_TOP_BAR.progressTrackY,
            HUB_TOP_BAR.progressTrackWidth,
            HUB_TOP_BAR.progressTrackHeight,
            HUB_TOP_BAR.progressTrackRadius,
        );
        this.progressFill = this.add.graphics();

        const admin = this.createIconButton(
            HUB_TOP_BAR.adminX,
            HUB_TOP_BAR.adminY,
            HUB_TOP_BAR.adminWidth,
            HUB_TOP_BAR.adminHeight,
            HUB_TEXT.adminIcon,
            HUB_TEXT.adminLabel,
            () => {
            this.options.onAdmin?.();
            },
        );

        const patient = this.add.text(HUB_TOP_BAR.hnX, HUB_TOP_BAR.hnY, hnLabel, HUB_TEXT_STYLES.hn).setOrigin(0.5);

        const name = this.add.text(HUB_TOP_BAR.nameX, HUB_TOP_BAR.nameY, patientLabel, HUB_TEXT_STYLES.playerName).setOrigin(0, 0.5);

        topBar.add([panel, title, this.progressText, progressTrack, this.progressFill, ...admin, patient, name]);
    }

    createMapPath() {
        const startY = HUB_LAYOUT.topBarHeight + HUB_LAYOUT.nodeStartOffsetY;
        const gapY = HUB_LAYOUT.nodeGapY;
        const xs = HUB_NODE_PATH_XS;
        const nodePositions = this.games.map((game, index) => ({
            x: xs[index % xs.length],
            y: startY + index * gapY,
            game,
        }));

        const path = this.add.graphics();
        path.lineStyle(HUB_NODE.pathWidth, HUB_COLORS.path, HUB_NODE.pathAlpha);
        path.beginPath();
        nodePositions.forEach((node, index) => {
            if (index === 0) {
                path.moveTo(node.x, node.y);
            } else {
                const prev = nodePositions[index - 1];
                const controlX = (prev.x + node.x) / 2;
                path.quadraticCurveTo(controlX, prev.y + HUB_LAYOUT.nodeStartOffsetY, node.x, node.y);
            }
        });
        path.strokePath();
        this.content.add(path);

        nodePositions.forEach((node, index) => {
            this.createGameNode(node, index);
        });

        const currentNode = nodePositions[this.currentGameIndex] || nodePositions[0];
        this.avatar = this.add.text(currentNode.x, currentNode.y - HUB_NODE.avatarOffsetY, HUB_NODE.avatarEmoji, {
            fontSize: HUB_NODE.avatarFontSize,
        }).setOrigin(0.5);
        this.content.add(this.avatar);

        const contentHeight = nodePositions.at(-1)?.y || HUB_VIEW.height;
        this.maxScrollY = Math.max(0, contentHeight + HUB_LAYOUT.contentBottomPadding - (HUB_VIEW.height - HUB_LAYOUT.bottomSafeArea));
    }

    createGameNode(node, index) {
        const isDone = index < this.completedCount;
        const isCurrent = index === this.currentGameIndex;
        const isLocked = index > this.currentGameIndex;
        const radius = isCurrent ? HUB_NODE.currentRadius : HUB_NODE.defaultRadius;
        const fill = isDone ? HUB_COLORS.doneNode : isCurrent ? HUB_COLORS.currentNode : HUB_COLORS.lockedNode;
        const stroke = isCurrent ? HUB_COLORS.currentStroke : HUB_COLORS.nodeStroke;

        const shadow = this.add.circle(node.x + HUB_NODE.shadowOffsetX, node.y + HUB_NODE.shadowOffsetY, radius, HUB_COLORS.shadow, HUB_NODE.shadowAlpha);
        const circle = this.add.circle(node.x, node.y, radius, fill, 1);
        circle.setStrokeStyle(isCurrent ? HUB_NODE.currentStrokeWidth : HUB_NODE.strokeWidth, stroke, 1);
        circle.setInteractive({ useHandCursor: !isLocked });

        const statusIcon = isDone ? "✓" : isCurrent ? "★" : String(index + 1);
        const icon = this.add.text(node.x, node.y + HUB_NODE.iconOffsetY, statusIcon, {
            ...HUB_TEXT_STYLES.nodeIcon,
            fontSize: isCurrent ? HUB_NODE.currentIconFontSize : HUB_NODE.defaultIconFontSize,
            color: isLocked ? HUB_COLORS.lockedIcon : HUB_COLORS.nodeIcon,
        }).setOrigin(0.5);

        const labelPanel = this.add.graphics();
        const labelX = node.x - HUB_NODE.labelWidth / 2;
        const labelY = node.y + radius + HUB_NODE.labelOffsetY;
        labelPanel.fillStyle(HUB_COLORS.labelPanel, isCurrent ? HUB_NODE.currentLabelAlpha : HUB_NODE.labelAlpha);
        labelPanel.fillRoundedRect(labelX, labelY, HUB_NODE.labelWidth, HUB_NODE.labelHeight, HUB_NODE.labelRadius);
        labelPanel.lineStyle(HUB_NODE.labelStrokeWidth, isCurrent ? HUB_COLORS.currentLabelStroke : HUB_COLORS.labelStroke, 1);
        labelPanel.strokeRoundedRect(labelX, labelY, HUB_NODE.labelWidth, HUB_NODE.labelHeight, HUB_NODE.labelRadius);

        const title = this.add.text(node.x, node.y + radius + HUB_NODE.titleOffsetY, node.game.name, {
            ...HUB_TEXT_STYLES.nodeTitle,
            wordWrap: { width: HUB_NODE.titleWrapWidth, useAdvancedWrap: true },
        }).setOrigin(0.5, 0);

        const subtitle = this.add.text(node.x, node.y + radius + HUB_NODE.subtitleOffsetY, getCategoryLabel(node.game.mci_group), HUB_TEXT_STYLES.nodeSubtitle).setOrigin(0.5, 0);

        const launch = () => {
            if (!isLocked) {
                this.options.onLaunchGame?.(node.game);
            }
        };

        circle.on("pointerdown", launch);
        title.setInteractive({ useHandCursor: !isLocked }).on("pointerdown", launch);
        labelPanel.setInteractive(
            new Phaser.Geom.Rectangle(labelX, labelY, HUB_NODE.labelWidth, HUB_NODE.labelHeight),
            Phaser.Geom.Rectangle.Contains,
        ).on("pointerdown", launch);

        this.content.add([shadow, circle, icon, labelPanel, title, subtitle]);
    }

    createBottomAction() {
        const bottom = this.add.container(0, 0).setDepth(1000);
        const panel = this.add.graphics();
        const panelY = HUB_VIEW.height - HUB_BOTTOM_ACTION.panelBottomOffset;
        panel.fillStyle(HUB_COLORS.topBar, HUB_BOTTOM_ACTION.panelAlpha);
        panel.fillRoundedRect(HUB_BOTTOM_ACTION.panelX, panelY, HUB_VIEW.width - HUB_BOTTOM_ACTION.panelWidthInset, HUB_BOTTOM_ACTION.panelHeight, HUB_BOTTOM_ACTION.panelRadius);
        panel.lineStyle(HUB_BOTTOM_ACTION.strokeWidth, HUB_COLORS.labelStroke, 1);
        panel.strokeRoundedRect(HUB_BOTTOM_ACTION.panelX, panelY, HUB_VIEW.width - HUB_BOTTOM_ACTION.panelWidthInset, HUB_BOTTOM_ACTION.panelHeight, HUB_BOTTOM_ACTION.panelRadius);

        const button = this.add.graphics();
        const buttonY = HUB_VIEW.height - HUB_BOTTOM_ACTION.buttonBottomOffset;
        button.fillStyle(HUB_COLORS.button, 1);
        button.fillRoundedRect(HUB_BOTTOM_ACTION.buttonX, buttonY, HUB_BOTTOM_ACTION.buttonWidth, HUB_BOTTOM_ACTION.buttonHeight, HUB_BOTTOM_ACTION.buttonRadius);
        button.setInteractive(
            new Phaser.Geom.Rectangle(HUB_BOTTOM_ACTION.buttonX, buttonY, HUB_BOTTOM_ACTION.buttonWidth, HUB_BOTTOM_ACTION.buttonHeight),
            Phaser.Geom.Rectangle.Contains,
        );
        button.on("pointerdown", () => {
            const selectedGame = this.games[this.currentGameIndex] || this.games[0];
            this.options.onLaunchGame?.(selectedGame);
        });

        const label = this.add.text(
            HUB_BOTTOM_ACTION.buttonLabelX,
            HUB_VIEW.height - HUB_BOTTOM_ACTION.buttonLabelBottomOffset,
            HUB_TEXT.startButton,
            HUB_TEXT_STYLES.startButton,
        ).setOrigin(0.5);

        const currentGame = this.games[this.currentGameIndex] || this.games[0];
        this.currentGameText = this.add.text(HUB_BOTTOM_ACTION.gameTitleX, HUB_VIEW.height - HUB_BOTTOM_ACTION.gameTitleBottomOffset, currentGame?.name || HUB_TEXT.defaultCurrentGame, {
            ...HUB_TEXT_STYLES.bottomGameTitle,
            wordWrap: { width: HUB_BOTTOM_ACTION.gameTitleWrapWidth, useAdvancedWrap: true },
        }).setOrigin(0, 0.5);

        bottom.add([panel, button, label, this.currentGameText]);
    }

    createIconButton(x, y, width, height, iconText, labelText, onClick) {
        const bg = this.add.graphics();
        bg.fillStyle(HUB_COLORS.controlPanel, 1);
        bg.fillRoundedRect(x, y, width, height, HUB_ICON_BUTTON.radius);
        bg.lineStyle(HUB_ICON_BUTTON.strokeWidth, HUB_COLORS.controlStroke, 1);
        bg.strokeRoundedRect(x, y, width, height, HUB_ICON_BUTTON.radius);
        bg.setInteractive(new Phaser.Geom.Rectangle(x, y, width, height), Phaser.Geom.Rectangle.Contains);
        bg.on("pointerdown", onClick);

        const icon = this.add.text(x + width / 2, y + HUB_ICON_BUTTON.iconOffsetY, iconText, {
            fontSize: HUB_ICON_BUTTON.iconFontSize,
            fontFamily: HUB_ICON_BUTTON.iconFontFamily,
        }).setOrigin(0.5);

        const label = this.add.text(x + width / 2, y + HUB_ICON_BUTTON.labelOffsetY, labelText, {
            ...HUB_TEXT_STYLES.iconButtonLabel,
        }).setOrigin(0.5);

        return [bg, icon, label];
    }

    createScrollControls() {
        this.input.on("wheel", (_pointer, _objects, _deltaX, deltaY) => {
            this.setScrollY(this.scrollY + deltaY * HUB_SCROLL.wheelMultiplier);
        });

        this.input.on("pointerdown", (pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.dragStartScrollY = this.scrollY;
        });

        this.input.on("pointermove", (pointer) => {
            if (!this.isDragging) {
                return;
            }

            this.setScrollY(this.dragStartScrollY + (this.dragStartY - pointer.y) * HUB_SCROLL.dragMultiplier);
        });

        this.input.on("pointerup", () => {
            this.isDragging = false;
        });

        this.input.on("pointerupoutside", () => {
            this.isDragging = false;
        });
    }

    setScrollY(value) {
        this.scrollY = Phaser.Math.Clamp(value, 0, this.maxScrollY);
        this.content.y = -this.scrollY;
    }

    scrollToCurrentNode() {
        const targetY = HUB_LAYOUT.topBarHeight + HUB_LAYOUT.nodeStartOffsetY + this.currentGameIndex * HUB_LAYOUT.nodeGapY;
        this.setScrollY(Math.max(0, targetY - HUB_LAYOUT.scrollCurrentOffsetY));
    }

    updateProgressSummary() {
        const target = Math.max(this.dailyTarget, this.games.length);
        const completed = Math.min(this.completedCount, target);
        const progressRatio = target ? completed / target : 0;

        this.progressText.setText(HUB_TEXT.progressTemplate(target, completed));
        this.progressFill.clear();
        if (progressRatio > 0) {
            this.progressFill.fillStyle(HUB_COLORS.progress, 1);
            this.progressFill.fillRoundedRect(
                HUB_TOP_BAR.progressTrackX,
                HUB_TOP_BAR.progressTrackY,
                HUB_TOP_BAR.progressTrackWidth * progressRatio,
                HUB_TOP_BAR.progressTrackHeight,
                HUB_TOP_BAR.progressTrackRadius,
            );
        }
    }
}
