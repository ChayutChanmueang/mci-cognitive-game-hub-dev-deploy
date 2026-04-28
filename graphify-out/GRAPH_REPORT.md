# Graph Report - src  (2026-04-28)

## Corpus Check
- Corpus is ~42,297 words - fits in a single context window. You may not need a graph.

## Summary
- 680 nodes · 1174 edges · 30 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 257 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Phaser Gameplay Logic|Phaser Gameplay Logic]]
- [[_COMMUNITY_UI Core Components|UI Core Components]]
- [[_COMMUNITY_UI Progress & Navigation|UI Progress & Navigation]]
- [[_COMMUNITY_Local Storage Service|Local Storage Service]]
- [[_COMMUNITY_Game Hub & State Control|Game Hub & State Control]]
- [[_COMMUNITY_Main Menu Scenes|Main Menu Scenes]]
- [[_COMMUNITY_Sprite Rendering & Zoo Feeder|Sprite Rendering & Zoo Feeder]]
- [[_COMMUNITY_Database Management|Database Management]]
- [[_COMMUNITY_Drag & Drop Interactions|Drag & Drop Interactions]]
- [[_COMMUNITY_Entity Component Framework|Entity Component Framework]]
- [[_COMMUNITY_Grid Layout System|Grid Layout System]]
- [[_COMMUNITY_Game Lifecycle (BootPreloader)|Game Lifecycle (Boot/Preloader)]]
- [[_COMMUNITY_Postcard UI Elements|Postcard UI Elements]]
- [[_COMMUNITY_Memory Management (Object Pooling)|Memory Management (Object Pooling)]]
- [[_COMMUNITY_Zoo Detective Hint System|Zoo Detective Hint System]]
- [[_COMMUNITY_Grid Layout Utilities|Grid Layout Utilities]]
- [[_COMMUNITY_Zoo Detective Puzzle Logic|Zoo Detective Puzzle Logic]]
- [[_COMMUNITY_Animal UI Components|Animal UI Components]]
- [[_COMMUNITY_Emoji Graphics Rendering|Emoji Graphics Rendering]]
- [[_COMMUNITY_Component Base Classes|Component Base Classes]]
- [[_COMMUNITY_Text Layout & Parsing|Text Layout & Parsing]]
- [[_COMMUNITY_Draggable Component Logic|Draggable Component Logic]]
- [[_COMMUNITY_Form Validation & Signup UI|Form Validation & Signup UI]]
- [[_COMMUNITY_Player Profile Management|Player Profile Management]]
- [[_COMMUNITY_Quiz Mechanics|Quiz Mechanics]]
- [[_COMMUNITY_Game Scoring System|Game Scoring System]]
- [[_COMMUNITY_Arcade Physics Object Pooling|Arcade Physics Object Pooling]]
- [[_COMMUNITY_Game Testing Scenes|Game Testing Scenes]]
- [[_COMMUNITY_Data Structures|Data Structures]]
- [[_COMMUNITY_Draggable Data Handling|Draggable Data Handling]]

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
  main.js → util\patient-session.js
- `showLanding()` --calls--> `renderLandingScreen()`  [INFERRED]
  main.js → ui\landing-screen.js
- `showCheckInSummary()` --calls--> `renderCheckInSummaryScreen()`  [INFERRED]
  main.js → ui\checkin-summary-screen.js
- `showGame()` --calls--> `StartGame()`  [INFERRED]
  main.js → game\zoo-feeder\main.js
- `showSignup()` --calls--> `renderSignupScreen()`  [INFERRED]
  main.js → ui\signup-screen.js

## Communities

### Community 0 - "Phaser Gameplay Logic"
Cohesion: 0.06
Nodes (3): GameplayScene, SolutionSocketComponent, removeFirstMatchingValueInPlace()

### Community 1 - "UI Core Components"
Cohesion: 0.04
Nodes (20): Button, Clickable, buildDayItems(), clampDayCount(), renderCheckInSummaryScreen(), toDateKey(), buildProgramGamesFromPreset(), DailyGoalTopBar (+12 more)

### Community 2 - "UI Progress & Navigation"
Cohesion: 0.05
Nodes (7): ProgressBar, UIPage, UIPanel, ScrollContainer, NextQuizPanel, TemplatePanel, TutorialPanel

### Community 3 - "Local Storage Service"
Cohesion: 0.06
Nodes (5): StorageManager, GameEndPanel, GameOverPanel, GameplayUI, DateTimeTimer

### Community 4 - "Game Hub & State Control"
Cohesion: 0.07
Nodes (39): clearPatientClientState(), clearSelectedGameState(), destroyActiveGame(), getCurrentRoute(), getGameRouteHash(), getHubRouteHash(), getPersistedSelectedGame(), getPersistedSelectedGameByGid() (+31 more)

