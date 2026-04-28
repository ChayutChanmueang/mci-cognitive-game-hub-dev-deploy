# Graph Report - .  (2026-04-28)

## Corpus Check
- Large corpus: 209 files · ~189,558 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 908 nodes · 1395 edges · 30 communities detected
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 259 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_.forceHide() + .forceShow() + .getItemViews()|.forceHide() + .forceShow() + .getItemViews()]]
- [[_COMMUNITY_Button + .constructor() + .destroy()|Button + .constructor() + .destroy()]]
- [[_COMMUNITY_.constructor() + ScrollContainer + .addMany()|.constructor() + ScrollContainer + .addMany()]]
- [[_COMMUNITY_DragDropManager + .acceptsDrop() + .destroy()|DragDropManager + .acceptsDrop() + .destroy()]]
- [[_COMMUNITY_Entity + .addComponent() + .constructor()|Entity + .addComponent() + .constructor()]]
- [[_COMMUNITY_main.js + clearPatientClientState() + clearSelecte|main.js + clearPatientClientState() + clearSelecte]]
- [[_COMMUNITY_UITestScene + .addScore() + .constructor()|UITestScene + .addScore() + .constructor()]]
- [[_COMMUNITY_thai-text.js + applyDeferredGoogleFont() + applyTh|thai-text.js + applyDeferredGoogleFont() + applyTh]]
- [[_COMMUNITY_Database + .addUserGameHistory() + .constructor()|Database + .addUserGameHistory() + .constructor()]]
- [[_COMMUNITY_Boot + .constructor() + .create()|Boot + .constructor() + .create()]]
- [[_COMMUNITY_.getNewQuiz() + RandomPuzzle + .constructor()|.getNewQuiz() + RandomPuzzle + .constructor()]]
- [[_COMMUNITY_BaseObjectPool + .acquire() + .activateMember()|BaseObjectPool + .acquire() + .activateMember()]]
- [[_COMMUNITY_HintLineViewer + .buildOptions() + .constructor()|HintLineViewer + .buildOptions() + .constructor()]]
- [[_COMMUNITY_AnimalIconTray + .constructor() + .createDefaultIt|AnimalIconTray + .constructor() + .createDefaultIt]]
- [[_COMMUNITY_EmojiRenderer + .awake() + .changeSprite()|EmojiRenderer + .awake() + .changeSprite()]]
- [[_COMMUNITY_Component + .awake() + .constructor()|Component + .awake() + .constructor()]]
- [[_COMMUNITY_auto-insert-layout.js + applyContainerOrigin() + b|auto-insert-layout.js + applyContainerOrigin() + b]]
- [[_COMMUNITY_MainMenuScene + .constructor() + .create()|MainMenuScene + .constructor() + .create()]]
- [[_COMMUNITY_DraggableComponent + .awake() + .constructor()|DraggableComponent + .awake() + .constructor()]]
- [[_COMMUNITY_player-info-screen.js + patient-date-util.js + cre|player-info-screen.js + patient-date-util.js + cre]]
- [[_COMMUNITY_signup-screen.js + clearFieldError() + createDateV|signup-screen.js + clearFieldError() + createDateV]]
- [[_COMMUNITY_QuizGameData + .constructor() + .decreaseScore()|QuizGameData + .constructor() + .decreaseScore()]]
- [[_COMMUNITY_ArcadeObjectPool + .activateMember() + .createGrou|ArcadeObjectPool + .activateMember() + .createGrou]]
- [[_COMMUNITY_MCI Cognitive Games Project Dashboard + Phaser 3.9|MCI Cognitive Games Project Dashboard + Phaser 3.9]]
- [[_COMMUNITY_GameplayTest + .constructor() + .preload()|GameplayTest + .constructor() + .preload()]]
- [[_COMMUNITY_Struct + .constructor() + struct.js|Struct + .constructor() + struct.js]]
- [[_COMMUNITY_DraggableDataComponent + .constructor() + draggabl|DraggableDataComponent + .constructor() + draggabl]]
- [[_COMMUNITY_GDD Zoo Detective + Procedural Generation System|GDD: Zoo Detective + Procedural Generation System]]
- [[_COMMUNITY_GDD Zoo Feeder|GDD: Zoo Feeder]]
- [[_COMMUNITY_GDD Symmetry Decor|GDD: Symmetry Decor]]

