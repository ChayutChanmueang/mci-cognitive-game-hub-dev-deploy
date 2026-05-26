export const Config = Object.freeze({
    TimeLimitMs: 3 * 60 * 1000,
    IncreaseScore: {
        easy: 15,
        medium: 16,
        hard: 17,
    },
    DecreaseScore: {
        easy: 5,
        medium: 6,
        hard: 7,
    },
    MaxRound: {
        easy: 10,
        medium: 10,
        hard: 10,
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

export const DefaultAnimals = Object.freeze([
    Object.freeze({ id: "lion", label: "สิงโต", icon: "🦁" }),
    Object.freeze({ id: "elephant", label: "ช้าง", icon: "🐘" }),
    Object.freeze({ id: "giraffe", label: "ยีราฟ", icon: "🦒" }),
    Object.freeze({ id: "monkey", label: "ลิง", icon: "🐒" }),
    Object.freeze({ id: "zebra", label: "ม้าลาย", icon: "🦓" }),
    Object.freeze({ id: "panda", label: "แพนด้า", icon: "🐼" }),
    Object.freeze({ id: "tiger", label: "เสือ", icon: "🐯" }),
    Object.freeze({ id: "hippo", label: "ฮิปโป", icon: "🦛" }),
    Object.freeze({ id: "fox", label: "สุนัขจิ้งจอก", icon: "🦊" }),
    Object.freeze({ id: "koala", label: "โคอาลา", icon: "🐨" }),
    Object.freeze({ id: "cow", label: "วัว", icon: "🐮" }),
    Object.freeze({ id: "pig", label: "หมู", icon: "🐷" }),
    Object.freeze({ id: "frog", label: "กบ", icon: "🐸" }),
    Object.freeze({ id: "chicken", label: "ไก่", icon: "🐔" }),
    Object.freeze({ id: "penguin", label: "เพนกวิน", icon: "🐧" })
]);

export const GameplayConfig = Object.freeze({
    stageLabel: "เลเวล",
    promptJoiner: "\n",
    defaultPromptFallback: "วางสัตว์ตามคำใบ้ลงไปในช่องด้านล่าง"
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
