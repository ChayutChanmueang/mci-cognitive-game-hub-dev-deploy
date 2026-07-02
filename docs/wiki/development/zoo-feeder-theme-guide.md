# Zoo Feeder: Adding a New Theme

This guide explains how to create a brand-new theme for the **Zoo Feeder** minigame. The game uses a JSON-based theme system, so adding a theme requires no changes to the core game logic — only a new JSON file, new assets, and a single line change in `constants.js`.

---

## Overview

The theme system works as follows:

1. All theme data (categories, receivers, messages, colors) lives in a `.json` file inside `src/game/zoo-feeder/themes/`.
2. `constants.js` imports the active theme file and exports it to the rest of the game.
3. To switch themes, you change a **single import line** in `constants.js`.

```
src/game/zoo-feeder/
├── themes/
│   ├── zoo-theme.json          ← Active Zoo theme
│   └── your-new-theme.json     ← Your new theme goes here
├── constants.js                ← Theme router (change import here)
└── scenes/
    └── UITestScene.js          ← Loads assets referenced by theme sprites
```

---

## Step 1: Prepare Your Assets

The game needs two sets of images for each theme:

| Asset Type | Role | Naming Convention |
|---|---|---|
| **Background** | Full-screen background image | Freely named |
| **Item sprites** | The items that fall down the conveyor | Unique key, e.g. `apple_sprite` |
| **Receiver sprites** | The entities at the bottom of each belt | Unique key, e.g. `bear_sprite` |
| **Receiver icons** | Small icons shown in the UI | Unique key, e.g. `bear_icon` |

**Recommended folder structure for assets:**
```
public/assets/
└── zoo-feeder/          ← You can add a subdirectory per theme
    ├── animal/          ← Zoo theme receiver sprites
    ├── food/            ← Zoo theme item sprites
    └── etc/             ← Shared assets (background, emotes)
```

> [!IMPORTANT]
> The sprite key names you define in the JSON (e.g., `"bear_sprite"`) **must exactly match** the keys registered in `UITestScene.js`'s `preload()` function. See Step 3 for details.

---

## Step 2: Create the Theme JSON File

Create a new file at `src/game/zoo-feeder/themes/your-theme-name.json`.

Copy the structure below as your starting template and fill in your values:

```json
{
  "StartMenuSetting": {
    "title": "Your Game Title",
    "description": "A short game description",
    "instructions": "The player instructions shown on the tutorial panel body",
    "tutorialTitle": "The header text shown on the tutorial panel",
    "coverImage": "assets/common/cover/your_cover_image.png",
    "defaultLevel": 1,
    "panelBorderColor": "#HEX_COLOR",
    "panelHeaderColor": "#HEX_COLOR",
    "primaryFontColor": "#HEX_COLOR",
    "secondaryFontColor": "#HEX_COLOR"
  },
  "GameOverSetting": {
    "panelBorderColor": "#HEX_COLOR",
    "panelHeaderColor": "#HEX_COLOR",
    "primaryFontColor": "#HEX_COLOR",
    "secondaryFontColor": "#HEX_COLOR"
  },
  "ItemCategory": {
    "CATEGORY_A": "CategoryA",
    "CATEGORY_B": "CategoryB",
    "CATEGORY_C": "CategoryC"
  },
  "ItemSpriteLibrary": {
    "CategoryA": ["item_a1_sprite", "item_a2_sprite"],
    "CategoryB": ["item_b1_sprite", "item_b2_sprite"],
    "CategoryC": ["item_c1_sprite", "item_c2_sprite"]
  },
  "ReceiverSetting": {
    "RECEIVER_ONE": {
      "AcceptableCategory": "CategoryA",
      "Sprite": "receiver_one_sprite",
      "Icon": "receiver_one_icon"
    },
    "RECEIVER_TWO": {
      "AcceptableCategory": "CategoryB",
      "Sprite": "receiver_two_sprite",
      "Icon": "receiver_two_icon",
      "OffsetY": 0,
      "ShadowOffset": -60,
      "ScaleMulti": 1.0
    }
  },
  "GameplayMessages": {
    "wrongCategory": "Your wrong-category popup message",
    "itemDropped": "Your item-dropped popup message"
  },
  "assets": {
    "background":        "assets/your-theme/BG.png",
    "item_a1_sprite":    "assets/your-theme/items/ItemA1.png",
    "item_a2_sprite":    "assets/your-theme/items/ItemA2.png",
    "item_b1_sprite":    "assets/your-theme/items/ItemB1.png",
    "item_b2_sprite":    "assets/your-theme/items/ItemB2.png",
    "receiver_one_sprite": "assets/your-theme/receivers/ReceiverOne.png",
    "receiver_one_icon":   "assets/your-theme/receivers/icons/ReceiverOne_icon.png",
    "receiver_two_sprite": "assets/your-theme/receivers/ReceiverTwo.png",
    "receiver_two_icon":   "assets/your-theme/receivers/icons/ReceiverTwo_icon.png"
  }
}
```

### Key Field Reference

#### `ItemCategory`
Defines the sorting buckets. Keys are the enum name (uppercase), values are the string identifier used throughout the game.