## God Nodes (most connected - your core abstractions)
1. `GameplayScene` - 55 edges
2. `Database` - 27 edges
3. `createThaiText()` - 26 edges
4. `renderCurrentRoute()` - 21 edges
5. `DragDropManager` - 18 edges
6. `GameplayUI` - 17 edges
7. `BaseObjectPool` - 17 edges
8. `UITestScene` - 16 edges
9. `HintLineViewer` - 15 edges
10. `RandomPuzzle` - 14 edges

## Surprising Connections (you probably didn't know these)
- `clearPatientClientState()` --calls--> `clearPatientSessionCookie()`  [INFERRED]
  src\main.js → src\util\patient-session.js
- `showLanding()` --calls--> `renderLandingScreen()`  [INFERRED]
  src\main.js → src\ui\landing-screen.js
- `showCheckInSummary()` --calls--> `renderCheckInSummaryScreen()`  [INFERRED]
  src\main.js → src\ui\checkin-summary-screen.js
- `showGame()` --calls--> `StartGame()`  [INFERRED]
  src\main.js → src\game\zoo-feeder\main.js
- `showSignup()` --calls--> `renderSignupScreen()`  [INFERRED]
  src\main.js → src\ui\signup-screen.js

## Communities

### Community 1 - ".forceHide() + .forceShow() + .getItemViews()"
Cohesion: 0.04
Nodes (5): ProgressBar, normalizePadding(), SquareGridLayout, GameplayScene, PostcardPanel

### Community 2 - "Button + .constructor() + .destroy()"
Cohesion: 0.04
Nodes (11): Button, ProgressBar, UIPage, UIPanel, GameEndPanel, NextQuizPanel, TemplatePanel, TutorialPanel (+3 more)

### Community 3 - ".constructor() + ScrollContainer + .addMany()"
Cohesion: 0.04
Nodes (21): ScrollContainer, main(), Clickable, buildDayItems(), clampDayCount(), renderCheckInSummaryScreen(), toDateKey(), buildProgramGamesFromPreset() (+13 more)

### Community 4 - "DragDropManager + .acceptsDrop() + .destroy()"
Cohesion: 0.05
Nodes (6): DragDropManager, StorageManager, Quiz, GameOverPanel, GameplayUI, getThaiFontFamily()

### Community 5 - "Entity + .addComponent() + .constructor()"
Cohesion: 0.04
Nodes (7): Entity, EntityGrid, Fruit, NonDraggableComponent, SocketComponent, SolutionSocketComponent, TriggerListener

### Community 6 - "main.js + clearPatientClientState() + clearSelecte"
Cohesion: 0.07
Nodes (39): clearPatientClientState(), clearSelectedGameState(), destroyActiveGame(), getCurrentRoute(), getGameRouteHash(), getHubRouteHash(), getPersistedSelectedGame(), getPersistedSelectedGameByGid() (+31 more)

### Community 7 - "UITestScene + .addScore() + .constructor()"
Cohesion: 0.07
Nodes (4): UITestScene, Animal, Conveyer, SpriteRenderer

### Community 8 - "thai-text.js + applyDeferredGoogleFont() + applyTh"
Cohesion: 0.13
Nodes (30): applyDeferredGoogleFont(), applyThaiTextSupport(), breakLongSegment(), buildGoogleFontCssUrl(), buildGoogleFontFamilyQuery(), createFontFamilyStack(), ensureGoogleFontAvailable(), ensureThaiFontLoaded() (+22 more)

### Community 9 - "Database + .addUserGameHistory() + .constructor()"
Cohesion: 0.18
Nodes (1): Database

### Community 10 - "Boot + .constructor() + .create()"
Cohesion: 0.07
Nodes (3): Boot, Preloader, DateTimeTimer

### Community 11 - ".getNewQuiz() + RandomPuzzle + .constructor()"
Cohesion: 0.13
Nodes (3): RandomPuzzle, RandomQuiz, removeFirstMatchingValueInPlace()

### Community 12 - "BaseObjectPool + .acquire() + .activateMember()"
Cohesion: 0.21
Nodes (1): BaseObjectPool

