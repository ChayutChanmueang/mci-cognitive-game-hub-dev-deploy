export const FoodTypes = Object.freeze({
    VEGETABLE: 'Vegetable',
    MEAT: 'Meat',
    JUNK: 'Junk'
});

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
    stageLabel: "ลำดับ",
    promptJoiner: "\n",
    defaultPromptFallback: "วางสัตว์ตามคำใบ้"
});

export const LevelMap = Object.freeze({
    1: "easy",
    2: "medium",
    3: "hard"
});

export const SampleConstants = Object.freeze({
    VARIABLE1: "Testing..."
})
