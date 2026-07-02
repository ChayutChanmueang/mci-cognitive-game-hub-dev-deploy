import activeTheme from './themes/medicine-theme.json';

// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    ...activeTheme.StartMenuSetting,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => `${level} สายพาน`,
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    ...activeTheme.GameOverSetting,
});

// ---------------------------------------------------------------------------
// Item & Receiver constants
// ---------------------------------------------------------------------------
export const ItemCategory = Object.freeze(activeTheme.ItemCategory);
export const ItemSpriteLibrary = activeTheme.ItemSpriteLibrary;
export const ReceiverSetting = Object.freeze(activeTheme.ReceiverSetting);

// ---------------------------------------------------------------------------
// Gameplay Messages
// ---------------------------------------------------------------------------
export const GameplayMessages = Object.freeze(activeTheme.GameplayMessages);

import { EventBus } from '../../core/EventBus.js';
EventBus.emit("minigame:theme-ready", {
    border: activeTheme.StartMenuSetting.panelBorderColor,
    header: activeTheme.StartMenuSetting.panelHeaderColor,
    textPrimary: activeTheme.StartMenuSetting.primaryFontColor,
    textSecondary: activeTheme.StartMenuSetting.secondaryFontColor,
});
// ---------------------------------------------------------------------------
// Theme Assets
// ---------------------------------------------------------------------------
/** Flat map of { spriteKey: filePath } for all assets this theme uses.
 *  UITestScene iterates this to load only what the active theme needs. */
export const ThemeAssets = Object.freeze(activeTheme.assets);

// ---------------------------------------------------------------------------
// Difficulty Mapping
// ---------------------------------------------------------------------------
/** Maps conveyor-belt count → numeric level stored in the database (1 = ง่าย, 2 = ปานกลาง, 3 = ยาก) */
export const ConveyerDifficultyLevel = Object.freeze({
    1: 1,
    2: 2,
    3: 3,
});

/** Maps numeric level → Thai difficulty label */
export const DifficultyLabel = Object.freeze({
    1: 'ง่าย',
    2: 'ปานกลาง',
    3: 'ยาก',
});

// ---------------------------------------------------------------------------
// Gameplay Settings
// ---------------------------------------------------------------------------
export const GameplaySetting = Object.freeze({
    spawnCooldowns: {
        1: { min: 21, max: 27 }, // Easy
        2: { min: 15, max: 21 },  // Normal
        3: { min: 9, max: 15 }   // Hard
    }
});