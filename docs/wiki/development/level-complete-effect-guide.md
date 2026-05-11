# Level Complete Effect Guide

This guide describes how to use the shared DOM-based "Level Complete" effect in Phaser 3 games within this project.

## Overview
The `level-complete-effect.js` provides a premium visual feedback module that displays "เก่งมาก!" (Great job!) in the center of the screen accompanied by a confetti particle explosion. 

Because it is **DOM-based**, it renders on top of the Phaser canvas using HTML/CSS. This ensures it looks sharp regardless of game scaling and stays on top of all Phaser scene elements without managing depth (z-index).

## Location
- **File Path**: `src/game/common/ui-elements/scripts/level-complete-effect.js`

## Usage

### 1. Import the module
Import the `showLevelCompleteEffect` function into your Phaser scene. Adjust the relative path based on your scene's location.

```javascript
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";
```

### 2. Trigger the effect
Simply call the function when a player succeeds at a task.

```javascript
showLevelCompleteEffect();
```

### 3. Recommended Implementation Pattern
To provide the best user experience, you should typically pause gameplay logic or delay the next transition for about **1.5 seconds** (the duration of the effect).

```javascript
handleSuccess() {
    // 1. Trigger the visual feedback
    showLevelCompleteEffect();

    // 2. Optional: Disable interaction to prevent spamming
    this.input.enabled = false;

    // 3. Wait for the animation to finish
    this.time.delayedCall(1500, () => {
        this.input.enabled = true;
        
        if (isGameOver) {
            this.showGameOverPanel();
        } else {
            this.loadNextLevel();
        }
    });
}
```

## Technical Details
- **Text Style**: Uses the "Kanit" font with premium gold/orange glow effects.
- **Confetti Physics**:
    - Generates 80 particles with randomized colors, shapes, and velocities.
    - Particles simulate gravity and air resistance (slowing down over time).
    - Features randomized rotation and rotation speeds.
- **Lifecycle**: The module creates a `div` container at `zIndex: 9999`, appends it to `#game-container` (or `body`), and automatically calls `.remove()` once the animation sequence completes.

## Customization
If you need to change the text or colors for a specific game, you can modify the `innerText` or `colors` array within the `showLevelCompleteEffect` function in the common folder.
