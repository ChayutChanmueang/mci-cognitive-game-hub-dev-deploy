# Class Diagram - [Game Title]

---

**Project:** [Project Name]
**Version:** 1.0
**Status:** [Draft/Review/Final]
**Last Updated:** [YYYY-MM-DD]

---

## 1. Game Architecture

```mermaid
classDiagram
    direction TB

    class Game1 {
        -GraphicsDeviceManager _graphics
        -SpriteBatch _spriteBatch
        +Game1()
        +Initialize()
        +LoadContent()
        +Update(gameTime: GameTime)
        +Draw(gameTime: GameTime)
    }

    class GameState {
        <<enumeration>>
        MainMenu
        Loading
        Gameplay
        Paused
        LevelComplete
        GameOver
        Victory
    }
```

---

## 2. Core Classes

```mermaid
classDiagram
    direction TB

    class Entity {
        <<abstract>>
        -Vector2 Position
        -Vector2 Velocity
        -Vector2 Size
        -bool IsActive
        +Update(gameTime: GameTime) void
        +Draw(spriteBatch: SpriteBatch) void
        +GetBounds() Rectangle
    }

    class Player {
        -float MoveSpeed
        -float JumpForce
        -int MaxJumpCount
        -int CurrentJumpCount
        -bool IsGrounded
        -int Health
        -int Coins
        -int Score
        +Update(gameTime: GameTime) void
        +Move(direction: int) void
        +Jump() void
        +PerformAttack() void
        +TakeDamage(amount: int) void
    }

    class Enemy {
        <<abstract>>
        -int Health
        -int Damage
        -float MoveSpeed
        -IEnemyBehavior Behavior
        +Update(gameTime: GameTime) void
        +PerformAction() void
        +TakeDamage(amount: int) void
    }

    class IEnemyBehavior {
        <<interface>>
        +Update(enemy: Enemy, player: Player) void
    }

    class Boss {
        -int MaxHealth
        -int CurrentPhase
        -List~BossPhase~ Phases
        +Update(gameTime: GameTime) void
        +ChangePhase(phase: int) void
        +PerformSpecialAttack() void
    }

    Entity <|-- Player
    Entity <|-- Enemy
    Entity <|-- Boss
    Enemy ..> IEnemyBehavior
```

---

## 3. Enemy Types

```mermaid
classDiagram
    direction LR

    class PatrolBehavior {
        +List~Vector2~ Waypoints
        +int CurrentWaypointIndex
        +Update(enemy: Enemy, player: Player) void
    }

    class ChaseBehavior {
        -float ChaseRange
        +Update(enemy: Enemy, player: Player) void
    }

    class RangedBehavior {
        -float AttackRange
        -float FireRate
        +Update(enemy: Enemy, player: Player) void
    }

    class Enemy1 {
        +Update(gameTime: GameTime) void
    }

    class Enemy2 {
        +Update(gameTime: GameTime) void
    }

    class Enemy3 {
        -float AttackCooldown
        +Update(gameTime: GameTime) void
    }

    IEnemyBehavior <|.. PatrolBehavior
    IEnemyBehavior <|.. ChaseBehavior
    IEnemyBehavior <|.. RangedBehavior

    PatrolBehavior --> Enemy1 : uses
    ChaseBehavior --> Enemy2 : uses
    RangedBehavior --> Enemy3 : uses
```

---

## 4. Collectibles & Items

```mermaid
classDiagram
    direction TB

    class Collectible {
        <<abstract>>
        -CollectibleType Type
        -int Value
        +Update(gameTime: GameTime) void
        +Collect(player: Player) void
    }

    class Coin {
        +Collect(player: Player) void
    }

    class Heart {
        +Collect(player: Player) void
    }

    class Item1 {
        -string RequiredLevel
        +Collect(player: Player) void
    }

    class Projectile {
        -Vector2 Direction
        -float Speed
        -int Damage
        -bool IsEnemyProjectile
        +Update(gameTime: GameTime) void
    }

    Collectible <|-- Coin
    Collectible <|-- Heart
    Collectible <|-- Item1
    Entity <|-- Projectile
```

---

## 5. Level & World

```mermaid
classDiagram
    direction TB

    class GameLevel {
        -string Name
        -List~Entity~ Entities
        -List~Tile~ Tiles
        -Camera Camera
        -Background Background
        +Load(levelName: string) void
        +Update(gameTime: GameTime) void
        +Draw(spriteBatch: SpriteBatch) void
        +CheckWinCondition() bool
    }

    class Tile {
        -int X
        -int Y
        -TileType Type
        -Rectangle SourceRect
        +IsSolid() bool
    }

    class Camera {
        -Vector2 Position
        -float Zoom
        -Viewport Viewport
        +Follow(target: Entity) void
        +GetTransformMatrix() Matrix
    }

    class Tileset {
        -Texture2D Texture
        -int TileWidth
        -int TileHeight
        -int Columns
        +GetTileRect(index: int) Rectangle
    }

    GameLevel --> Tile
    GameLevel --> Camera
    GameLevel --> Tileset
```

---

## 6. UI & HUD

