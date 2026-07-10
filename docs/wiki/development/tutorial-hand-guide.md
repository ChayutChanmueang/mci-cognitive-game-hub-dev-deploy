# Tutorial Hand System — Developer Settings Guide

> **Game:** Symmetry Decor  
> **Files involved:**
> - [`constants.js`](../../../src/game/symmetry-decor/constants.js) — `TutorialConfig` settings block
> - [`tutorial-hand.js`](../../../src/game/symmetry-decor/components/scripts/tutorial-hand.js) — Animated hand component
> - [`tutorial-manager.js`](../../../src/game/symmetry-decor/components/scripts/tutorial-manager.js) — Lifecycle orchestrator

---

## Overview

> [!NOTE]
> This document covers the **Idle Hint System** (`TutorialManager`), which provides contextual help during normal gameplay. 
> For documentation on the dedicated step-by-step tutorial level that plays on first launch, see [Symmetry Decor Tutorial Level](symmetry-decor-tutorial-level.md).

The tutorial hand system guides players by animating a pointer from a draggable item to its correct solution slot. It is fully configurable per difficulty level via the `TutorialConfig` object in `constants.js`.

The system has three layers of configuration:

1. **When** the tutorial appears (trigger conditions)
2. **How** the tutorial looks (animation style)
3. **How** the tutorial is dismissed (dismissal behavior)

---

## Quick Start

All settings live in **one place**: the `TutorialConfig` export inside `constants.js`.  
Each difficulty level (`Easy`, `Normal`, `Hard`) has its own config block.

```js
// src/game/symmetry-decor/constants.js

export const TutorialConfig = Object.freeze({
    [Difficulty.EASY]: {
        showOnFirstStart: true,
        showOnEveryStart: false,
        showOnIdle: true,
        idleTimeoutMs: 10000,
        animationStyle: 'hand-only',
        dismissOnDrag: true,
        dismissOnTap: true,
    },
    // ... Normal, Hard ...
});
```

> [!TIP]
> You only need to edit `constants.js` to change tutorial behavior. No code changes in other files are required.

---

## Settings Reference

### Trigger Settings — "When does the tutorial show?"

| Setting | Type | Default (Easy) | Description |
|---|---|---|---|
| `showOnFirstStart` | `boolean` | `true` | Show the tutorial automatically when the player launches this difficulty for the **very first time**. Uses `localStorage` to remember. |
| `showOnEveryStart` | `boolean` | `false` | Show the tutorial automatically at the start of **every** new game session, regardless of whether the player has seen it before. |
| `showOnIdle` | `boolean` | `true` | Show the tutorial after the player has been idle (no taps, no drags, no pointer movement) for `idleTimeoutMs` milliseconds. |
| `idleTimeoutMs` | `number` | `10000` | Duration of inactivity (in milliseconds) before the idle tutorial triggers. Only used when `showOnIdle` is `true`. |

#### Conflict Rules

| Scenario | Behavior |
|---|---|
| Both `showOnFirstStart` and `showOnEveryStart` are `true` | Console warning is logged. `showOnEveryStart` takes priority (tutorial shows every time). |
| `showOnIdle` combined with `showOnFirstStart` or `showOnEveryStart` | ✅ Allowed. The tutorial will show on start **and** re-appear after idle periods. |

#### Examples

```js
// Show tutorial only the first time, and again if idle for 15 seconds
{
    showOnFirstStart: true,
    showOnEveryStart: false,
    showOnIdle: true,
    idleTimeoutMs: 15000,
}

// Show tutorial at the start of every game, never on idle
{
    showOnFirstStart: false,
    showOnEveryStart: true,
    showOnIdle: false,
    idleTimeoutMs: 0, // ignored
}

// Never show tutorial automatically (disabled entirely)
{
    showOnFirstStart: false,
    showOnEveryStart: false,
    showOnIdle: false,
    idleTimeoutMs: 0,
}
```

---

### Animation Settings — "What does the tutorial look like?"

| Setting | Type | Default (Easy) | Description |
|---|---|---|---|
| `animationStyle` | `string` | `'hand-only'` | Controls how the tutorial hand animates. See modes below. |

#### Animation Modes

##### `'hand-only'`

A pointer icon slides from the draggable item to the target slot, with a subtle pulsing effect.

**Animation sequence (loops):**
1. Hand teleports to source item position (instant)
2. Fades in (300ms)
3. Brief pause (200ms)
4. Slides to the target slot (1000ms, smooth ease)
5. Brief pause at target (200ms)
6. Fades out (300ms)
7. → Loops back to step 1

**Best for:** Simple, uncluttered guidance. Good for Easy mode.

##### `'ghost-preview'`

Same as `hand-only`, but also creates a **semi-transparent copy** (ghost) of the draggable item that moves along with the hand, simulating a drag action.

