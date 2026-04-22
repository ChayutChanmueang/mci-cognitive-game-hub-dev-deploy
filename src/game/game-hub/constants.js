import Phaser from "phaser";

export const HUB_VIEW = Object.freeze({
    width: 1100,
    height: 2000,
    backgroundColor: "#f8f1dc",
    sceneBackgroundColor: "#f7efd6",
    scaleMode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
});

export const HUB_LAYOUT = Object.freeze({
    topBarHeight: 350,
    bottomSafeArea: 190,
    nodeStartOffsetY: 120,
    nodeGapY: 310,
    scrollCurrentOffsetY: 790,
    contentBottomPadding: 300,
    maxGames: 10,
});

export const HUB_COLORS = Object.freeze({
    background: 0xf7efd6,
    topBar: 0xffffff,
    topBarStroke: 0xe8ddc8,
    textPrimary: "#1f241f",
    textBody: "#3f473c",
    textMuted: "#6d695f",
    track: 0xf0eadf,
    progress: 0x6fcf62,
    path: 0xf7a9bd,
    doneNode: 0x6fcf62,
    currentNode: 0xfff4aa,
    lockedNode: 0x979b96,
    currentStroke: 0xf0a51f,
    nodeStroke: 0x151515,
    labelPanel: 0xffffff,
    labelStroke: 0xe6ddcd,
    currentLabelStroke: 0xeac36b,
    button: 0x2f6f5b,
    controlPanel: 0xf6efe2,
    shadow: 0x000000,
    lockedIcon: "#3e423e",
    nodeIcon: "#ffffff",
    controlStroke: 0x2c2f2c,
});

export const HUB_BACKGROUND_DECORATIONS = Object.freeze([
    { x: 130, y: 420, radius: 170, color: 0xffcfd2, alpha: 0.45 },
    { x: 1010, y: 820, radius: 230, color: 0xbfe3ff, alpha: 0.32 },
    { x: 100, y: 1660, radius: 260, color: 0xd8ef9f, alpha: 0.34 },
    { x: 940, y: 1760, radius: 190, color: 0xffde85, alpha: 0.35 },
]);

export const HUB_SPARKLE_DECORATION = Object.freeze({
    count: 24,
    startX: 60,
    startY: 390,
    xStep: 173,
    yStep: 84,
    widthModulo: 980,
    radius: 7,
    radiusStep: 3,
    radiusVariants: 3,
    color: 0xffffff,
    alpha: 0.35,
});

export const HUB_TOP_BAR = Object.freeze({
    x: 36,
    y: 34,
    widthInset: 72,
    height: 280,
    radius: 38,
    strokeWidth: 3,
    alpha: 0.94,
    titleX: 84,
    titleY: 82,
    progressTextX: 86,
    progressTextY: 164,
    progressTrackX: 84,
    progressTrackY: 236,
    progressTrackWidth: 610,
    progressTrackHeight: 34,
    progressTrackRadius: 17,
    adminX: 855,
    adminY: 82,
    adminWidth: 150,
    adminHeight: 150,
    hnX: 930,
    hnY: 238,
    nameX: 84,
    nameY: 276,
});

export const HUB_NODE_PATH_XS = Object.freeze([330, 680, 450, 760, 350, 610, 830, 500, 270, 700]);

export const HUB_NODE = Object.freeze({
    defaultRadius: 98,
    currentRadius: 118,
    shadowOffsetX: 10,
    shadowOffsetY: 14,
    shadowAlpha: 0.16,
    strokeWidth: 8,
    currentStrokeWidth: 10,
    iconOffsetY: -4,
    labelWidth: 490,
    labelHeight: 132,
    labelOffsetY: 28,
    labelRadius: 30,
    titleOffsetY: 52,
    subtitleOffsetY: 100,
    titleWrapWidth: 420,
    avatarOffsetY: 155,
    avatarEmoji: "🧑",
    avatarFontSize: "104px",
    currentIconFontSize: "86px",
    defaultIconFontSize: "64px",
    labelAlpha: 0.78,
    currentLabelAlpha: 0.95,
    pathWidth: 28,
    pathAlpha: 0.92,
    labelStrokeWidth: 3,
});

