# Making a Game Support Multiple Themes

This guide explains how to convert any game in the project so it can run with **multiple interchangeable themes**, and how to **clone a themed game** into a new standalone game. The pattern is based on the zoo-feeder implementation, which already supports zoo and medicine themes.

> [!NOTE]
> This is a **general, game-agnostic** guide. For zoo-feeder-specific theme details (field reference, receiver properties, etc.), see the companion guide: [zoo-feeder-theme-guide.md](./zoo-feeder-theme-guide.md).

---

## Concepts

The theme system follows a three-layer architecture:

```
┌─────────────────────────────────────────────────┐
│  Theme JSON files  (pure data, no code)         │
│  themes/theme-a.json, themes/theme-b.json, ...  │
└────────────────────┬────────────────────────────┘
                     │  import
┌────────────────────▼────────────────────────────┐
│  constants.js  (the "switch" — 1 import line)   │
│  Exports frozen, theme-agnostic constants       │
└────────────────────┬────────────────────────────┘
                     │  import
┌────────────────────▼────────────────────────────┐
│  Scenes & Entities  (game code)                 │
│  Never import theme JSON directly               │
└─────────────────────────────────────────────────┘
```

**Key principle:** Game code never touches the theme JSONs directly. It imports from `constants.js`, which acts as the single point of theme selection.

---

## Part A: Making a Game Theme-Ready

Follow these steps to refactor a game that has its content hardcoded in `constants.js` (like `symmetry-decor`) into one that supports swappable themes (like `zoo-feeder`).

### Step 1: Identify Theme-Specific Data

Look at your game's `constants.js` and categorise each export:

| Category | Examples | Goes into theme JSON? |
|---|---|---|
| **Display text** | Title, description, instructions, messages | ✅ Yes |
| **Colors** | Panel border, header, font colors | ✅ Yes |
| **Content definitions** | Item categories, item sprites, receivers | ✅ Yes |
| **Asset paths** | Sprite paths, background images, cover images | ✅ Yes |
| **Gameplay mechanics** | Difficulty settings, timers, score multipliers, grid configs | ❌ No — keep in `constants.js` |

> [!TIP]
> A good rule of thumb: if it changes when the game's "skin" changes but the **rules stay the same**, it belongs in the theme JSON. If it controls how the game **behaves** (difficulty, physics, timing), it stays in `constants.js`.

### Step 2: Create the `themes/` Directory

Inside your game folder, create a `themes/` subdirectory:

```
src/game/your-game/
├── themes/               ← NEW
│   └── default-theme.json
├── constants.js
├── main.js
├── scenes/
└── entity/
```

### Step 3: Extract Theme Data into a JSON File

Create `themes/default-theme.json` and move the theme-specific data out of `constants.js`.

**Before** — everything is hardcoded in `constants.js`:
```javascript
export const StartMenuSetting = Object.freeze({
    title: 'สายพานอาหาร',
    description: 'เกมคัดเลือกอาหารให้ถูกต้อง',
    instructions: 'แตะอาหารที่สัตว์ชนิดนั้นไม่สามารถกินได้ออกจากสายพาน',
    coverImage: 'assets/common/cover/cover_zoo_feeder.png',
    defaultLevel: 1,
    panelBorderColor: '#DE8D23',
    panelHeaderColor: '#FEA837',
    primaryFontColor: '#945E17',
    secondaryFontColor: '#DE8519',
});

export const ItemCategory = Object.freeze({
    VEGETABLE: 'Vegetable',
    MEAT: 'Meat',
    JUNK: 'Junk',
});

// ... more hardcoded data
```

**After** — theme data lives in `default-theme.json`:
```json
{
  "StartMenuSetting": {
    "title": "สายพานอาหาร",
    "description": "เกมคัดเลือกอาหารให้ถูกต้อง",
    "instructions": "แตะอาหารที่สัตว์ชนิดนั้นไม่สามารถกินได้ออกจากสายพาน",
    "coverImage": "assets/common/cover/cover_zoo_feeder.png",
    "defaultLevel": 1,
    "panelBorderColor": "#DE8D23",
    "panelHeaderColor": "#FEA837",
    "primaryFontColor": "#945E17",
    "secondaryFontColor": "#DE8519"
  },
  "ItemCategory": {
    "VEGETABLE": "Vegetable",
    "MEAT": "Meat",
    "JUNK": "Junk"
  },
  "assets": {
    "background": "assets/zoo-feeder/etc/BG.png",
    "apple_sprite": "assets/zoo-feeder/food/Apple.png"
  }
}
```

> [!IMPORTANT]
> JSON files cannot contain functions. Any functional properties (like `levelDetailTemplate`) must remain in `constants.js` and be merged with the theme data using the spread operator.

### Step 4: Rewrite `constants.js` as the Theme Router

Replace the hardcoded values in `constants.js` with a single theme import and spread exports:

```javascript
// ═══════════════════════════════════════════════════════════════
// Theme Selection — change this ONE line to switch themes
// ═══════════════════════════════════════════════════════════════
import activeTheme from './themes/default-theme.json';

// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    ...activeTheme.StartMenuSetting,
    // Functions can't live in JSON — add them here
    levelDetailTemplate: (level) => `${level} สายพาน`,
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    ...activeTheme.GameOverSetting,
});

// ---------------------------------------------------------------------------
// Content — Items, Receivers, Messages
// ---------------------------------------------------------------------------
export const ItemCategory     = Object.freeze(activeTheme.ItemCategory);
export const ItemSpriteLibrary = activeTheme.ItemSpriteLibrary;
export const ReceiverSetting  = Object.freeze(activeTheme.ReceiverSetting);
export const GameplayMessages = Object.freeze(activeTheme.GameplayMessages);

// ---------------------------------------------------------------------------
// Theme Assets
// ---------------------------------------------------------------------------
export const ThemeAssets = Object.freeze(activeTheme.assets);

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
// Gameplay Settings (NOT theme-specific — stays here)
// ---------------------------------------------------------------------------
export const GameplaySetting = Object.freeze({
    spawnCooldowns: {
        1: { min: 21, max: 27 },
        2: { min: 15, max: 21 },
        3: { min: 9, max: 15 },
    },
});
```

### Step 5: Update Asset Loading in Your Scenes

If your scenes have hardcoded `this.load.image(...)` calls for theme content, replace them with dynamic loading from `ThemeAssets`:

**Before:**
```javascript
preload() {
    this.load.image('apple_sprite', 'assets/zoo-feeder/food/Apple.png');
    this.load.image('bear_sprite', 'assets/zoo-feeder/animal/B_Bear.png');
    // ... many more hardcoded lines
}
```

**After:**
```javascript
import { ThemeAssets } from '../constants.js';

preload() {
    // Theme-specific assets — loaded dynamically
    for (const [key, path] of Object.entries(ThemeAssets)) {
        this.load.image(key, path);
    }
}
```

> [!NOTE]
> Shared assets that don't change between themes (e.g., UI buttons, emote sprites) should remain as hardcoded `this.load.image(...)` calls in the scene.

### Step 6: Verify All Game Code Imports from `constants.js`

Search your game's code and confirm that **no file** imports theme data directly. Every reference should go through `constants.js`:

```javascript
// ✅ CORRECT — imports from constants.js
import { ItemCategory, ReceiverSetting, ThemeAssets } from '../constants.js';

// ❌ WRONG — importing the JSON directly bypasses the theme switch
import themeData from '../themes/zoo-theme.json';
```

### Step 7: Test with a Second Theme

1. Copy `default-theme.json` → `alternate-theme.json`
2. Change some values (title, colors, or categories)
3. Switch the import in `constants.js`:
   ```javascript
   import activeTheme from './themes/alternate-theme.json';
   ```
4. Run `npm run dev` and verify the game works with the new theme

---

## Part B: Adding More Themes to a Theme-Ready Game

Once a game is theme-ready, adding a new theme is straightforward:

1. **Create a new theme JSON** in `themes/` following the established JSON contract
2. **Add your assets** to `public/assets/<your-theme-folder>/`
3. **Switch the import** in `constants.js` line 1 to point at the new JSON
4. **Done** — no game code changes needed

See [zoo-feeder-theme-guide.md](./zoo-feeder-theme-guide.md) for the complete field reference and checklist.

---

## Part C: Cloning a Themed Game into a New Standalone Game

Sometimes you want a theme to be its own game entry (like how `medicine-feeder` is a separate game from `zoo-feeder`, even though they share identical game logic). This is the process that was used to create medicine-feeder from zoo-feeder.

### When to Clone vs. Just Add a Theme

| Scenario | Approach |
|---|---|
| Same game, different skin (e.g. zoo → forest) | Add a theme JSON (Part B) |
| Different game entry in the hub, different game ID, own leaderboard | Clone the game folder (Part C) |

### Step-by-Step Cloning Process

#### 1. Copy the entire game directory

```powershell
Copy-Item -Recurse "src/game/zoo-feeder" "src/game/new-game-slug"
```

#### 2. Set the active theme in `constants.js`

Edit `src/game/new-game-slug/constants.js` line 1:

```diff
-import activeTheme from './themes/zoo-theme.json';
+import activeTheme from './themes/your-new-theme.json';
```

You can delete theme JSONs you don't need, or keep them for reference.

#### 3. Assign a unique Game ID

In `scenes/UITestScene.js` (or your main gameplay scene), change the `GAME_ID` constant:

```diff
-const GAME_ID = "ATTN001";
+const GAME_ID = "ATTN003";  // Must be unique across all games
```

#### 4. Update the audio slug

The audio system uses the game's folder slug as a namespace. Search and replace the old slug with the new one in these files:

| File | What to Change |
|---|---|
| `scenes/Boot.js` | `EventBus.emit('audio:register', 'old-slug', ...)` → `'new-game-slug'` |
| `scenes/StartMenu.js` | `EventBus.emit('audio:register', 'old-slug', ...)` → `'new-game-slug'` |
| `scenes/StartMenu.js` | `EventBus.emit('audio:bgm', 'old-slug')` → `'new-game-slug'` |
| `scenes/UITestScene.js` | All `EventBus.emit('audio:play', 'old-slug:...')` → `'new-game-slug:...'` |
| `scenes/DebugMenu.js` | Same audio slug pattern if present |

> [!TIP]
> A quick way to find all occurrences: search the new game folder for the old slug name.
> ```powershell
> Select-String -Path "src/game/new-game-slug/**/*.js" -Pattern "old-slug" -Recurse
> ```

#### 5. Register in the main app

Open `src/main.js` and make two additions:

**a. Back-button protection** — add your new slug to the set:
```javascript
const BACK_BUTTON_PROTECTED_SLUGS = new Set([
    "zoo-feeder",
    "medicine-feeder",
    "new-game-slug",    // ← add this
    // ...
]);
```

**b. Fallback game colors** — add a color entry:
```javascript
const GAME_COLORS = Object.freeze({
    "zoo-feeder":      { border: "#DE8D23", header: "#FEA837", ... },
    "new-game-slug":   { border: "#XXXXXX", header: "#XXXXXX", ... },  // ← add this
    // ...
});
```

#### 6. Register in the database

Add a row to the Supabase `games` table with a `name` field that slugifies to your new game slug (e.g. `name = "New Game Slug"` → slug = `new-game-slug`).

#### 7. Auto-discovery

The new game is automatically routable via Vite's `import.meta.glob`:

```javascript
// src/main.js — no changes needed, this glob picks up any new game folder
const gameModuleLoaders = import.meta.glob(["./game/*/main.js", "!./game/game-hub/main.js"]);
```

Simply having `src/game/new-game-slug/main.js` is enough for the app to discover it.

---

## Reference: Theme JSON Contract

Every theme JSON file should follow this shape. Fields marked **required** must be present for the game to function correctly.

```
{
  "StartMenuSetting": {           ← Required
    "title":              string  ← Game title (Thai)
    "description":        string  ← Short description
    "instructions":       string  ← How-to-play text
    "tutorialTitle":      string  ← Tutorial panel header
    "coverImage":         string  ← Path to cover image
    "defaultLevel":       number  ← Default difficulty (1/2/3)
    "panelBorderColor":   string  ← Hex color
    "panelHeaderColor":   string  ← Hex color
    "primaryFontColor":   string  ← Hex color
    "secondaryFontColor": string  ← Hex color
  },
  "GameOverSetting": {            ← Required
    "panelBorderColor":   string
    "panelHeaderColor":   string
    "primaryFontColor":   string
    "secondaryFontColor": string
  },
  "ItemCategory": {               ← Required (game-specific)
    "KEY": "Value"                ← As many as needed
  },
  "ItemSpriteLibrary": {          ← Required (game-specific)
    "CategoryValue": ["sprite_key", ...]
  },
  "ReceiverSetting": {            ← Required (game-specific)
    "RECEIVER_KEY": {
      "AcceptableCategory": string  ← Must match an ItemCategory value
      "Label":              string  ← Display name
      "Sprite":             string  ← Sprite key from assets
      "Icon":               string  ← Icon sprite key from assets
      "OffsetY":            number  ← Optional, default 0
      "ShadowOffset":       number  ← Optional, default -60
      "ScaleMulti":         number  ← Optional, default 1.0
    }
  },
  "GameplayMessages": {           ← Required
    "wrongCategory": string
    "itemDropped":   string
  },
  "assets": {                     ← Required
    "background":    "path/to/BG.png"
    "sprite_key":    "path/to/sprite.png"  ← One entry per sprite used above
  }
}
```

---

## Quick Checklist

### Making a game theme-ready (Part A)
- [ ] Identified which data is theme-specific vs. gameplay-specific
- [ ] Created `themes/` directory inside the game folder
- [ ] Extracted theme data into a JSON file
- [ ] Rewrote `constants.js` to import and spread the active theme
- [ ] Kept non-JSON-compatible values (functions) in `constants.js`
- [ ] Added `EventBus.emit("minigame:theme-ready", ...)` to `constants.js`
- [ ] Updated scene `preload()` to dynamically load `ThemeAssets`
- [ ] Verified no file imports theme JSON directly (all go through `constants.js`)
- [ ] Tested with at least two different theme JSONs

### Cloning into a new game (Part C)
- [ ] Copied the game directory with the new slug name
- [ ] Updated the theme import in `constants.js`
- [ ] Assigned a unique `GAME_ID`
- [ ] Replaced all audio slug strings (audio:register, audio:bgm, audio:play)
- [ ] Added slug to `BACK_BUTTON_PROTECTED_SLUGS` in `src/main.js`
- [ ] Added color entry to `GAME_COLORS` in `src/main.js`
- [ ] Added game row in Supabase `games` table
- [ ] Tested the new game loads and plays correctly
