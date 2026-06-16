# Audio Implementation Location Guide

This table provides the exact file paths and function locations where the audio events should be emitted in the source code. This is based on the sounds listed in `SFX&BGM_MCI.xlsx`.

> [!NOTE]
> All code implementations assume that `EventBus` has been imported into the file:  
> `import { EventBus } from '../../core/EventBus.js';` (adjust relative path as needed)

## Global Audio (GameHub)

| Sheet / Context | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **GameHub** | `GameHub_BGM` | `assets/audio/gamehub/bgm/GameHub_BGM.mp3` | `src/main.js` | `DOMContentLoaded` | `EventBus.emit('audio:bgm', 'hub');` |
| **Global UI** | `Button_Click` | `assets/audio/common/sfx/Button_Click.mp3` | `src/game/[game]/components/scripts/clickable.js` | `pointerdown` listener callback | `EventBus.emit('audio:play', 'ui:click');` |

---

## Minigames (Game-Specific Audio)

> [!IMPORTANT]
> Make sure your minigame registers its sounds during initialization in the `Boot.js` file using `EventBus.emit('audio:register', 'slug', soundsConfig)`.

### 1. สายพานอาหาร (Zoo Feeder)

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Game BGM** | `Zoo Feeder_BGM` | `assets/audio/zoo-feeder/Zoo Feeder_BGM.mp3` | `src/game/zoo-feeder/scenes/StartMenu.js` | `create()` | `EventBus.emit('audio:bgm', 'zoo-feeder');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/common/sfx/Panel_PopUp.mp3` | `src/game/zoo-feeder/ui-elements/scripts/instruction-panel.js` (or StartMenu.js) | UI `show()` animation | `EventBus.emit('audio:play', 'zoo-feeder:popup');` |
| **Correct** | `Correct` | `assets/audio/common/sfx/Correct.mp3` | `src/game/zoo-feeder/scenes/GameplayTest.js` (or gameplay controller) | Successful item feed logic | `EventBus.emit('audio:play', 'zoo-feeder:correct');` |
| **Wrong** | `Wrong` | `assets/audio/common/sfx/Wrong.wav` | `src/game/zoo-feeder/scenes/GameplayTest.js` (or gameplay controller) | Incorrect item feed logic | `EventBus.emit('audio:play', 'zoo-feeder:wrong');` |
| **End Game** | `EndGame` | `assets/audio/common/sfx/EndGame.mp3` | `src/game/zoo-feeder/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(finalScore)` | `EventBus.emit('audio:play', 'zoo-feeder:endgame');` |

### 2. นักสืบเติมคำ (Context Clues)

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Game BGM** | `Context Clue_BGM` | `assets/audio/context-clue/Context Clue_BGM.mp3` | `src/game/context-clues/scenes/StartMenu.js` | `create()` | `EventBus.emit('audio:bgm', 'context-clues');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/common/sfx/Panel_PopUp.mp3` | `src/game/context-clues/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'context-clues:popup');` |
| **Correct** | `Correct` | `assets/audio/common/sfx/Correct.mp3` | `src/game/context-clues/components/scripts/random-quiz.js` | `checkAnswer(...)` if correct | `EventBus.emit('audio:play', 'context-clues:correct');` |
| **Wrong** | `Wrong` | `assets/audio/common/sfx/Wrong.wav` | `src/game/context-clues/components/scripts/random-quiz.js` | `checkAnswer(...)` if wrong | `EventBus.emit('audio:play', 'context-clues:wrong');` |
| **End Game** | `EndGame` | `assets/audio/common/sfx/EndGame.mp3` | `src/game/context-clues/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(finalScore)` | `EventBus.emit('audio:play', 'context-clues:endgame');` |

### 3. สวนสัตว์นักสืบ (Zoo Detective)

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Game BGM** | `Zoo Detective_BGM` | `assets/audio/zoo-detective/Zoo Detective_BGM.mp3` | `src/game/zoo-detective/scenes/StartMenu.js` | `create()` | `EventBus.emit('audio:bgm', 'zoo-detective');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/common/sfx/Panel_PopUp.mp3` | `src/game/zoo-detective/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'zoo-detective:popup');` |
| **Correct** | `Correct` | `assets/audio/common/sfx/Correct.mp3` | `src/game/zoo-detective/components/scripts/random-puzzle.js` | `checkAnswer(...)` if correct | `EventBus.emit('audio:play', 'zoo-detective:correct');` |
| **Wrong** | `Wrong` | `assets/audio/common/sfx/Wrong.wav` | `src/game/zoo-detective/components/scripts/random-puzzle.js` | `checkAnswer(...)` if wrong | `EventBus.emit('audio:play', 'zoo-detective:wrong');` |
| **End Game** | `EndGame` | `assets/audio/common/sfx/EndGame.mp3` | `src/game/zoo-detective/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(finalScore, ...)` | `EventBus.emit('audio:play', 'zoo-detective:endgame');` |

