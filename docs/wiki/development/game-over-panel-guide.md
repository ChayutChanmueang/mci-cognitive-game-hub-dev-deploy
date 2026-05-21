# Using the Global Game Over Panel

This guide explains how to integrate the DOM-based **Minigame Result Panel** into any minigame. 

The Game Over Panel is a responsive, high-fidelity HTML/CSS overlay that sits *on top* of the Phaser canvas. Because it is handled by the global game wrapper (`src/main.js`), implementing it in individual games requires almost no UI code — you simply fire an event.

## 1. How It Works

Instead of creating sprites or Phaser UI elements for a Game Over screen inside your `Gameplay.js` scene, your game simply signals the central **EventBus** that the game is over and passes along the final score. 

`src/main.js` catches this event, pauses the game, and injects the `MinigameResultPanel` directly into the HTML DOM.

## 2. Implementation Steps

When your minigame reaches a "Game Over" state (e.g., time runs out, or the player loses their last life), follow these steps in your `Gameplay.js`:

### Step 1: Pause Game Logic
Stop player input, pause physics, and halt any internal spawn timers.

```javascript
this.isGameEnded = true;
this.physics.pause();
// Stop any specific spawn timers...
```

### Step 2: Show the Level Complete Effect
If the player successfully finished, show the premium confetti/text effect first.

```javascript
import { showLevelCompleteEffect } from "../../common/ui-elements/scripts/level-complete-effect";

showLevelCompleteEffect();
```

### Step 3: Emit the `minigame:game-over` Event
Use a `delayedCall` so the player has time to see the Level Complete effect before the panel appears (usually 1.5 seconds). Pass the player's final score to the event so the panel can display it. You should also pass your game's specific color theme from your `constants.js` file.

```javascript
import { EventBus } from "../../../core/EventBus.js";
import { GameOverSetting } from "../constants.js";

this.time.delayedCall(1500, () => {
    // Save high score if necessary
    const storedHighScore = StorageManager.get('highscore', 0);
    if (this.score > storedHighScore) {
        StorageManager.save('highscore', this.score);
    }

    // Trigger the global DOM panel and pass styling properties
    EventBus.emit('minigame:game-over', { 
        score: this.score,   // <--- Passed to the panel
        level: this.level,
        panelBorderColor: GameOverSetting.panelBorderColor,
        panelHeaderColor: GameOverSetting.panelHeaderColor,
        primaryFontColor: GameOverSetting.primaryFontColor,
        secondaryFontColor: GameOverSetting.secondaryFontColor,
    });
});
```

That's it! The global wrapper will automatically handle rendering the panel, scaling it dynamically based on window size, and wiring up the "Return to Main Menu" button.

## 3. Customizing the Panel

The panel uses shared default styling, but you can override specific colors for your game by passing them in the `minigame:game-over` payload (as shown above).

If you need to change the base visual look, dimensions, or structure of the panel across all games:
- **Logic / Structure**: Edit `src/ui/minigame-result-panel.js`
- **Default Styling**: Edit the `.result-panel`, `.result-score-value`, and `.result-btn-home` classes inside `public/style.css`.

> **Note on Event Priority**: The panel automatically adds `pointer-events: auto` to itself to prevent the underlying Phaser canvas from consuming click events. Ensure your game wrapper does not add an invisible `pointer-events: none` overlay that could block interaction.