**Animation sequence (loops):**
1. Hand + ghost teleport to source item position (instant)
2. Both fade in — hand at full opacity, ghost at 50% (300ms)
3. Brief pause (200ms)
4. Both slide to the target slot together (1000ms, smooth ease)
5. Ghost briefly flashes brighter (100ms, yoyo)
6. Both fade out (300ms)
7. → Loops back to step 1

**Best for:** More explicit demonstration. Shows not just "where" but "what" to drag. Good for Normal/Hard modes.

---

### Dismissal Settings — "How does the player dismiss the tutorial?"

| Setting | Type | Default (Easy) | Description |
|---|---|---|---|
| `dismissOnDrag` | `boolean` | `true` | Tutorial disappears when the player starts dragging any item. |
| `dismissOnTap` | `boolean` | `true` | Tutorial disappears when the player taps/clicks anywhere on the game area. |

> [!IMPORTANT]
> At least one dismiss method must be `true`. If both are set to `false`, the system logs a warning and forces `dismissOnDrag` to `true`.

#### After Dismissal

- The tutorial hand fades out (200ms) and is destroyed.
- If `showOnIdle` is `true`, the idle timer restarts. The tutorial will re-appear if the player goes idle again.
- Each time the tutorial reappears, it dynamically picks the **next unsolved item** to demonstrate. If the item it previously pointed at has been correctly placed, it will find a different one.

---

## Smart Item Selection

The tutorial hand automatically picks which item to demonstrate. It scans the grid at the moment it is about to show and selects the first draggable item that is **not yet in the correct slot**. 

This means:
- ✅ If the player solved the item the tutorial was pointing at, it picks a new one.
- ✅ If all items are correctly placed, the tutorial silently skips (no hand appears).
- ✅ Works correctly across all symmetry types and grid sizes.

---

## Persistence (localStorage)

The `showOnFirstStart` feature uses `localStorage` with the key pattern:

```
symmetry_decor_tutorial_shown_{levelNumber}
```

Where `levelNumber` is `1` (Easy), `2` (Normal), or `3` (Hard).

To **reset** the first-start flag (e.g., for testing), run this in the browser console:

```js
// Reset for Easy
localStorage.removeItem('symmetry_decor_tutorial_shown_1');

// Reset for all difficulties
localStorage.removeItem('symmetry_decor_tutorial_shown_1');
localStorage.removeItem('symmetry_decor_tutorial_shown_2');
localStorage.removeItem('symmetry_decor_tutorial_shown_3');
```

---

## Current Default Settings

| Setting | Easy | Normal | Hard |
|---|---|---|---|
| `showOnFirstStart` | `true` | `true` | `true` |
| `showOnEveryStart` | `false` | `false` | `false` |
| `showOnIdle` | `true` | `true` | `true` |
| `idleTimeoutMs` | `10000` (10s) | `8000` (8s) | `5000` (5s) |
| `animationStyle` | `hand-only` | `ghost-preview` | `ghost-preview` |
| `dismissOnDrag` | `true` | `true` | `true` |
| `dismissOnTap` | `true` | `true` | `false` |

---

## Tutorial Hand Asset

The tutorial hand currently uses a **placeholder image**: `assets/common/ui_icon/return_btn.png`, loaded with the key `'tutorial_hand'` in `Gameplay.js`'s `preload()`.

To replace it with a custom hand/pointer asset:

1. Add your image to `public/assets/` (e.g., `public/assets/symmetry-decor/tutorial_hand.png`)
2. Update the load path in `Gameplay.js`:
   ```js
   this.load.image('tutorial_hand', 'assets/common/ui_icon/return_btn.png');
   ```
3. You may also want to adjust the rotation angle in `tutorial-hand.js` line 112:
   ```js
   this.hand.setAngle(-45); // Change this to match your new asset's orientation
   ```

---

## Architecture Diagram

```
Gameplay.js (scene)
    │
    ├── constructGrid()
    │       ├── Creates EntityGrid with items
    │       ├── Disables drop-zones on reference side
    │       └── Creates TutorialManager → .init()
    │
    └── handleRoundComplete() / onGameOver()
            └── Destroys TutorialManager

TutorialManager
    ├── Reads TutorialConfig for current difficulty
    ├── Checks localStorage for first-start flag
    ├── Manages idle timer (Phaser TimerEvent)
    ├── Listens for interaction events to reset idle timer
    ├── Creates TutorialHand when tutorial should show
    └── Registers/unregisters dismiss listeners

TutorialHand
    ├── findTutorialPair() — scans grid for unsolved item + target slot
    ├── show() — creates hand image (+ ghost if ghost-preview), starts animation
    ├── dismiss() — fades out, destroys game objects
    └── destroy() — full cleanup
```
