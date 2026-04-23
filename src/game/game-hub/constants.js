export const HUB_VIEW = Object.freeze({
    width: 1100,
    height: 2000,
    backgroundColor: "#f8f1dc",
    sceneBackgroundColor: "#f8f8f4",
});

export const HUB_LAYOUT = Object.freeze({
    maxGames: 14,
    topBarReservedHeight: 360,
    viewportTop: 0,
    viewportBottomInset: 0,
    dayDividerY: 398,
    nodeStartY: 560,
    nodeGapY: 300,
    contentBottomPadding: 260,
    nodeX: 285,
    currentCardX: 500,
});

export const HUB_COLORS = Object.freeze({
    background: 0xf8f8f4,
    topBar: 0xd6d6d6,
    topBarStroke: 0xd6d6d6,
    topBarDivider: 0x1e1e1e,
    textPrimary: "#111111",
    textBody: "#262626",
    textMuted: "#4f4f4f",
    track: 0xffffff,
    progress: 0xa9a9a9,
    dayLine: 0x111111,
    nodeFill: 0x9c9c9c,
    nodeStroke: 0x121212,
    currentNodeFill: 0xffc0b7,
    doneNode: 0xb7d9a8,
    cardFill: 0xd8d8d8,
    cardStroke: 0xffffff,
    button: 0xffffff,
    buttonStroke: 0xbcbcbc,
    arrowButton: 0xefefef,
    shadow: 0x000000,
});

export const HUB_TOP_BAR = Object.freeze({
    x: 42,
    y: 40,
    width: 1016,
    height: 285,
    radius: 32,
    dividerX: 850,
    titleX: 100,
    titleY: 74,
    progressTextX: 98,
    progressTextY: 160,
    progressTrackX: 92,
    progressTrackY: 245,
    progressTrackWidth: 676,
    progressTrackHeight: 56,
    progressTrackRadius: 28,
    progressLabelX: 430,
    progressLabelY: 272,
    adminX: 905,
    adminY: 82,
    adminWidth: 106,
    adminHeight: 106,
    adminRadius: 18,
    adminLabelY: 235,
});

export const HUB_DAY_DIVIDER = Object.freeze({
    label: "วันที่ 1",
    y: 395,
    lineLeftX: 56,
    lineLeftWidth: 380,
    lineRightX: 660,
    lineRightWidth: 384,
    lineHeight: 8,
});

export const HUB_NODE = Object.freeze({
    radius: 98,
    currentRadius: 130,
    strokeWidth: 9,
    currentStrokeWidth: 8,
    avatarEmoji: "🧑",
    avatarFontSize: "96px",
    iconFontSize: "70px",
    lockFontSize: "60px",
    cardWidth: 470,
    cardHeight: 220,
    cardRadius: 26,
    cardTitleY: 38,
    cardSubtitleY: 98,
    cardButtonX: 154,
    cardButtonY: 134,
    cardButtonWidth: 270,
    cardButtonHeight: 74,
    cardButtonRadius: 18,
});

export const HUB_SCROLL = Object.freeze({
    wheelMultiplier: 0.8,
    dragMultiplier: 1.2,
    showTopButtonAt: 170,
});

export const HUB_FLOAT_BUTTON = Object.freeze({
    x: 942,
    y: 1818,
    size: 112,
    radius: 22,
    iconY: 6,
});

export const HUB_TEXT = Object.freeze({
    title: "เป้าหมายของวันนี้",
    progressTemplate: (target) => `เล่น ${target} เกม เพื่อฝึกสมอง`,
    adminLabel: "โปรไฟล์",
    adminIcon: "♙",
    startButton: "เริ่มเกม",
    defaultPlayer: "ผู้เล่น",
    defaultPatientCode: "Patient",
});

export const HUB_TEXT_STYLES = Object.freeze({
    title: {
        fontFamily: "Noto Sans Thai",
        fontSize: "72px",
        fontStyle: "700",
        color: HUB_COLORS.textPrimary,
    },
    progress: {
        fontFamily: "Noto Sans Thai",
        fontSize: "48px",
        color: HUB_COLORS.textBody,
    },
    progressCount: {
        fontFamily: "Noto Sans Thai",
        fontSize: "48px",
        color: "#858585",
    },
    dayLabel: {
        fontFamily: "Noto Sans Thai",
        fontSize: "44px",
        fontStyle: "700",
        color: HUB_COLORS.textPrimary,
    },
    adminIcon: {
        fontFamily: "Arial",
        fontSize: "74px",
        color: "#1a1a1a",
    },
    adminLabel: {
        fontFamily: "Noto Sans Thai",
        fontSize: "32px",
        fontStyle: "700",
        color: "#1b1b1b",
    },
    cardTitle: {
        fontFamily: "Noto Sans Thai",
        fontSize: "46px",
        fontStyle: "700",
        color: "#151515",
        align: "center",
    },
    cardSubtitle: {
        fontFamily: "Noto Sans Thai",
        fontSize: "34px",
        color: "#363636",
        align: "center",
    },
    cardButton: {
        fontFamily: "Noto Sans Thai",
        fontSize: "48px",
        fontStyle: "700",
        color: "#111111",
    },
    nodeIcon: {
        fontFamily: "Arial",
        fontStyle: "700",
        color: "#202020",
    },
    arrow: {
        fontFamily: "Arial",
        fontSize: "86px",
        color: "#111111",
    },
});

export const HUB_CATEGORY_LABELS = Object.freeze({
    Memory: "เกมฝึกความจำ",
    Visuospatial: "เกมฝึกมิติสัมพันธ์",
    Attention: "เกมฝึกสมาธิ",
    Language: "เกมพัฒนาภาษา",
    Executive: "เกมฝึกบริหารสมอง",
    default: "เกมฝึกสมอง",
});

export const HUB_FALLBACK_GAMES = Object.freeze([
    { gid: "ATTN001", name: "Zoo Feeder", mci_group: "Attention" },
    { gid: "LANG001", name: "เกมนักสืบเติมคำ", mci_group: "Language" },
    { gid: "MEM001", name: "จำภาพโปสการ์ด", mci_group: "Memory" },
    { gid: "ATTN002", name: "ค้นหาสัตว์", mci_group: "Attention" },
    { gid: "EXEC001", name: "จัดลำดับงาน", mci_group: "Executive" },
    { gid: "VIS001", name: "ต่อภาพเส้นทาง", mci_group: "Visuospatial" },
    { gid: "LANG002", name: "เลือกคำให้ถูก", mci_group: "Language" },
    { gid: "MEM002", name: "จับคู่ความจำ", mci_group: "Memory" },
    { gid: "ATTN003", name: "แยกสีให้ไว", mci_group: "Attention" },
    { gid: "EXEC002", name: "วางแผนซื้อของ", mci_group: "Executive" },
    { gid: "VIS002", name: "หมุนรูปทรง", mci_group: "Visuospatial" },
    { gid: "LANG003", name: "เล่าเรื่องจากภาพ", mci_group: "Language" },
]);
