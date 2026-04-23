import Phaser from "phaser";
import ScrollContainer from "../../../util/layout/scroll-container";
import DailyGoalTopBar from "../ui-elements/core/daily-goal-top-bar";
import LevelNode from "../ui-elements/core/level-node";
import {
    HUB_COLORS,
    HUB_DAY_DIVIDER,
    HUB_FALLBACK_GAMES,
    HUB_FLOAT_BUTTON,
    HUB_LAYOUT,
    HUB_NODE,
    HUB_SCROLL,
    HUB_TEXT_STYLES,
    HUB_VIEW,
} from "../constants";

function escapeText(value, fallback = "") {
    const parsed = String(value || "").trim();
    return parsed || fallback;
}

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super("game-hub-scene");
        this.currentGameIndex = 0;
    }

    create() {
        this.options = this.game.registry.get("hubOptions") || {};
        this.games = this.normalizeGames(this.options.games);
        this.dailyTarget = Math.max(1, Number(this.options.dailyTarget) || this.games.length);
        this.completedCount = Math.max(0, Math.min(Number(this.options.completedCount) || 0, this.dailyTarget));
        this.currentGameIndex = Math.min(this.completedCount, Math.max(0, this.games.length - 1));

        this.cameras.main.setBackgroundColor(HUB_VIEW.sceneBackgroundColor);
        this.createBackground();
        this.createScrollableMap();
        this.createTopBar();
        this.createScrollTopButton();
        this.scrollToCurrentNode();
    }

    normalizeGames(items) {
        const incoming = Array.isArray(items) ? items : [];
        const merged = [...incoming, ...HUB_FALLBACK_GAMES];
        const preferredGameGid = escapeText(this.options?.preferredGameGid, "");
        const seen = new Set();
        const uniqueGames = [];

        for (const item of merged) {
            const gid = escapeText(item?.gid, "");
            if (!gid || seen.has(gid)) {
                continue;
            }

            seen.add(gid);
            uniqueGames.push(item);
        }

        if (preferredGameGid) {
            uniqueGames.sort((firstGame, secondGame) => {
                const firstMatches = escapeText(firstGame?.gid, "") === preferredGameGid;
                const secondMatches = escapeText(secondGame?.gid, "") === preferredGameGid;

                if (firstMatches === secondMatches) {
                    return 0;
                }

                return firstMatches ? -1 : 1;
            });
        }

        while (uniqueGames.length < HUB_LAYOUT.maxGames) {
            const nextIndex = uniqueGames.length + 1;
            uniqueGames.push({
                gid: `MOCK${String(nextIndex).padStart(3, "0")}`,
                name: `เกมตัวอย่าง ${nextIndex}`,
                mci_group: "Attention",
            });
        }

        return uniqueGames.slice(0, HUB_LAYOUT.maxGames).map((item, index) => ({
            gid: escapeText(item?.gid, `HUB${String(index + 1).padStart(3, "0")}`),
            name: escapeText(item?.name, `เกมที่ ${index + 1}`),
            mci_group: escapeText(item?.mci_group, "Attention"),
            index,
        }));
    }

    createBackground() {
        this.add.rectangle(0, 0, HUB_VIEW.width, HUB_VIEW.height, HUB_COLORS.background).setOrigin(0);
    }

    createScrollableMap() {
        const contentHeight = this.getContentHeight(this.games.length);

        this.scrollArea = new ScrollContainer(this, {
            x: 0,
            y: HUB_LAYOUT.viewportTop,
            width: HUB_VIEW.width,
            height: HUB_VIEW.height - HUB_LAYOUT.viewportTop - HUB_LAYOUT.viewportBottomInset,
            contentHeight,
            wheelMultiplier: HUB_SCROLL.wheelMultiplier,
            dragMultiplier: HUB_SCROLL.dragMultiplier,
            onScroll: (scrollY) => {
                this.updateScrollTopButton(scrollY);
            },
        });

        this.createDayDivider();
        this.createLevelNodes(this.games);
    }

    createTopBar() {
        this.topBar = new DailyGoalTopBar(this, 0, 0, {
            dailyTarget: this.dailyTarget,
            completedCount: this.completedCount,
            onProfile: () => {
                window.location.hash = "#/admin-login";
            },
        });
        this.topBar.setDepth(1000);
    }

    createDayDivider() {
        const leftLine = this.add.rectangle(
            HUB_DAY_DIVIDER.lineLeftX,
            HUB_DAY_DIVIDER.y,
            HUB_DAY_DIVIDER.lineLeftWidth,
            HUB_DAY_DIVIDER.lineHeight,
            HUB_COLORS.dayLine,
        ).setOrigin(0, 0.5);
        const rightLine = this.add.rectangle(
            HUB_DAY_DIVIDER.lineRightX,
            HUB_DAY_DIVIDER.y,
            HUB_DAY_DIVIDER.lineRightWidth,
            HUB_DAY_DIVIDER.lineHeight,
            HUB_COLORS.dayLine,
        ).setOrigin(0, 0.5);
        const label = this.add.text(HUB_VIEW.width / 2, HUB_DAY_DIVIDER.y - 5, HUB_DAY_DIVIDER.label, HUB_TEXT_STYLES.dayLabel)
            .setOrigin(0.5);

        this.scrollArea.addMany([leftLine, rightLine, label]);
    }

    createLevelNodes(games) {
        games.forEach((game, index) => {
            const node = new LevelNode(this, HUB_LAYOUT.nodeX, HUB_LAYOUT.nodeStartY + index * HUB_LAYOUT.nodeGapY, {
                gameData: game,
                index,
                isDone: index < this.completedCount,
                isCurrent: index === this.currentGameIndex,
                isLocked: index > this.currentGameIndex,
                onLaunch: (selectedGame) => {
                    this.options.onLaunchGame?.(selectedGame);
                },
            });

            this.scrollArea.add(node);
        });
    }

    createScrollTopButton() {
        this.scrollTopButton = this.add.container(0, 0).setDepth(1200).setVisible(false);

        const bg = this.add.rectangle(
            HUB_FLOAT_BUTTON.x + HUB_FLOAT_BUTTON.size / 2,
            HUB_FLOAT_BUTTON.y + HUB_FLOAT_BUTTON.size / 2,
            HUB_FLOAT_BUTTON.size,
            HUB_FLOAT_BUTTON.size,
            HUB_COLORS.arrowButton,
            1,
        );
        bg.setStrokeStyle(5, HUB_COLORS.nodeStroke, 1);
        bg.setInteractive({ useHandCursor: true });
        bg.on("pointerdown", () => this.scrollArea.scrollToTop());

        const arrow = this.add.text(
            HUB_FLOAT_BUTTON.x + HUB_FLOAT_BUTTON.size / 2,
            HUB_FLOAT_BUTTON.y + HUB_FLOAT_BUTTON.size / 2 + HUB_FLOAT_BUTTON.iconY,
            "↑",
            HUB_TEXT_STYLES.arrow,
        ).setOrigin(0.5);

        this.scrollTopButton.add([bg, arrow]);
    }

    updateScrollTopButton(scrollY) {
        if (!this.scrollTopButton) {
            return;
        }

        this.scrollTopButton.setVisible(scrollY > HUB_SCROLL.showTopButtonAt);
    }

    scrollToCurrentNode() {
        const targetY = HUB_LAYOUT.nodeStartY + this.currentGameIndex * HUB_LAYOUT.nodeGapY;
        const desiredScroll = Math.max(0, targetY - 740);
        this.scrollArea.setScrollY(desiredScroll);
    }

    getContentHeight(gameCount) {
        return HUB_LAYOUT.nodeStartY
            + Math.max(0, gameCount - 1) * HUB_LAYOUT.nodeGapY
            + HUB_NODE.currentRadius * 2
            + HUB_LAYOUT.contentBottomPadding;
    }
}
