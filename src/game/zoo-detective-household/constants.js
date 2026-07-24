// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'นักสืบในบ้าน',
    description: 'เกมสังเกตคำใบ้และจัดวางของใช้ให้ถูกตำแหน่ง',
    instructions: 'อ่านคำใบ้ทีละข้อ แล้วเลือกของใช้ไปวางในช่องให้ตรงกับเงื่อนไขทั้งหมด',
    coverImage: 'assets/common/cover/cover_tool detective.png',
    titleFontSize: '80px',
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => {
        if (level === 1) return 'ตาราง 2x2 / คำใบ้พื้นฐาน';
        if (level === 2) return 'ตาราง 2x3 / คำใบ้ซับซ้อนขึ้น';
        return 'ตาราง 3x3 / ต้องวิเคราะห์หลายเงื่อนไข';
    },
    // Panel colour tokens — warm amber/brown household palette
    panelBorderColor: '#B8860B',
    panelHeaderColor: '#DAA520',
    // Font colour tokens
    primaryFontColor: '#6B4226',
    secondaryFontColor: '#8B6914',
});

export const Config = Object.freeze({
    TimeLimitMs: 3 * 60 * 1000,
    IncreaseScore: {
        easy: 10,
        medium: 10,
        hard: 10,
    },
    DecreaseScore: {
        easy: 0,
        medium: 0,
        hard: 0,
    },
    GridSize: {
        easy: 230,
        medium: 190,
        hard: 190,
    },
    ItemGapSize: {
        easy: 32,
        medium: 18,
        hard: 18,
    },
    SlotGapSize: {
        easy: 48,
        medium: 24,
        hard: 24,
    },
    Cell: Object.freeze({
        Radius: 42,
        StrokeWidth: 7,

        // Empty cell.
        FillColor: 0xfffaf1,          // was Theme.colors.warmSurface
        StrokeColor: 0xf0b34c,        // was Theme.colors.warmAccent

        // The dragged animal is hovering over this cell (US-E9-03).
        HoverFillColor: 0xFFEAD5,
        HoverStrokeColor: 0xB48557,

        // A hint has come true — the animal here is correct and can no longer be moved.
        LockedFillColor: 0xEFFDEE,    // was Theme.colors.primaryContainer
        LockedStrokeColor: 0x40BC4F,  // was Theme.colors.primary

        // Wrong placement — the border blinks this colour, then returns to normal.
        ErrorStrokeColor: 0xff0000,
        ErrorStrokeWidth: 8,
    }),
})

export const PuzzleLevelConfig = Object.freeze({
    1: Object.freeze({ rows: 2, columns: 2, name: "Easy" }),
    2: Object.freeze({ rows: 2, columns: 3, name: "Medium" }),
    3: Object.freeze({ rows: 3, columns: 3, name: "Hard" })
});

export const HouseholdIconAssets = Object.freeze({
    broom: Object.freeze({ texture: "household-item-broom", path: "assets/symmetry-decor/household-item/broom.png" }),
    phone: Object.freeze({ texture: "household-item-phone", path: "assets/symmetry-decor/household-item/phone.png" }),
    umbrella: Object.freeze({ texture: "household-item-umbrella", path: "assets/symmetry-decor/household-item/umbrella.png" }),
    bowl: Object.freeze({ texture: "household-item-bowl", path: "assets/symmetry-decor/household-item/bowl.png" }),
    glasses: Object.freeze({ texture: "household-item-glasses", path: "assets/symmetry-decor/household-item/glasses.png" }),
    keys: Object.freeze({ texture: "household-item-keys", path: "assets/symmetry-decor/household-item/keys.png" }),
    purse: Object.freeze({ texture: "household-item-purse", path: "assets/symmetry-decor/household-item/purse.png" }),
    remote: Object.freeze({ texture: "household-item-remote", path: "assets/symmetry-decor/household-item/remote.png" }),
    scissors: Object.freeze({ texture: "household-item-scissors", path: "assets/symmetry-decor/household-item/scissor2.png" }),
});

// Keep the same export names for API compatibility with the game engine
export const AnimalIconAssets = HouseholdIconAssets;

export const DefaultAnimals = Object.freeze([
    Object.freeze({ id: "broom", label: "ไม้กวาด", icon: "🧹", ...HouseholdIconAssets.broom }),
    Object.freeze({ id: "phone", label: "โทรศัพท์", icon: "📱", ...HouseholdIconAssets.phone }),
    Object.freeze({ id: "umbrella", label: "ร่ม", icon: "☂️", ...HouseholdIconAssets.umbrella }),
    Object.freeze({ id: "bowl", label: "ชาม", icon: "🥣", ...HouseholdIconAssets.bowl }),
    Object.freeze({ id: "glasses", label: "แว่นตา", icon: "👓", ...HouseholdIconAssets.glasses }),
    Object.freeze({ id: "keys", label: "กุญแจ", icon: "🔑", ...HouseholdIconAssets.keys }),
    Object.freeze({ id: "purse", label: "กระเป๋า", icon: "👛", ...HouseholdIconAssets.purse }),
    Object.freeze({ id: "remote", label: "รีโมท", icon: "📺", ...HouseholdIconAssets.remote }),
    Object.freeze({ id: "scissors", label: "กรรไกร", icon: "✂️", ...HouseholdIconAssets.scissors }),
]);

export const GameplayConfig = Object.freeze({
    stageLabel: "เลเวล",
    promptJoiner: "\n",
    defaultPromptFallback: "วางของใช้ตามคำใบ้ลงไปในช่องด้านล่าง",
    fontSize_FallbackPrompt: "44px",
    hintDirection: {
        up: "อยู่ด้านบน",
        down: "อยู่ด้านล่าง",
        left: "อยู่ด้านซ้าย",
        right: "อยู่ด้านขวา"
    },
    hintGap: 6
});

export const LevelMap = Object.freeze({
    1: "easy",
    2: "medium",
    3: "hard"
});

export const POPUP = Object.freeze({
    POPUPTITLE: "นักสืบในบ้าน",
    POPUPTEXT: "ฝึกสมองด้วยปริศนาจัดของในบ้าน สังเกตคำใบ้ แล้ววางของใช้ให้ถูกที่!"
})
