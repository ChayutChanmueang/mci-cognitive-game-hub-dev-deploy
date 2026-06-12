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
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/zoo-feeder/Panel_PopUp.mp3` | `src/game/zoo-feeder/ui-elements/scripts/instruction-panel.js` (or StartMenu.js) | UI `show()` animation | `EventBus.emit('audio:play', 'zoo-feeder:popup');` |
| **Correct** | `Correct` | `assets/audio/zoo-feeder/Correct.mp3` | `src/game/zoo-feeder/scenes/GameplayTest.js` (or gameplay controller) | Successful item feed logic | `EventBus.emit('audio:play', 'zoo-feeder:correct');` |
| **Wrong** | `Wrong` | `assets/audio/zoo-feeder/Wrong.wav` | `src/game/zoo-feeder/scenes/GameplayTest.js` (or gameplay controller) | Incorrect item feed logic | `EventBus.emit('audio:play', 'zoo-feeder:wrong');` |
| **End Game** | `EndGame` | `assets/audio/zoo-feeder/EndGame.mp3` | `src/game/zoo-feeder/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(finalScore)` | `EventBus.emit('audio:play', 'zoo-feeder:endgame');` |

### 2. นักสืบเติมคำ (Context Clues)

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Game BGM** | `Context Clue_BGM` | `assets/audio/context-clue/Context Clue_BGM.mp3` | `src/game/context-clues/scenes/StartMenu.js` | `create()` | `EventBus.emit('audio:bgm', 'context-clues');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/context-clue/Panel_PopUp.mp3` | `src/game/context-clues/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'context-clues:popup');` |
| **Correct** | `Correct` | `assets/audio/context-clue/Correct.mp3` | `src/game/context-clues/components/scripts/random-quiz.js` | `checkAnswer(...)` if correct | `EventBus.emit('audio:play', 'context-clues:correct');` |
| **Wrong** | `Wrong` | `assets/audio/context-clue/Wrong.wav` | `src/game/context-clues/components/scripts/random-quiz.js` | `checkAnswer(...)` if wrong | `EventBus.emit('audio:play', 'context-clues:wrong');` |
| **End Game** | `EndGame` | `assets/audio/context-clue/EndGame.mp3` | `src/game/context-clues/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(finalScore)` | `EventBus.emit('audio:play', 'context-clues:endgame');` |

### 3. สวนสัตว์นักสืบ (Zoo Detective)

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Game BGM** | `Zoo Detective_BGM` | `assets/audio/zoo-detective/Zoo Detective_BGM.mp3` | `src/game/zoo-detective/scenes/StartMenu.js` | `create()` | `EventBus.emit('audio:bgm', 'zoo-detective');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/zoo-detective/Panel_PopUp.mp3` | `src/game/zoo-detective/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'zoo-detective:popup');` |
| **Correct** | `Correct` | `assets/audio/zoo-detective/Correct.mp3` | `src/game/zoo-detective/components/scripts/random-puzzle.js` | `checkAnswer(...)` if correct | `EventBus.emit('audio:play', 'zoo-detective:correct');` |
| **Wrong** | `Wrong` | `assets/audio/zoo-detective/Wrong.wav` | `src/game/zoo-detective/components/scripts/random-puzzle.js` | `checkAnswer(...)` if wrong | `EventBus.emit('audio:play', 'zoo-detective:wrong');` |
| **End Game** | `EndGame` | `assets/audio/zoo-detective/EndGame.mp3` | `src/game/zoo-detective/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(finalScore, ...)` | `EventBus.emit('audio:play', 'zoo-detective:endgame');` |

### 4. ภาพสะท้อน (Symmetry)

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Game BGM** | `Symmetry_BGM` | `assets/audio/symmetry-decor/Symmetry_BGM.mp3` | `src/game/symmetry-decor/scenes/StartMenu.js` | `create()` | `EventBus.emit('audio:bgm', 'symmetry-decor');` |
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/symmetry-decor/Panel_PopUp.mp3` | `src/game/symmetry-decor/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'symmetry-decor:popup');` |
| **Correct** | `Correct` | `assets/audio/symmetry-decor/Correct.mp3` | `src/game/symmetry-decor/scenes/Gameplay.js` | Validating match logic | `EventBus.emit('audio:play', 'symmetry-decor:correct');` |
| **Wrong** | `Wrong` | `assets/audio/symmetry-decor/Wrong.wav` | `src/game/symmetry-decor/scenes/Gameplay.js` | Validating mismatch logic | `EventBus.emit('audio:play', 'symmetry-decor:wrong');` |
| **End Game** | `EndGame` | `assets/audio/symmetry-decor/EndGame.mp3` | `src/game/symmetry-decor/scenes/Gameplay.js` | `onGameOver(status)` | `EventBus.emit('audio:play', 'symmetry-decor:endgame');` |

### 5. จดหมายจากหลานรัก (Postcard Reader)

> [!NOTE]
> BGM is intentionally omitted here because TTS (Text-To-Speech) is heavily used.

| Description | Sound Name | Audio Asset Path | Source Code File Path | Specific Location / Function | Code to Implement |
|---|---|---|---|---|---|
| **Cover PopUp** | `Panel_PopUp` | `assets/audio/postcard-reader/Panel_PopUp.mp3` | `src/game/postcard-reader/ui-elements/scripts/instruction-panel.js` | UI `show()` animation | `EventBus.emit('audio:play', 'postcard-reader:popup');` |
| **Correct** | `Correct` | `assets/audio/postcard-reader/Correct.mp3` | `src/game/postcard-reader/scenes/Gameplay.js` | Validation success logic | `EventBus.emit('audio:play', 'postcard-reader:correct');` |
| **Wrong** | `Wrong` | `assets/audio/postcard-reader/Wrong.wav` | `src/game/postcard-reader/scenes/Gameplay.js` | Validation failure logic | `EventBus.emit('audio:play', 'postcard-reader:wrong');` |
| **End Game** | `EndGame` | `assets/audio/postcard-reader/EndGame.mp3` | `src/game/postcard-reader/entity/script/ui/gameplay-ui.js` | `showGameOverPanel(...)` | `EventBus.emit('audio:play', 'postcard-reader:endgame');` |
