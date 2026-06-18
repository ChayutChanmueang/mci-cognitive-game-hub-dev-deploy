// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'สวนสัตว์นักสืบ',
    description: 'เกมสังเกตคำใบ้และจัดวางสัตว์ให้ถูกตำแหน่ง',
    instructions: 'อ่านคำใบ้ทีละข้อ แล้วเลือกสัตว์ไปวางในช่องให้ตรงกับเงื่อนไขทั้งหมด',
    coverImage: 'assets/common/cover/cover_zoo_detective.png',
    titleFontSize: '80px',
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => {
        if (level === 1) return 'ตาราง 2x2 / คำใบ้พื้นฐาน';
        if (level === 2) return 'ตาราง 2x3 / คำใบ้ซับซ้อนขึ้น';
        return 'ตาราง 3x3 / ต้องวิเคราะห์หลายเงื่อนไข';
    },
    // Panel colour tokens — override the shared CSS defaults for this game
    panelBorderColor: '#2D8FBA',
    panelHeaderColor: '#45A9D4',
    // Font colour tokens
    primaryFontColor: '#235B75',
    secondaryFontColor: '#3D86A8',
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
    }
})

export const PuzzleLevelConfig = Object.freeze({
    1: Object.freeze({ rows: 2, columns: 2, name: "Easy" }),
    2: Object.freeze({ rows: 2, columns: 3, name: "Medium" }),
    3: Object.freeze({ rows: 3, columns: 3, name: "Hard" })
});

export const AnimalIconAssets = Object.freeze({
    bear: Object.freeze({ texture: "zoo-detective-animal-bear", path: "assets/common/animal/icons/H_Bear.png" }),
    cow: Object.freeze({ texture: "zoo-detective-animal-cow", path: "assets/common/animal/icons/H_Cow.png" }),
    elephant: Object.freeze({ texture: "zoo-detective-animal-elephant", path: "assets/common/animal/icons/H_ele.png" }),
    fox: Object.freeze({ texture: "zoo-detective-animal-fox", path: "assets/common/animal/icons/H_Fox.png" }),
    lion: Object.freeze({ texture: "zoo-detective-animal-lion", path: "assets/common/animal/icons/H_Li.png" }),
    panda: Object.freeze({ texture: "zoo-detective-animal-panda", path: "assets/common/animal/icons/H_Pan.png" }),
    corn: Object.freeze({ texture: "zoo-detective-food-corn", path: "assets/zoo-feeder/food/Corn.png" }),
    beef: Object.freeze({ texture: "zoo-detective-food-beef", path: "assets/zoo-feeder/food/Beef.png" }),
    fish: Object.freeze({ texture: "zoo-detective-food-fish", path: "assets/zoo-feeder/food/Fish.png" })
});

export const DefaultAnimals = Object.freeze([
    Object.freeze({ id: "bear", label: "หมี", icon: "🐻", ...AnimalIconAssets.bear }),
    Object.freeze({ id: "lion", label: "สิงโต", icon: "🦁", ...AnimalIconAssets.lion }),
    Object.freeze({ id: "elephant", label: "ช้าง", icon: "🐘", ...AnimalIconAssets.elephant }),
/*    Object.freeze({ id: "giraffe", label: "ยีราฟ", icon: "🦒" }),
    Object.freeze({ id: "monkey", label: "ลิง", icon: "🐒" }),
    Object.freeze({ id: "zebra", label: "ม้าลาย", icon: "🦓" }),*/
    Object.freeze({ id: "panda", label: "แพนด้า", icon: "🐼", ...AnimalIconAssets.panda }),
/*    Object.freeze({ id: "tiger", label: "เสือ", icon: "🐯" }),
    Object.freeze({ id: "hippo", label: "ฮิปโป", icon: "🦛" }),*/
    Object.freeze({ id: "fox", label: "จิ้งจอก", icon: "🦊", ...AnimalIconAssets.fox }),
    //Object.freeze({ id: "koala", label: "โคอาลา", icon: "🐨" }),
    Object.freeze({ id: "cow", label: "วัว", icon: "🐮", ...AnimalIconAssets.cow }),
/*    Object.freeze({ id: "pig", label: "หมู", icon: "🐷" }),
    Object.freeze({ id: "frog", label: "กบ", icon: "🐸" }),
    Object.freeze({ id: "chicken", label: "ไก่", icon: "🐔" }),
    Object.freeze({ id: "penguin", label: "เพนกวิน", icon: "🐧" })*/
    Object.freeze({ id: "corn", label: "ข้าวโพด", icon: "🌽", ...AnimalIconAssets.corn }),
    Object.freeze({ id: "beef", label: "เนื้อวัว", icon: "🥩", ...AnimalIconAssets.beef }),
    Object.freeze({ id: "salmon", label: "เนื้อปลา", icon: "🐟", ...AnimalIconAssets.fish }),
]);

export const GameplayConfig = Object.freeze({
    stageLabel: "เลเวล",
    promptJoiner: "\n",
    defaultPromptFallback: "วางสัตว์ตามคำใบ้ลงไปในช่องด้านล่าง",
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
    POPUPTITLE: "สวนสัตว์นักสืบ",
    POPUPTEXT: "ฝึกสมองด้วยปริศนาจัดบ้านสัตว์ สังเกตคำใบ้ แล้ววางสัตว์ให้ถูกที่!"
})