### Community 5 - "Main Menu Scenes"
Cohesion: 0.08
Nodes (34): MainMenuScene, applyDeferredGoogleFont(), applyTextOrigin(), applyThaiTextSupport(), breakLongSegment(), buildGoogleFontCssUrl(), buildGoogleFontFamilyQuery(), createFontFamilyStack() (+26 more)

### Community 6 - "Sprite Rendering & Zoo Feeder"
Cohesion: 0.07
Nodes (4): UITestScene, Animal, Conveyer, SpriteRenderer

### Community 7 - "Database Management"
Cohesion: 0.18
Nodes (1): Database

### Community 8 - "Drag & Drop Interactions"
Cohesion: 0.13
Nodes (3): DragDropManager, Quiz, getThaiFontFamily()

### Community 9 - "Entity Component Framework"
Cohesion: 0.08
Nodes (3): Entity, Fruit, TriggerListener

### Community 10 - "Grid Layout System"
Cohesion: 0.11
Nodes (3): EntityGrid, NonDraggableComponent, SocketComponent

### Community 11 - "Game Lifecycle (Boot/Preloader)"
Cohesion: 0.1
Nodes (2): Boot, Preloader

### Community 12 - "Postcard UI Elements"
Cohesion: 0.14
Nodes (2): ProgressBar, PostcardPanel

### Community 13 - "Memory Management (Object Pooling)"
Cohesion: 0.21
Nodes (1): BaseObjectPool

### Community 14 - "Zoo Detective Hint System"
Cohesion: 0.22
Nodes (1): HintLineViewer

### Community 15 - "Grid Layout Utilities"
Cohesion: 0.23
Nodes (2): normalizePadding(), SquareGridLayout

### Community 16 - "Zoo Detective Puzzle Logic"
Cohesion: 0.27
Nodes (1): RandomPuzzle

### Community 17 - "Animal UI Components"
Cohesion: 0.27
Nodes (2): AnimalIconTray, normalizePadding()

### Community 18 - "Emoji Graphics Rendering"
Cohesion: 0.18
Nodes (1): EmojiRenderer

### Community 19 - "Component Base Classes"
Cohesion: 0.2
Nodes (1): Component

### Community 20 - "Text Layout & Parsing"
Cohesion: 0.49
Nodes (9): applyContainerOrigin(), breakSegmentByGrapheme(), createInlineSentence(), getWordSegments(), measureTextWidth(), normalizeOrigin(), normalizeTextStyle(), parseFontSize() (+1 more)

### Community 21 - "Draggable Component Logic"
Cohesion: 0.33
Nodes (1): DraggableComponent

### Community 22 - "Form Validation & Signup UI"
Cohesion: 0.38
Nodes (3): createDateValue(), escapeHtml(), renderSignupScreen()

### Community 23 - "Player Profile Management"
Cohesion: 0.43
Nodes (5): createDateValue(), escapeHtml(), formatDisplayDate(), renderPlayerInfoScreen(), calculateAgeFromBirthDate()

### Community 24 - "Quiz Mechanics"
Cohesion: 0.4
Nodes (1): RandomQuiz

### Community 25 - "Game Scoring System"
Cohesion: 0.4
Nodes (1): QuizGameData

### Community 26 - "Arcade Physics Object Pooling"
Cohesion: 0.4
Nodes (1): ArcadeObjectPool

### Community 27 - "Game Testing Scenes"
Cohesion: 0.5
Nodes (1): GameplayTest

### Community 28 - "Data Structures"
Cohesion: 0.67
Nodes (1): Struct

### Community 29 - "Draggable Data Handling"
Cohesion: 0.67
Nodes (1): DraggableDataComponent