### 4. ภาพสะท้อน (Symmetry)

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Game BGM** | `Symmetry_BGM` | `assets/audio/symmetry-decor/Symmetry_BGM.mp3` | `src/game/symmetry-decor/scenes/StartMenu.js` | `create()` | `EventBus.emit('audio:bgm', 'symmetry-decor');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/common/sfx/Panel_PopUp.mp3` | `src/game/symmetry-decor/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'symmetry-decor:popup');` |
| **Correct** | `Correct` | `assets/audio/common/sfx/Correct.mp3` | `src/game/symmetry-decor/scenes/Gameplay.js` | Validating match logic | `EventBus.emit('audio:play', 'symmetry-decor:correct');` |
| **Wrong** | `Wrong` | `assets/audio/common/sfx/Wrong.wav` | `src/game/symmetry-decor/scenes/Gameplay.js` | Validating mismatch logic | `EventBus.emit('audio:play', 'symmetry-decor:wrong');` |
| **End Game** | `EndGame` | `assets/audio/common/sfx/EndGame.mp3` | `src/game/symmetry-decor/scenes/Gameplay.js` | `onGameOver(status)` | `EventBus.emit('audio:play', 'symmetry-decor:endgame');` |

### 5. จดหมายจากหลานรัก (Postcard Reader)

> [!NOTE]
> BGM is intentionally omitted here because TTS (Text-To-Speech) is heavily used.

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/common/sfx/Panel_PopUp.mp3` | `src/game/postcard-reader/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'postcard-reader:popup');` |
| **Correct** | `Correct` | `assets/audio/common/sfx/Correct.mp3` | `src/game/postcard-reader/scenes/Gameplay.js` | Validation success logic | `EventBus.emit('audio:play', 'postcard-reader:correct');` |
| **Wrong** | `Wrong` | `assets/audio/common/sfx/Wrong.wav` | `src/game/postcard-reader/scenes/Gameplay.js` | Validation failure logic | `EventBus.emit('audio:play', 'postcard-reader:wrong');` |
| **End Game** | `EndGame` | `assets/audio/common/sfx/EndGame.mp3` | `src/game/postcard-reader/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(...)` | `EventBus.emit('audio:play', 'postcard-reader:endgame');` |

### 6. ทำอาหาร (Fry Food)

> [!NOTE]
> Fry Food does not have a game-specific BGM or a `Wrong` sound. Sounds are registered via `audio:register` in `StartMenu.js` and played in `Gameplay.js`. The game-specific SFX assets are located at `public/assets/audio/fry-food/`.

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Searing SFX** | `Sizzlingcooking_SFX` | `assets/audio/fry-food/Sizzlingcooking_SFX.mp3` | `src/game/fry-food/scenes/Gameplay.js` | `_startCooking()` — when the cooking timer begins | `EventBus.emit('audio:play', 'fry-food:sizzling');` |
| **Flip SFX** | `Flip_Short_SFX` | `assets/audio/fry-food/Flip_Short_SFX.mp3` | `src/game/fry-food/scenes/Gameplay.js` | `_executeFlip()` — when the player tilts to flip | `EventBus.emit('audio:play', 'fry-food:flip');` |
| **Ting SFX** | `Ting_SFX` | `assets/audio/fry-food/Ting_SFX.mp3` | `src/game/fry-food/scenes/Gameplay.js` | `_readyToFlip()` — when the progress bar is full and smoke appears | `EventBus.emit('audio:play', 'fry-food:ting');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/common/sfx/Panel_PopUp.mp3` | `src/game/fry-food/scenes/StartMenu.js` | UI `show()` animation | `EventBus.emit('audio:play', 'ui:popup');` |
| **Button Click** | `Button_Click` | `assets/audio/common/sfx/Button_Click.mp3` | (global) | `pointerdown` listener callback | `EventBus.emit('audio:play', 'ui:click');` |
| **Correct** | `Correct` | `assets/audio/common/sfx/Correct.mp3` | `src/game/common/ui-elements/scripts/level-complete-effect.js` | `showLevelCompleteEffect()` — "เก่งมาก!" confetti popup | Played directly via `Howl` (see cross-game section below) |
| **End Game** | `EndGame` | `assets/audio/common/sfx/EndGame.mp3` | `src/game/fry-food/scenes/Gameplay.js` | `_endGame()` → `minigame:game-over` event | *(handled by the shared game-over panel)* |

---

## Cross-Game: Level Complete Effect ("เก่งมาก!" Confetti)

> [!IMPORTANT]
> The `Correct.mp3` sound is played automatically by `showLevelCompleteEffect()` in **all minigames** when the "เก่งมาก!" confetti popup appears. This is implemented directly via `Howl` (not `EventBus`) in `src/game/common/ui-elements/scripts/level-complete-effect.js` to ensure reliable playback regardless of game-specific audio registration.

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code Used |
|---|---|---|---|---|---|
| **Level Complete Correct** | `Correct` | `assets/audio/common/sfx/Correct.mp3` | `src/game/common/ui-elements/scripts/level-complete-effect.js` | Top of `showLevelCompleteEffect()` | `correctSound.play()` (Howl instance) |

**Games using `showLevelCompleteEffect()`:**
- สายพานอาหาร (Zoo Feeder) — `src/game/zoo-feeder/scenes/UITestScene.js`
- นักสืบเติมคำ (Context Clues) — `src/game/context-clues/scenes/Gameplay.js`
- สวนสัตว์นักสืบ (Zoo Detective) — `src/game/zoo-detective/scenes/Gameplay.js`
- ภาพสะท้อน (Symmetry Decor) — `src/game/symmetry-decor/scenes/Gameplay.js`
- จดหมายจากหลานรัก (Postcard Reader) — `src/game/postcard-reader/scenes/Gameplay.js`
- ทำอาหาร (Fry Food) — `src/game/fry-food/scenes/Gameplay.js`

