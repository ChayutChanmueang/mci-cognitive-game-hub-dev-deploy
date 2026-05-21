// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'Zoo Feeder',
    description: 'เกมคัดเลือกอาหารให้ถูกต้อง',
    instructions: 'แตะอาหารที่สัตว์ชนิดนั้นไม่สามารถกินได้ออกจากสายพาน',
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => `${level} สายพาน`,
    // Panel colour tokens — override the shared CSS defaults for this game
    panelBorderColor: '#DE8D23',
    panelHeaderColor: '#FEA837',
    // Font colour tokens
    primaryFontColor: '#945E17',
    secondaryFontColor: '#DE8519',
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    // Panel colour tokens for the game-over result panel
    panelBorderColor: '#DE8D23',
    panelHeaderColor: '#FEA837',
    // Font colour tokens
    primaryFontColor: '#945E17',
    secondaryFontColor: '#DE8519',
});

// ---------------------------------------------------------------------------
// Food & Animal constants
// ---------------------------------------------------------------------------
export const FoodTypes = Object.freeze({
    VEGETABLE: 'Vegetable',
    MEAT: 'Meat',
    JUNK: 'Junk'
});
export const FoodSpriteLibrary = {
    [FoodTypes.VEGETABLE]: ['apple_sprite', 'corn_sprite', 'plant_sprite'],
    [FoodTypes.MEAT]: ['beef_sprite', 'chicken_sprite', 'fish_sprite'],
    [FoodTypes.JUNK]: ['battery_sprite', 'garbage_sprite', 'soda_sprite']
}
export const AnimalSetting = Object.freeze({
    BEAR: {
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'bear_sprite',
        Icon: 'bear_icon'
    },
    COW: {
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'cow_sprite',
        Icon: 'cow_icon'
    },
    ELEPHANT: {
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'elephant_sprite',
        Icon: 'elephant_icon'
    },
    FOX: {
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'fox_sprite',
        Icon: 'fox_icon'
    },
    LION: {
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'lion_sprite',
        Icon: 'lion_icon'
    },
    PANDA: {
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'panda_sprite',
        Icon: 'panda_icon'
    }
})