### Community 13 - "HintLineViewer + .buildOptions() + .constructor()"
Cohesion: 0.22
Nodes (1): HintLineViewer

### Community 14 - "AnimalIconTray + .constructor() + .createDefaultIt"
Cohesion: 0.24
Nodes (2): AnimalIconTray, normalizePadding()

### Community 15 - "EmojiRenderer + .awake() + .changeSprite()"
Cohesion: 0.18
Nodes (1): EmojiRenderer

### Community 16 - "Component + .awake() + .constructor()"
Cohesion: 0.2
Nodes (1): Component

### Community 17 - "auto-insert-layout.js + applyContainerOrigin() + b"
Cohesion: 0.49
Nodes (9): applyContainerOrigin(), breakSegmentByGrapheme(), createInlineSentence(), getWordSegments(), measureTextWidth(), normalizeOrigin(), normalizeTextStyle(), parseFontSize() (+1 more)

### Community 18 - "MainMenuScene + .constructor() + .create()"
Cohesion: 0.22
Nodes (1): MainMenuScene

### Community 19 - "DraggableComponent + .awake() + .constructor()"
Cohesion: 0.33
Nodes (1): DraggableComponent

### Community 20 - "player-info-screen.js + patient-date-util.js + cre"
Cohesion: 0.43
Nodes (5): createDateValue(), escapeHtml(), formatDisplayDate(), renderPlayerInfoScreen(), calculateAgeFromBirthDate()

### Community 21 - "signup-screen.js + clearFieldError() + createDateV"
Cohesion: 0.38
Nodes (3): createDateValue(), escapeHtml(), renderSignupScreen()

### Community 22 - "QuizGameData + .constructor() + .decreaseScore()"
Cohesion: 0.4
Nodes (1): QuizGameData

### Community 23 - "ArcadeObjectPool + .activateMember() + .createGrou"
Cohesion: 0.4
Nodes (1): ArcadeObjectPool

### Community 24 - "MCI Cognitive Games Project Dashboard + Phaser 3.9"
Cohesion: 0.4
Nodes (5): MCI Cognitive Games Project Dashboard, Phaser 3.90.0, MCI Cognitive Games Project, CAMT-FUN Proposal: Generative AI, Vite 6.3.1

### Community 25 - "GameplayTest + .constructor() + .preload()"
Cohesion: 0.5
Nodes (1): GameplayTest

### Community 26 - "Struct + .constructor() + struct.js"
Cohesion: 0.67
Nodes (1): Struct

### Community 27 - "DraggableDataComponent + .constructor() + draggabl"
Cohesion: 0.67
Nodes (1): DraggableDataComponent

### Community 33 - "GDD: Zoo Detective + Procedural Generation System"
Cohesion: 1.0
Nodes (2): GDD: Zoo Detective, Procedural Generation System

### Community 43 - "GDD: Zoo Feeder"
Cohesion: 1.0
Nodes (1): GDD: Zoo Feeder

### Community 44 - "GDD: Symmetry Decor"
Cohesion: 1.0
Nodes (1): GDD: Symmetry Decor

