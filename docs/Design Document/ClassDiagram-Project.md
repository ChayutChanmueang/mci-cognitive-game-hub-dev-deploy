# Class Diagram - MCI Cognitive Games

---

## *Document Version: 1.0*  
*Project: MCI Cognitive Games*  
*Last Updated: 2026-04-21*

## 1. Game Architecture

```mermaid
classDiagram
    direction TB

    class PhaserScene {
        <<abstract>>
    }

    class Boot {
        +create(): void
    }

    class Preloader {
        +preload(): void
        +create(): void
    }

    class MainMenu {
        +create(): void
    }

    class GameplayScene {
        -level: int
        -round: int
        -allScore: int
        -roundScore: int
        +create(): void
        +update(time, delta): void
    }

    class GameOver {
        +create(): void
    }

    PhaserScene <|-- Boot
    PhaserScene <|-- Preloader
    PhaserScene <|-- MainMenu
    PhaserScene <|-- GameplayScene
    PhaserScene <|-- GameOver
```

##  Core Base Classes

```mermaid
classDiagram
    direction TB

    class Entity {
        <<abstract>>
        -x: number
        -y: number
        -texture: string
        -components: Component[]
        -data: Object
        +addComponent(ComponentClass, ...args)
        +getComponent(ComponentClass)
        +preUpdate(time, delta)
        +destroy(fromScene)
    }

    class Component {
        <<abstract>>
        -entity: Entity
        -scene: PhaserScene
        +awake()
        +update(time, delta)
        +destroy()
    }

    Entity --> Component : has
```

---

## 3. Component System

```mermaid
classDiagram
    direction TB

    class Clickable {
        +onClick: Function
        +onHover: Function
        +enable()
        +disable()
    }

    class TriggerListener {
        +triggerName: string
        +onTrigger: Function
        +subscribe()
        +unsubscribe()
    }

    class EmojiRenderer {
        +emoji: string
        +render()
        +updateEmoji(emoji)
    }

    Component <|-- Clickable
    Component <|-- TriggerListener
    Component <|-- EmojiRenderer
```

---

## 4. Zoo Detective Classes

```mermaid
classDiagram
    direction TB

    class GameplayScene {
        -level: int
        -round: int
        -allScore: int
        -puzzleData: Object
        -puzzleGenerator: RandomPuzzle
        -gridBoard: SquareGridLayout
        -animalTray: AnimalIconTray
        -hintViewer: HintLineViewer
        -selectedAnimal: Object
        -currentHintIndex: int
        -onPuzzleCompleted: Function
    }

    class RandomPuzzle {
        -animals: Animal[]
        -hints: String[]
        +generatePuzzle()
        +checkPlacement()
        +validateHints()
        +getNextHint()
    }

    class HintLineViewer {
        -hints: String[]
        -currentIndex: int
        +showNextHint()
        +highlightHint(index)
        +clear()
    }

    class AnimalIconTray {
        -animals: Object[]
        -selectedIndex: int
        +selectAnimal(index)
        +deselectAnimal()
        +getSelectedAnimal()
        +updateTray()
    }

    class SquareGridLayout {
        -rows: int
        -columns: int
        -cellWidth: number
        -cellHeight: number
        -cells: Cell[]
        +placeAnimal(animal, index)
        +removeAnimal(index)
        +getCellAt(x, y)
        +isFull()
    }

    GameplayScene --> RandomPuzzle
    GameplayScene --> HintLineViewer
    GameplayScene --> AnimalIconTray
    GameplayScene --> SquareGridLayout
```

---

## 5. Zoo Feeder Classes

```mermaid
classDiagram
    direction TB

    class ZooFeederGameplay {
        -conveyor: Conveyor
        -animals: Animal[]
        -foodItems: Food[]
        -score: int
        -timeLeft: number
        +create()
        +update()
    }

    class Conveyor {
        -x: number
        -y: number
        -speed: number
        -items: GameObject[]
        +spawnItem()
        +moveItems()
        +removeItem(index)
    }

    class Animal {
        -id: string
        -type: FoodType
        -happiness: int
        -sprite: string
        +feed(foodType)
        +isHungry()
        +showReaction()
    }

    class Food {
        -type: FoodType
        -sprite: string
        -isCollected: boolean
    }

    class GameplayUI {
        -scoreText: Text
        -timerText: Text
        -happinessBars: ProgressBar[]
        +updateScore(points)
        +updateTimer(time)
        +showFeedback(isCorrect)
    }

    class FoodTypes {
        <<enumeration>>
        VEGETABLE
        MEAT
        JUNK
    }

    class GameLevels {
        <<enumeration>>
        EASY
        MEDIUM
        HARD
    }

    ZooFeederGameplay --> Conveyor
    ZooFeederGameplay --> Animal
    ZooFeederGameplay --> Food
    ZooFeederGameplay --> GameplayUI
```