export const HUB_BOTTOM_ACTION = Object.freeze({
    panelX: 54,
    panelBottomOffset: 150,
    panelWidthInset: 108,
    panelHeight: 104,
    panelRadius: 34,
    buttonX: 624,
    buttonBottomOffset: 132,
    buttonWidth: 360,
    buttonHeight: 68,
    buttonRadius: 24,
    buttonLabelX: 804,
    buttonLabelBottomOffset: 98,
    gameTitleX: 92,
    gameTitleBottomOffset: 99,
    gameTitleWrapWidth: 500,
    panelAlpha: 0.92,
    strokeWidth: 3,
});

export const HUB_ICON_BUTTON = Object.freeze({
    radius: 28,
    strokeWidth: 4,
    iconOffsetY: 50,
    labelOffsetY: 112,
    iconFontSize: "58px",
    iconFontFamily: "Arial",
});

export const HUB_SCROLL = Object.freeze({
    wheelMultiplier: 0.8,
    dragMultiplier: 1.35,
});

export const HUB_TEXT = Object.freeze({
    title: "เป้าหมายของวันนี้",
    progressTemplate: (target, completed) => `เล่น ${target} เกม เพื่อฝึกสมอง  ${completed}/${target}`,
    adminLabel: "แอดมิน",
    adminIcon: "⚙",
    defaultPlayer: "ผู้เล่น",
    defaultHn: "HN",
    startButton: "เริ่มเล่น",
    defaultCurrentGame: "เกมวันนี้",
});

export const HUB_TEXT_STYLES = Object.freeze({
    title: {
        fontFamily: "Noto Sans Thai",
        fontSize: "58px",
        fontStyle: "700",
        color: HUB_COLORS.textPrimary,
    },
    progress: {
        fontFamily: "Noto Sans Thai",
        fontSize: "42px",
        color: HUB_COLORS.textBody,
    },
    hn: {
        fontFamily: "Noto Sans Thai",
        fontSize: "30px",
        fontStyle: "700",
        color: "#263028",
    },
    playerName: {
        fontFamily: "Noto Sans Thai",
        fontSize: "28px",
        color: HUB_COLORS.textMuted,
    },
    nodeIcon: {
        fontFamily: "Arial",
        fontStyle: "700",
    },
    nodeTitle: {
        fontFamily: "Noto Sans Thai",
        fontSize: "40px",
        fontStyle: "700",
        color: "#292d28",
        align: "center",
    },
    nodeSubtitle: {
        fontFamily: "Noto Sans Thai",
        fontSize: "28px",
        color: "#6c675e",
        align: "center",
    },
    startButton: {
        fontFamily: "Noto Sans Thai",
        fontSize: "36px",
        fontStyle: "700",
        color: "#ffffff",
    },
    bottomGameTitle: {
        fontFamily: "Noto Sans Thai",
        fontSize: "34px",
        fontStyle: "700",
        color: "#2a2d29",
    },
    iconButtonLabel: {
        fontFamily: "Noto Sans Thai",
        fontSize: "26px",
        fontStyle: "700",
        color: "#2c302c",
    },
});

export const HUB_CATEGORY_LABELS = Object.freeze({
    Memory: "เกมฝึกความจำ",
    Visuospatial: "เกมฝึกมิติสัมพันธ์",
    Attention: "เกมฝึกสมาธิ",
    Language: "เกมฝึกภาษา",
    Executive: "เกมฝึกบริหารสมอง",
    default: "เกมฝึกสมอง",
});

export const HUB_FALLBACK_GAMES = Object.freeze([
    { gid: "ATTN001", name: "Zoo Feeder", mci_group: "Attention" },
    { gid: "LANG001", name: "Context Clues", mci_group: "Language" },
    { gid: "MEM001", name: "Postcard Reader", mci_group: "Memory" },
    { gid: "ATTN002", name: "Zoo Detective", mci_group: "Attention" },
]);