## Knowledge Gaps
- **8 isolated node(s):** `Phaser 3.90.0`, `Vite 6.3.1`, `MCI Cognitive Games Project Dashboard`, `GDD: Zoo Detective`, `GDD: Zoo Feeder` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Database + .addUserGameHistory() + .constructor()`** (28 nodes): `Database`, `.addUserGameHistory()`, `.constructor()`, `.createPatientProfile()`, `.deleteUserGameHistoryByHn()`, `.ensureSignedIn()`, `.getClient()`, `.getCurrentSession()`, `.getCurrentUser()`, `.getEducationLevels()`, `.getGameByGid()`, `.getGameList()`, `.getGamesByMciGroup()`, `.getPatientByHn()`, `.getPatientByUid()`, `.getPlayedGameGidsByHn()`, `.getUserCheckInDatesByHn()`, `.getUserGameHistoryByHn()`, `.initAuth()`, `.login()`, `.logUserEvent()`, `.patientExists()`, `.signInAnonymously()`, `.signOut()`, `.signup()`, `.submitGameData()`, `.submitHighScore()`, `database.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BaseObjectPool + .acquire() + .activateMember()`** (17 nodes): `BaseObjectPool`, `.acquire()`, `.activateMember()`, `.afterAcquire()`, `.beforeRelease()`, `.constructor()`, `.createGroup()`, `.createMember()`, `.deactivateMember()`, `.forEachActive()`, `.getActiveChildren()`, `.getChildren()`, `.getInactiveChildren()`, `.release()`, `.releaseAll()`, `.warmup()`, `base-object-pool.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `HintLineViewer + .buildOptions() + .constructor()`** (16 nodes): `HintLineViewer`, `.buildOptions()`, `.constructor()`, `.destroy()`, `.getCurrentHint()`, `.getDisplayedText()`, `.getState()`, `.hasNextHint()`, `.isComplete()`, `.rebuild()`, `.reset()`, `.resolveWrapWidth()`, `.revealAll()`, `.setOptions()`, `.showNextHint()`, `hint-line-viewer.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AnimalIconTray + .constructor() + .createDefaultIt`** (14 nodes): `AnimalIconTray`, `.constructor()`, `.createDefaultItemContent()`, `.drawItemBackground()`, `.getFooterBounds()`, `.getMetrics()`, `.measureHeight()`, `.rebuild()`, `.setConfig()`, `.setFooterReservation()`, `.setItems()`, `.setSelectedItem()`, `normalizePadding()`, `animal-icon-tray.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `EmojiRenderer + .awake() + .changeSprite()`** (11 nodes): `EmojiRenderer`, `.awake()`, `.changeSprite()`, `.constructor()`, `.destroy()`, `.update()`, `emoji-renderer.js`, `emoji-renderer.js`, `emoji-renderer.js`, `emoji-renderer.js`, `emoji-renderer.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component + .awake() + .constructor()`** (10 nodes): `Component`, `.awake()`, `.constructor()`, `.destroy()`, `.update()`, `component.js`, `component.js`, `component.js`, `component.js`, `component.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MainMenuScene + .constructor() + .create()`** (10 nodes): `MainMenuScene`, `.constructor()`, `.create()`, `.createButton()`, `.preload()`, `MainMenu.js`, `MainMenu.js`, `MainMenu.js`, `MainMenu.js`, `MainMenu.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DraggableComponent + .awake() + .constructor()`** (7 nodes): `DraggableComponent`, `.awake()`, `.constructor()`, `.destroy()`, `.setupDragEvents()`, `.snapBack()`, `draggable.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `QuizGameData + .constructor() + .decreaseScore()`** (5 nodes): `QuizGameData`, `.constructor()`, `.decreaseScore()`, `.increaseScore()`, `quiz-game-data.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ArcadeObjectPool + .activateMember() + .createGrou`** (5 nodes): `ArcadeObjectPool`, `.activateMember()`, `.createGroup()`, `.deactivateMember()`, `arcade-object-pool.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GameplayTest + .constructor() + .preload()`** (4 nodes): `GameplayTest`, `.constructor()`, `.preload()`, `GameplayTest.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Struct + .constructor() + struct.js`** (3 nodes): `Struct`, `.constructor()`, `struct.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DraggableDataComponent + .constructor() + draggabl`** (3 nodes): `DraggableDataComponent`, `.constructor()`, `draggableData.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GDD: Zoo Detective + Procedural Generation System`** (2 nodes): `GDD: Zoo Detective`, `Procedural Generation System`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GDD: Zoo Feeder`** (1 nodes): `GDD: Zoo Feeder`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GDD: Symmetry Decor`** (1 nodes): `GDD: Symmetry Decor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameplayScene` connect `Community 1` to `Community 2`, `Community 4`, `Community 5`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `createThaiText()` connect `Community 2` to `Community 1`, `Community 4`, `Community 8`, `Community 13`, `Community 18`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `showPlayerInfo()` connect `Community 6` to `Community 9`, `Community 2`, `Community 4`, `Community 20`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `createThaiText()` (e.g. with `.constructor()` and `.decreaseScore()`) actually correct?**
  _`createThaiText()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `renderCurrentRoute()` (e.g. with `getPatientSessionCookie()` and `.getGameByGid()`) actually correct?**
  _`renderCurrentRoute()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Phaser 3.90.0`, `Vite 6.3.1`, `MCI Cognitive Games Project Dashboard` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._