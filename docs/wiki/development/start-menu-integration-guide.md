# Start Menu & Game Over Panel Integration Guide

This guide explains how to implement the shared, reusable DOM-based Start Menu and Game Over panels into any Phaser minigame in this project. The process ensures consistent UI, responsive design, and centralized theming (colors and text) per game.

## Prerequisites

Make sure the shared UI components are available in `src/ui/`:
- `start-menu-panel.js`
- `minigame-result-panel.js`

## Step 1: Define Theme & Content in `constants.js`

Each game should define its unique text content and color theme inside its own `constants.js` file. These settings control both the Start Menu and the Game Over result panel.

Open the game's `constants.js` (e.g., `src/game/your-game/constants.js`) and export these two objects:

```javascript
// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'Your Game Title',
    description: 'คำอธิบายสั้นๆ เกี่ยวกับเกม',
    instructions: 'วิธีการเล่นเกมแบบกระชับ',
    
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => {
        if (level === 1) return 'รายละเอียดสำหรับด่านง่าย';
        if (level === 2) return 'รายละเอียดสำหรับด่านปานกลาง';
        return 'รายละเอียดสำหรับด่านยาก';
    },

    // Panel colour tokens — override the shared CSS defaults for this game
    panelBorderColor: '#XXXXXX', // e.g., Primary border color
    panelHeaderColor: '#XXXXXX', // e.g., Header background color
    
    // Font colour tokens
    primaryFontColor: '#XXXXXX', // Main accent font color
    secondaryFontColor: '#XXXXXX', // Secondary text color
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    // Panel colour tokens for the game-over result panel
    panelBorderColor: '#XXXXXX', // Should match StartMenuSetting
    panelHeaderColor: '#XXXXXX', 
    
    // Font colour tokens
    primaryFontColor: '#XXXXXX',
    secondaryFontColor: '#XXXXXX',
});
```

## Step 2: Create the `StartMenu` Scene

Create a new Phaser scene file for the start menu, typically at `src/game/your-game/scenes/StartMenu.js`. This scene handles reading the selected level from `SessionStorageManager`, rendering the HTML DOM panel, and waiting for the user to click the start button.

```javascript
import Phaser from 'phaser';
import { EventBus } from '../../../core/EventBus.js';
import { StartMenuPanel } from '../../../ui/start-menu-panel.js';
import SessionStorageManager from '../../../core/session-storage-manager.js';
import { StartMenuSetting } from '../constants.js';

export default class StartMenuScene extends Phaser.Scene {
    constructor() {
        super('your-game-start-menu-scene');
    }

    create(data) {
        // Hide the top bar HUD while in the menu
        EventBus.emit('minigame:hide-hud');

        // Get the current game level from session storage
        const levelString = SessionStorageManager.get("selected_game_level", "1");
        let level = parseInt(levelString, 10);
        if (isNaN(level)) {
            if (levelString === "easy") level = 1;
            else if (levelString === "medium" || levelString === "normal") level = 2;
            else if (levelString === "hard") level = 3;
            else level = StartMenuSetting.defaultLevel;
        }

        // Render the DOM-based StartMenuPanel
        const uiRoot = document.getElementById("ui-root");
        if (uiRoot) {
            this.startMenuPanel = new StartMenuPanel(uiRoot, {
                title: StartMenuSetting.title,
                description: StartMenuSetting.description,
                instructions: StartMenuSetting.instructions,
                level: level,
                levelDetail: StartMenuSetting.levelDetailTemplate(level),
                
                // Colors mapped from constants
                panelBorderColor: StartMenuSetting.panelBorderColor,
                panelHeaderColor: StartMenuSetting.panelHeaderColor,
                primaryFontColor: StartMenuSetting.primaryFontColor,
                secondaryFontColor: StartMenuSetting.secondaryFontColor,
            });
            this.startMenuPanel.render();
        }

        // Listen for the start button press (emitted by the panel) to transition to gameplay
        const handleStartGame = () => {
            this.scene.start('gameplay-scene'); // Ensure this matches your gameplay scene key
        };
        EventBus.on('startmenu:start-game', handleStartGame);

        // Clean up DOM elements and listeners when transitioning away
        this.events.once('shutdown', () => {
            EventBus.off('startmenu:start-game', handleStartGame);
            if (this.startMenuPanel) {
                this.startMenuPanel.destroy();
            }
        });
    }
}
```

## Step 3: Register the Start Menu in `main.js`

To make the game boot into the start menu first, you must register `StartMenuScene` as the *first* scene in the Phaser config array in the game's `main.js`.

```javascript
import StartMenuScene from './scenes/StartMenu';
// ... other imports

const config = {
    // ... config
    scene: [
        StartMenuScene, // Must be first!
        GameplayScene,
        // Boot, Preloader, etc.
    ],
    // ...
};
```

## Step 4: Pass Colors to the Game Over Panel

The central `MinigameResultPanel` (spawned by the global `main.js`) needs to know which colors to use for the current game. You pass these colors via the `minigame:game-over` event emitted from your gameplay scene.

In your `Gameplay.js` (or wherever you emit the game-over event), import `GameOverSetting` and attach the color properties to the event payload:

```javascript
import { GameOverSetting } from "../constants.js";

// ... inside your game over logic:

EventBus.emit('minigame:game-over', {
    score: this.score, // or this.allScore
    level: this.level,
    
    // Pass the styling configuration
    panelBorderColor: GameOverSetting.panelBorderColor,
    panelHeaderColor: GameOverSetting.panelHeaderColor,
});
```

*(Note: The global `main.js` listens to this event, grabs the color properties from the payload, and feeds them into the `MinigameResultPanel` instance.)*

---
**Summary Checklist**:
- [ ] `StartMenuSetting` & `GameOverSetting` defined in `constants.js`
- [ ] `StartMenuScene` created and handles DOM instantiation/cleanup
- [ ] `StartMenuScene` placed first in the `scene` array in `main.js`
- [ ] `minigame:game-over` event in `Gameplay.js` passes the color properties
