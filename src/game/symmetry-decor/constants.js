import activeTheme from './themes/animal-theme.json';

// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    ...activeTheme.StartMenuSetting,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => {
        if (level === 1) return 'ตาราง 4x4 / สะท้อน 2 ทิศทาง';
        if (level === 2) return 'ตารางใหญ่ขึ้น / สะท้อน 4 ทิศทาง';
        return 'ตารางใหญ่สุด / สะท้อนหลายรูปแบบ';
    },
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    ...activeTheme.GameOverSetting,
});

// ---------------------------------------------------------------------------
// Theme Assets
// ---------------------------------------------------------------------------
export const ThemeAssets = Object.freeze(activeTheme.assets);
export const AvailableAssets = Object.freeze(activeTheme.availableAssets);

// ---------------------------------------------------------------------------
// Emit Theme Colors (for HUD/UI integration)
// ---------------------------------------------------------------------------
import { EventBus } from '../../core/EventBus.js';
EventBus.emit("minigame:theme-ready", {
    border:        activeTheme.StartMenuSetting.panelBorderColor,
    header:        activeTheme.StartMenuSetting.panelHeaderColor,
    textPrimary:   activeTheme.StartMenuSetting.primaryFontColor,
    textSecondary: activeTheme.StartMenuSetting.secondaryFontColor,
});

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------
export const SampleConstants = Object.freeze({
    VARIABLE1: "Testing..."
})
export const Difficulty = Object.freeze({
    EASY: 'Easy',
    NORMAL: 'Normal',
    HARD: 'Hard'
});

export const DifficultyLevelNumber = Object.freeze({
    [Difficulty.EASY]: 1,
    [Difficulty.NORMAL]: 2,
    [Difficulty.HARD]: 3,
});

export function getDifficultyLevelNumber(difficulty) {
    return DifficultyLevelNumber[difficulty] || Number(difficulty) || 1;
}

export const Config = Object.freeze({
    MaxRound: {
        [Difficulty.EASY]: 3,
        [Difficulty.NORMAL]: 5,
        [Difficulty.HARD]: 5
    },
    IncreaseScore: {
        [Difficulty.EASY]: 100,
        [Difficulty.NORMAL]: 200,
        [Difficulty.HARD]: 300
    },
    DecreaseScore: {
        [Difficulty.EASY]: 20,
        [Difficulty.NORMAL]: 50,
        [Difficulty.HARD]: 100
    },
    TimeLimitMs: 180000 // 3 Minutes
});

export const TutorialConfig = Object.freeze({
    [Difficulty.EASY]: {
        // --- When to show ---
        showOnFirstStart: true,      // Show tutorial on very first game
        showOnEveryStart: false,     // Show tutorial every time game starts
        showOnIdle: true,            // Show tutorial after player is idle
        idleTimeoutMs: 10000,        // <- Designer-tweakable (ms)

        // --- Animation style ---
        // 'hand-only'       -> hand slides from item to slot
        // 'ghost-preview'   -> hand drags a semi-transparent copy of the item along with it
        animationStyle: 'hand-only',

        // --- Dismissal behavior ---
        dismissOnDrag: true,         // Tutorial disappears when player starts dragging
        dismissOnTap: true,          // Tutorial disappears when player taps anywhere
    },
    [Difficulty.NORMAL]: {
        showOnFirstStart: true,
        showOnEveryStart: false,
        showOnIdle: true,
        idleTimeoutMs: 8000,         // <- Designer-tweakable (ms)
        animationStyle: 'ghost-preview',
        dismissOnDrag: true,
        dismissOnTap: true,
    },
    [Difficulty.HARD]: {
        showOnFirstStart: true,
        showOnEveryStart: false,
        showOnIdle: true,
        idleTimeoutMs: 5000,         // <- Designer-tweakable (ms)
        animationStyle: 'ghost-preview',
        dismissOnDrag: true,
        dismissOnTap: false,
    },
});

export const GameLevels = {
    [Difficulty.EASY]: [
        {
            GRIDCONFIG:{
                width: 900,
                height: 900,
                columns: 6,
                rows:6,
                padding:0,
                showSymmetryLine:true,
                symmetryType:'vertical' //Possible Config (vertical,horizontal,both)
            },
            LEVEL:[ // When making a level be sure to order the line by X axis
                {POS: {X:0,Y:0}, Type: "Rectangle", Color: 0xff0000, DRAGGABLE: false},
                {POS: {X:0,Y:5}, Type: "Rectangle", Color: 0x00ff00, DRAGGABLE: false},
                {POS: {X:2,Y:2}, Type: "Rectangle", Color: 0x0000ff, DRAGGABLE: false},
                {POS: {X:2,Y:3}, Type: "Rectangle", Color: 0xffff00, DRAGGABLE: false},
                {POS: {X:3,Y:2}, Type: "Rectangle", Color: 0xffff00, DRAGGABLE: true},
                {POS: {X:3,Y:3}, Type: "Rectangle", Color: 0x0000ff, DRAGGABLE: true},
                {POS: {X:5,Y:0}, Type: "Rectangle", Color: 0x00ff00, DRAGGABLE: true},
                {POS: {X:5,Y:5}, Type: "Rectangle", Color: 0xff0000, DRAGGABLE: true}
            ],
            SOLUTION:[ // When making a level solution be sure to order the line by X axis
                {POS: {X:3,Y:2}, Type: "Rectangle", Color: 0x0000ff},
                {POS: {X:3,Y:3}, Type: "Rectangle", Color: 0xffff00},
                {POS: {X:5,Y:0}, Type: "Rectangle", Color: 0xff0000},
                {POS: {X:5,Y:5}, Type: "Rectangle", Color: 0x00ff00}
            ]
        }
    ]
}