```mermaid
classDiagram
    direction TB

    class GameUI {
        <<abstract>>
        +Draw(spriteBatch: SpriteBatch) void
    }

    class HUD {
        -SpriteFont Font
        -int HeartsDisplay
        -int CoinsDisplay
        -int ScoreDisplay
        -float TimeDisplay
        +Update(player: Player) void
        +Draw(spriteBatch: SpriteBatch) void
    }

    class HealthDisplay {
        -int MaxHearts
        -int CurrentHearts
        +Draw(spriteBatch: SpriteBatch) void
        +Update(health: int) void
    }

    class MenuScreen {
        <<abstract>>
        -List~MenuItem~ Items
        -int SelectedIndex
        +Update(gameTime: GameTime) void
        +Draw(spriteBatch: SpriteBatch) void
        +HandleInput() void
    }

    class MainMenu {
        +HandleInput() void
    }

    class PauseMenu {
        +HandleInput() void
    }

    class GameOverScreen {
        +HandleInput() void
    }

    class VictoryScreen {
        +HandleInput() void
    }

    GameUI <|-- HUD
    GameUI <|-- HealthDisplay
    MenuScreen <|-- MainMenu
    MenuScreen <|-- PauseMenu
    MenuScreen <|-- GameOverScreen
    MenuScreen <|-- VictoryScreen
```

---

## 7. Audio System

```mermaid
classDiagram
    direction TB

    class AudioManager {
        -Dictionary~string, Song~ Songs
        -Dictionary~string, SoundEffect~ Effects
        -float MusicVolume
        -float SfxVolume
        -Song CurrentSong
        +PlayMusic(trackName: string) void
        +StopMusic() void
        +PlaySfx(soundName: string) void
        +SetMusicVolume(volume: float) void
        +SetSfxVolume(volume: float) void
    }

    class SoundEffectNames {
        <<enumeration>>
        [Effect1]
        [Effect2]
        [Effect3]
        [Effect4]
        [Effect5]
        [Effect6]
        [Effect7]
        [Effect8]
    }

    class MusicTracks {
        <<enumeration>>
        [Track1]
        [Track2]
        [Track3]
        [Track4]
        [Track5]
        [Track6]
    }
```

---

## 8. Save System

```mermaid
classDiagram
    direction TB

    class SaveSystem {
        -string SaveFilePath
        +Save(playerData: PlayerData) void
        +Load() PlayerData
        +Delete() void
        +Exists() bool
    }

    class PlayerData {
        +int Health
        +int Coins
        +int Score
        +int CurrentLevel
        +List~string~ UnlockedAbilities
        +float PlayTime
    }

    class LevelProgress {
        +Dictionary~string, bool~ LevelCleared
        +Dictionary~string, int~ HighScores
    }

    SaveSystem --> PlayerData
    SaveSystem --> LevelProgress
```

---

## 9. Collision System

```mermaid
classDiagram
    direction TB

    class CollisionSystem {
        +CheckCollision(entity1: Entity, entity2: Entity) bool
        +CheckTileCollision(entity: Entity, tiles: List~Tile~) bool
        +GetCollisionDirection(entity: Entity, tiles: List~Tile~) Direction
    }

    class Direction {
        <<enumeration>>
        None
        Top
        Bottom
        Left
        Right
    }

    class CollisionType {
        <<enumeration>>
        Solid
        Damage
        Collectible
        Trigger
        PassThrough
    }
```

---

## 10. Input System

```mermaid
classDiagram
    direction TB

    class InputManager {
        -KeyboardState CurrentKeys
        -KeyboardState PreviousKeys
        +IsKeyPressed(key: Keys) bool
        +IsKeyDown(key: Keys) bool
        +GetMovementDirection() int
        +IsJumpPressed() bool
        +IsAttackPressed() bool
        +Update() void
    }

    class KeyBindings {
        <<static>>
        +Keys MoveLeft
        +Keys MoveRight
        +Keys Jump
        +Keys Attack
        +Keys RangedAttack
        +Keys Pause
    }
```

---

## 11. Effects & Particles

```mermaid
classDiagram
    direction TB

    class ParticleSystem {
        -List~Particle~ Particles
        -Texture2D Texture
        +Emit(position: Vector2, count: int) void
        +Update(gameTime: GameTime) void
        +Draw(spriteBatch: SpriteBatch) void
    }

    class Particle {
        -Vector2 Position
        -Vector2 Velocity
        -float LifeTime
        -float CurrentLife
        -Color Color
        -float Scale
        +Update(gameTime: GameTime) void
        +Draw(spriteBatch: SpriteBatch) void
        +IsAlive() bool
    }

    class ScreenShake {
        -float Intensity
        -float Duration
        -float Timer
        +Update(gameTime: GameTime) void
        +GetOffset() Vector2
        +Trigger(intensity: float, duration: float) void
        +IsActive() bool
    }

    ParticleSystem --> Particle
```

---

## 12. Project Structure

```mermaid
classDiagram
    direction LR

    namespace Entities {
        class Player
        class Enemy
        class Boss
        class Collectible
        class Projectile
    }

    namespace Levels {
        class GameLevel
        class Tile
        class Tileset
        class Camera
    }

    namespace UI {
        class HUD
        class MenuScreen
        class GameOverScreen
    }

    namespace Systems {
        class InputManager
        class CollisionSystem
        class AudioManager
        class SaveSystem
    }

    namespace Effects {
        class ParticleSystem
        class ScreenShake
    }

    namespace Game {
        class Game1
        class GameState
    }
```

---

## Notes

- ใช้ `<<abstract>>` สำหรับ abstract classes
- ใช้ `<<interface>>` สำหรับ interfaces
- ใช้ `<<enumeration>>` สำหรับ enums
- Classes ที่เป็น `<<static>>` คือ static classes