---

## 6. Context Clues Classes

```mermaid
classDiagram
    direction TB

    class ContextCluesGameplay {
        -currentQuestion: QuizData
        -selectedAnswer: string
        -score: int
        -round: int
        -maxRounds: int
    }

    class QuizGameData {
        -easy: QuizItem[]
        -medium: QuizItem[]
        -hard: QuizItem[]
        +getQuestions(difficulty)
    }

    class QuizItem {
        -id: string
        -textParts: String[]
        -correctAnswers: String[]
        -options: String[]
    }

    class QuizUI {
        -questionText: String
        -slots: Slot[]
        -options: OptionButton[]
        +showQuestion(quiz)
        +highlightCorrect()
        +highlightWrong()
    }

    class Slot {
        -text: String
        -isFilled: boolean
        -answer: String
    }

    class OptionButton {
        -text: String
        -isCorrect: boolean
        +onSelect()
    }

    ContextCluesGameplay --> QuizGameData
    ContextCluesGameplay --> QuizUI
    QuizUI --> Slot
    QuizUI --> OptionButton
```

---

## 7. Symmetry Decor Classes

```mermaid
classDiagram
    direction TB

    class SymmetryDecorGameplay {
        -decorations: DecorationItem[]
        -symmetryAxis: string
        -score: int
    }

    class DecorationItem {
        -id: string
        -type: string
        -x: number
        -y: number
        -mirroredX: number
        -mirroredY: number
        +drag()
        +drop()
        +mirror()
    }

    class TemplatePanel {
        -items: DecorationItem[]
        +selectItem(index)
        +clearSelection()
    }

    class SymmetryLogicEngine {
        -axisType: string
        +calculateMirrorPosition(x, y)
        +checkSymmetry(decorations)
        +evaluateDesign()
    }

    class UIPanel {
        -gridWidth: number
        -gridHeight: number
        -axisLine: Graphics
        +drawGrid()
        +drawAxis()
    }

    SymmetryDecorGameplay --> DecorationItem
    SymmetryDecorGameplay --> TemplatePanel
    SymmetryDecorGameplay --> SymmetryLogicEngine
    SymmetryDecorGameplay --> UIPanel
```

---

## 8. Postcard Reader Classes

```mermaid
classDiagram
    direction TB

    class PostcardReaderGameplay {
        -postcards: Postcard[]
        -currentPostcard: Postcard
        -questions: Question[]
        -currentQuestionIndex: int
        -score: int
    }

    class Postcard {
        -text: String
        -highlightedWords: String[]
    }

    class Question {
        -questionText: String
        -choices: Choice[]
        -correctChoice: Choice
    }

    class Choice {
        -text: String
        -emoji: String
        -isCorrect: boolean
    }

    class PostcardPanel {
        -postcardText: Text
        -wordHighlights: Object[]
        +showPostcard(postcard)
        +highlightWords()
    }

    PostcardReaderGameplay --> Postcard
    PostcardReaderGameplay --> Question
    PostcardReaderGameplay --> PostcardPanel
    Question --> Choice
```

---

## 9. UI System

```mermaid
classDiagram
    direction TB

    class UIPanel {
        <<abstract>>
        -scene: PhaserScene
        -x: number
        -y: number
        -width: number
        -height: number
        -background: GameObject
        +show()
        +hide()
        +setPosition(x, y)
    }

    class GameOverPanel {
        -scoreText: Text
        -homeButton: Button
        -restartButton: Button
        +showFinalScore(score)
    }

    class TutorialPanel {
        -content: Text
        -nextButton: Button
        -skipButton: Button
        +showTutorial(steps)
    }

    class NextQuizPanel {
        -continueButton: Button
        +show()
    }

    class ProgressBar {
        -value: number
        -maxValue: number
        -width: number
        -height: number
        +setValue(value)
        +animateTo(value, duration)
    }

    class Button {
        -text: String
        -isEnabled: boolean
        -onClick: Function
        +setText(text)
        +enable()
        +disable()
    }

    UIPanel <|-- GameOverPanel
    UIPanel <|-- TutorialPanel
    UIPanel <|-- NextQuizPanel
    UIPanel --> ProgressBar
    UIPanel --> Button
```