## Knowledge Gaps
- **Thin community `Database Management`** (28 nodes): `Database`, `.addUserGameHistory()`, `.constructor()`, `.createPatientProfile()`, `.deleteUserGameHistoryByHn()`, `.ensureSignedIn()`, `.getClient()`, `.getCurrentSession()`, `.getCurrentUser()`, `.getEducationLevels()`, `.getGameByGid()`, `.getGameList()`, `.getGamesByMciGroup()`, `.getPatientByHn()`, `.getPatientByUid()`, `.getPlayedGameGidsByHn()`, `.getUserCheckInDatesByHn()`, `.getUserGameHistoryByHn()`, `.initAuth()`, `.login()`, `.logUserEvent()`, `.patientExists()`, `.signInAnonymously()`, `.signOut()`, `.signup()`, `.submitGameData()`, `.submitHighScore()`, `database.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game Lifecycle (Boot/Preloader)`** (21 nodes): `Boot.js`, `Preloader.js`, `Boot.js`, `Preloader.js`, `Boot.js`, `Preloader.js`, `Boot.js`, `Preloader.js`, `Boot.js`, `Preloader.js`, `Boot`, `.constructor()`, `.create()`, `.preload()`, `.startGameTimer()`, `Preloader`, `.constructor()`, `.create()`, `.init()`, `.preload()`, `.start()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Postcard UI Elements`** (20 nodes): `.forceShow()`, `postcard-panel.js`, `ProgressBar`, `.animateTo()`, `.constructor()`, `.destroy()`, `.empty()`, `.fill()`, `.redraw()`, `.reset()`, `.setColors()`, `.setValue()`, `.resetGameTimer()`, `.showGame()`, `PostcardPanel`, `.createButton()`, `.reinitializedPanel()`, `.update()`, `.stop()`, `progress-bar.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Memory Management (Object Pooling)`** (17 nodes): `BaseObjectPool`, `.acquire()`, `.activateMember()`, `.afterAcquire()`, `.beforeRelease()`, `.constructor()`, `.createGroup()`, `.createMember()`, `.deactivateMember()`, `.forEachActive()`, `.getActiveChildren()`, `.getChildren()`, `.getInactiveChildren()`, `.release()`, `.releaseAll()`, `.warmup()`, `base-object-pool.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zoo Detective Hint System`** (16 nodes): `hint-line-viewer.js`, `HintLineViewer`, `.buildOptions()`, `.constructor()`, `.destroy()`, `.getCurrentHint()`, `.getDisplayedText()`, `.getState()`, `.hasNextHint()`, `.isComplete()`, `.rebuild()`, `.reset()`, `.resolveWrapWidth()`, `.revealAll()`, `.setOptions()`, `.showNextHint()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Grid Layout Utilities`** (14 nodes): `normalizePadding()`, `SquareGridLayout`, `.addToCell()`, `.clearAllCells()`, `.clearCell()`, `.constructor()`, `.getCell()`, `.getMetrics()`, `.rebuild()`, `.setBoundsSize()`, `.setConfig()`, `.setGridSize()`, `.renderAnimalInCell()`, `square-grid-layout.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Zoo Detective Puzzle Logic`** (13 nodes): `random-puzzle.js`, `RandomPuzzle`, `.constructor()`, `.generateHints()`, `.getAnimalKey()`, `.getAnimalLabel()`, `.getHintRelatedIndexes()`, `.getNeighborCandidates()`, `.getPositionName()`, `.getPuzzle()`, `.getRelationPhrase()`, `.randomInt()`, `.shuffle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Animal UI Components`** (13 nodes): `AnimalIconTray`, `.constructor()`, `.createDefaultItemContent()`, `.drawItemBackground()`, `.getMetrics()`, `.measureHeight()`, `.rebuild()`, `.setConfig()`, `.setFooterReservation()`, `.setItems()`, `.setSelectedItem()`, `normalizePadding()`, `animal-icon-tray.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Emoji Graphics Rendering`** (11 nodes): `emoji-renderer.js`, `emoji-renderer.js`, `emoji-renderer.js`, `emoji-renderer.js`, `emoji-renderer.js`, `EmojiRenderer`, `.awake()`, `.changeSprite()`, `.constructor()`, `.destroy()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Component Base Classes`** (10 nodes): `Component`, `.awake()`, `.constructor()`, `.destroy()`, `.update()`, `component.js`, `component.js`, `component.js`, `component.js`, `component.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Draggable Component Logic`** (7 nodes): `draggable.js`, `DraggableComponent`, `.awake()`, `.constructor()`, `.destroy()`, `.setupDragEvents()`, `.snapBack()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Quiz Mechanics`** (6 nodes): `random-quiz.js`, `RandomQuiz`, `.buildAnswer()`, `.checkAnswer()`, `.constructor()`, `.shuffle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game Scoring System`** (5 nodes): `quiz-game-data.js`, `QuizGameData`, `.constructor()`, `.decreaseScore()`, `.increaseScore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Arcade Physics Object Pooling`** (5 nodes): `ArcadeObjectPool`, `.activateMember()`, `.createGroup()`, `.deactivateMember()`, `arcade-object-pool.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Game Testing Scenes`** (4 nodes): `GameplayTest.js`, `GameplayTest`, `.constructor()`, `.preload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Structures`** (3 nodes): `Struct`, `.constructor()`, `struct.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Draggable Data Handling`** (3 nodes): `draggableData.js`, `DraggableDataComponent`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameplayScene` connect `Phaser Gameplay Logic` to `Local Storage Service`, `Main Menu Scenes`, `Grid Layout System`, `Game Lifecycle (Boot/Preloader)`, `Postcard UI Elements`, `Grid Layout Utilities`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `createThaiText()` connect `Main Menu Scenes` to `Phaser Gameplay Logic`, `UI Core Components`, `UI Progress & Navigation`, `Local Storage Service`, `Zoo Detective Hint System`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `showPlayerInfo()` connect `Game Hub & State Control` to `Drag & Drop Interactions`, `UI Progress & Navigation`, `Player Profile Management`, `Database Management`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `createThaiText()` (e.g. with `.constructor()` and `.decreaseScore()`) actually correct?**
  _`createThaiText()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `renderCurrentRoute()` (e.g. with `getPatientSessionCookie()` and `.getGameByGid()`) actually correct?**
  _`renderCurrentRoute()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Phaser Gameplay Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `UI Core Components` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._