```json
"ItemCategory": {
    "RECYCLABLE": "Recyclable",
    "ORGANIC":    "Organic",
    "HAZARDOUS":  "Hazardous"
}
```

> [!TIP]
> You can add **as many categories** as you like. The game will automatically sample from all defined categories when spawning items.

#### `ItemSpriteLibrary`
Maps each category **value** (not key) to a list of sprite keys that belong to it. A random sprite from the list is picked when an item spawns.

```json
"ItemSpriteLibrary": {
    "Recyclable": ["bottle_sprite", "can_sprite"],
    "Organic":    ["apple_sprite", "banana_sprite"]
}
```

#### `ReceiverSetting`
Defines the entities waiting at the end of each conveyor. Each receiver only accepts one category.

| Property | Required | Description |
|---|---|---|
| `AcceptableCategory` | ✅ | Must match a **value** from `ItemCategory` |
| `Label` | ✅ | Display name shown in the HUD (e.g. `"ยากิน"`, `"สัตว์กินพืช"`) |
| `Sprite` | ✅ | The sprite key for the receiver's body |
| `Icon` | ✅ | The sprite key for the receiver's HUD icon (can reuse an item sprite) |
| `OffsetY` | ❌ | Vertical offset in pixels for visual alignment (default: `0`) |
| `ShadowOffset` | ❌ | Shadow vertical offset (default: `-60`) |
| `ScaleMulti` | ❌ | Scale multiplier for oversized sprites (default: `1.0`) |

> [!TIP]
> You can have **more receivers than categories**, and the game will randomly assign receivers to conveyors. Having 6 receivers but only 3 categories means each conveyor may display any of the 6 receivers. It is recommended to have **at least as many receivers as categories**.

#### `GameplayMessages`
The Thai (or any language) popup strings shown when a player makes a wrong action.

```json
"GameplayMessages": {
    "wrongCategory": "ผิดหมวดหมู่",
    "itemDropped":   "ทำไมทิ้งล่ะ"
}
```

---

## Step 3: Register Your Assets in the Theme JSON

The `assets` block in your theme JSON is the complete list of images the game will load. **The keys must exactly match the sprite keys used in `ItemSpriteLibrary` and `ReceiverSetting`**.

`UITestScene.js` automatically iterates `ThemeAssets` at startup and loads only those images — no manual edits to the scene file needed.

```json
"assets": {
  "background":      "assets/your-theme/BG.png",
  "bottle_sprite":   "assets/your-theme/items/Bottle.png",
  "can_sprite":      "assets/your-theme/items/Can.png",
  "bin_one_sprite":  "assets/your-theme/receivers/BinOne.png",
  "bin_one_icon":    "assets/your-theme/receivers/icons/BinOne_icon.png"
}
```

> [!IMPORTANT]
> Every sprite key referenced in `ItemSpriteLibrary` or `ReceiverSetting` must have a matching entry in `assets`. Missing entries will cause Phaser to render grey boxes at runtime.

> [!NOTE]
> Shared assets that are **not theme-specific** (emote popups, UI buttons) are always loaded by the scene and do **not** need to be in the `assets` block.

---

## Step 4: Activate Your Theme in `constants.js`

Open [`src/game/zoo-feeder/constants.js`](file:///c:/work/mci-cognitive-games/src/game/zoo-feeder/constants.js) and change the **first line** to point to your new JSON file:

```javascript
// ✅ Active theme — change this line to switch themes
import activeTheme from './themes/your-theme-name.json';

// ❌ Previous theme (comment out or remove)
// import activeTheme from './themes/zoo-theme.json';
```

That's it! Vite will hot-reload and the game will now use your new theme.

---

## Example: The Zoo Theme

For a complete, working reference, see the existing Zoo theme files:

- **JSON File:** [`src/game/zoo-feeder/themes/zoo-theme.json`](file:///c:/work/mci-cognitive-games/src/game/zoo-feeder/themes/zoo-theme.json)
- **Theme Router:** [`src/game/zoo-feeder/constants.js`](file:///c:/work/mci-cognitive-games/src/game/zoo-feeder/constants.js)
- **Asset Loading:** [`src/game/zoo-feeder/scenes/UITestScene.js`](file:///c:/work/mci-cognitive-games/src/game/zoo-feeder/scenes/UITestScene.js) (lines 22–59)

---

## Quick Checklist

Use this checklist when creating a new theme:

- `[ ]` All item and receiver images are placed under `public/assets/`
- `[ ]` Created `src/game/zoo-feeder/themes/my-theme.json` with all required fields
- `[ ]` `ItemSpriteLibrary` keys match the **values** (not keys) of `ItemCategory`
- `[ ]` `ReceiverSetting` entries each have a valid `AcceptableCategory` that matches an `ItemCategory` value
- `[ ]` All sprite keys in the JSON are listed in the `assets` block with their correct file paths
- `[ ]` Updated the import line in `constants.js` to point to the new theme file
- `[ ]` Tested the game with at least 1, 2, and 3 conveyors (Easy, Normal, Hard)