---

## 10. Database System

```mermaid
classDiagram
    direction TB

    class Database {
        -client: SupabaseClient
        -authReadyPromise: Promise
        -supabaseUrl: string
        -supabaseAnonKey: string
        +getClient()
        +initAuth()
        +ensureSignedIn()
        +signInAnonymously()
        +login(email, password)
        +signup(email, password)
        +signOut()
        +getCurrentSession()
        +getCurrentUser()
        +getPatientByHn(hn)
        +createPatientProfile(data)
        +getGameList()
        +getGamesByMciGroup(mciGroup)
        +getGameByGid(gid)
        +submitGameData(data)
        +logUserEvent(eventId, gid)
    }

    class StorageManager {
        -cache: Map
        +set(key, value)
        +get(key)
        +remove(key)
        +clear()
    }

    class PatientSession {
        -patientData: PatientData
        -currentGame: string
        -sessionStart: Date
        +init(patientData)
        +startGame(gid)
        +endGame()
        +getPlayTime()
    }

    class PatientData {
        +id: string
        +uid: string
        +hn: string
        +firstname: string
        +lastname: string
        +age: int
        +gender: string
        +education_level: int
        +started_program: Date
    }

    class GameData {
        +id: string
        +gid: string
        +score: int
        +level: int
        +started_at: Date
        +ended_at: Date
    }

    Database --> StorageManager
    Database --> PatientSession
    PatientSession --> PatientData
    Database --> GameData
```

---

## 11. Layout Utilities

```mermaid
classDiagram
    direction TB

    class SquareGridLayout {
        -rows: int
        -columns: int
        -cellWidth: number
        -cellHeight: number
        -spacing: number
        -cells: Cell[]
        +calculateLayout()
        +getCellPosition(row, col)
        +getCellAtPosition(x, y)
    }

    class Cell {
        -row: int
        -col: int
        -x: number
        -y: number
        -content: Object
        -isLocked: boolean
        +setContent(obj)
        +clearContent()
        +lock()
        +unlock()
    }

    class AnimalIconTray {
        -animals: Object[]
        -iconSize: number
        -spacing: number
        +createIcons()
        +highlightSelected(index)
        +updateAvailability()
    }

    class DotProgressBar {
        -totalDots: int
        -filledDots: int
        -dotSize: number
        +setProgress(value)
        +animateProgress()
    }

    SquareGridLayout --> Cell
```

---

## 12. Object Pool System

```mermaid
classDiagram
    direction TB

    class BaseObjectPool {
        <<abstract>>
        -available: Object[]
        -inUse: Object[]
        +acquire()
        +release(obj)
        +preload(count)
    }

    class ArcadeObjectPool {
        +createSprite(config)
        +createGroup(config)
    }

    class ObjectPoolManager {
        -pools: Map
        +registerPool(name, pool)
        +getPool(name)
        +clearAll()
    }

    BaseObjectPool <|-- ArcadeObjectPool
    ObjectPoolManager --> BaseObjectPool
```

---

## 13. Project Structure

```mermaid
classDiagram
    direction LR

    namespace core {
        class Database
        class StorageManager
        class DragDropManager
    }

    namespace game {
        class GameScene
        class Entity
    }

    namespace ui {
        class UIPanel
        class Button
        class ProgressBar
    }

    namespace util {
        class Layout
        class ObjectPool
        class ThaiText
    }

    namespace zoo_detective {
        class ZooDetectiveGameplay
        class RandomPuzzle
        class HintLineViewer
    }

    namespace zoo_feeder {
        class ZooFeederGameplay
        class Conveyor
        class Animal
    }

    namespace context_clues {
        class ContextCluesGameplay
        class QuizGameData
    }

    namespace symmetry_decor {
        class SymmetryDecorGameplay
        class SymmetryLogicEngine
    }

    namespace postcard_reader {
        class PostcardReaderGameplay
        class Postcard
    }
```

---

## Notes

- ใช้ `<<abstract>>` สำหรับ abstract classes
- ใช้ `<<interface>>` สำหรับ interfaces
- ใช้ `<<enumeration>>` สำหรับ enums
- Entity-Component pattern ใช้ในเกมทั้งหมด
- ทุก Scene สืบทอดจาก `Phaser.Scene`