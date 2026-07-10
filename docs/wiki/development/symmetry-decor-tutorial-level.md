# Symmetry Decor Tutorial Level — Developer Guide

> **Game:** Symmetry Decor  
> **Files involved:**
> - [`constants.js`](../../../src/game/symmetry-decor/constants.js) — `TutorialLevelConfig` settings block
> - [`TutorialLevel.js`](../../../src/game/symmetry-decor/scenes/TutorialLevel.js) — The dedicated tutorial scene
> - [`tutorial-level-manager.js`](../../../src/game/symmetry-decor/components/scripts/tutorial-level-manager.js) — Step-by-step orchestrator
> - [`StartMenu.js`](../../../src/game/symmetry-decor/scenes/StartMenu.js) — Scene routing logic

---

## Overview

The **Tutorial Level** is a dedicated, fully interactive walk-through designed for first-time players. It operates completely independently of the normal `Gameplay.js` scene, providing a safe, un-timed environment where players can learn the game mechanics.

> [!NOTE]
> This document covers the **Dedicated Tutorial Level** scene. 
> For documentation on the idle hint system that appears during normal gameplay, see [Tutorial Hand System](tutorial-hand-guide.md).

---

## Features

- **Step-by-step guidance**: The animated hand guides the player for every single item on the board.
- **Strict drop-zones**: Players cannot make mistakes. Items can only be dropped onto their correct solution slots; all other slots are disabled.
- **Visual scoring**: Points are awarded visually to encourage the player, but **no data is logged to the database** during the tutorial.
- **No timer pressure**: The timer is visually frozen and replaced with the text "ฝึกเล่น" (Practice).
- **Semi-blocking interaction**: The game can force the player to watch the hand complete one full animation loop before allowing them to pick up the item.

---

## Configuration

The entire tutorial level can be configured in `constants.js` via the `TutorialLevelConfig` object.

```javascript
export const TutorialLevelConfig = Object.freeze({
    // --- Developer toggles ---
    enabled: true,
    alwaysShowTutorial: false,
    localStorageKey: 'symmetry_decor_tutorial_level_completed',

    // --- Grid config (easiest possible) ---
    gridColumns: 4,
    gridRows: 4,
    symmetryType: 'L-R',
    itemCount: 3,

    // --- Tutorial hand behavior ---
    animationStyle: 'ghost-preview',
    handDelayMs: 800,

    // --- Blocking behavior ---
    semiBlocking: true,

    // --- Optional text overlay ---
    showTextOverlay: false,
    textOverlayContent: 'ลากรูปนี้ไปวางตรงช่องที่ถูกต้อง',
});
```

### Developer Toggles
- `enabled`: Master switch. If set to `false`, the tutorial level is completely skipped for all players.
- `alwaysShowTutorial`: If `true`, the tutorial will play at the start of **every** session, regardless of whether the player has completed it before. Great for testing.

> [!TIP]
> When running the game in developer "no-log" mode via `npm run dev-nolog`, the tutorial is **forced to show every time**. This makes it easy to continuously test the tutorial flow without having to manually clear `localStorage`.

### Blocking Behavior
The `semiBlocking` flag dictates how the player interacts with the guided item:
- **`true` (Default)**: "Watch first, then do." The hand must complete one full animation loop before the item becomes draggable. All other draggable items are disabled until their turn.
- **`false`**: "Non-blocking." The player can grab the item immediately while the hand is still animating.

### Text Overlay
By setting `showTextOverlay: true`, a floating text box will appear near the guided item with instructions (e.g., "Drag this to the correct slot"). This is turned off by default for a cleaner interface.

---

## Architecture and Flow

The routing decision is made in `StartMenu.js` when the player clicks "Start Game". 

1. **Routing check**: `StartMenu.js` checks `localStorage` (or the `__NOLOG_MODE__` dev flag) to see if the tutorial should be played.
2. **Tutorial Scene**: If yes, the game transitions to `tutorial-level-scene`.
3. **Grid generation**: `TutorialLevel.js` generates an easy grid (4×4, 3 items) and constructs the board.
4. **Disabling slots**: All non-solution slots on the board have their input drop-zones explicitly disabled.
5. **Orchestration**: `TutorialLevelManager` takes over, finds the first unsolved item, and shows the hand.
6. **Completion**: Once all items are placed, the manager writes to `localStorage` and transitions the player to `gameplay-scene`.

### Database and Logging Isolation

A critical requirement of the tutorial level is that **it must not contaminate analytics or leaderboards**.
- The `game_db.pushGameData()` utility is **never called** in `TutorialLevel.js`.
- The `ReplayLogBuffer` system is completely absent.
- The score displayed in the HUD is visual-only and resets to 0 when the player enters the real `gameplay-scene`.
