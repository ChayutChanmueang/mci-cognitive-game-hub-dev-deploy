export const Config = Object.freeze({
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
    }
})

export const PuzzleLevelConfig = Object.freeze({
    1: Object.freeze({ rows: 2, columns: 2, name: "Easy" }),
    2: Object.freeze({ rows: 2, columns: 3, name: "Medium" }),
    3: Object.freeze({ rows: 3, columns: 3, name: "Hard" })
});

export const DefaultAnimals = Object.freeze([
    Object.freeze({ id: "lion", icon: "🦁" }),
    Object.freeze({ id: "elephant", icon: "🐘" }),
    Object.freeze({ id: "giraffe", icon: "🦒" }),
    Object.freeze({ id: "monkey", icon: "🐒" }),
    Object.freeze({ id: "zebra", icon: "🦓" }),
    Object.freeze({ id: "panda", icon: "🐼" }),
    Object.freeze({ id: "tiger", icon: "🐯" }),
    Object.freeze({ id: "hippo", icon: "🦛" }),
    Object.freeze({ id: "fox", icon: "🦊" }),
    Object.freeze({ id: "koala", icon: "🐨" }),
    Object.freeze({ id: "cow", icon: "🐮" }),
    Object.freeze({ id: "pig", icon: "🐷" }),
    Object.freeze({ id: "frog", icon: "🐸" }),
    Object.freeze({ id: "chicken", icon: "🐔" }),
    Object.freeze({ id: "penguin", icon: "🐧" })
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

export const SampleConstants = Object.freeze({
    VARIABLE1: "Testing..."
})
