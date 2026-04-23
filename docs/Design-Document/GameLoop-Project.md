# Game Loop Diagram

---
*Document Version: 1.0*  
*Project: MCI Cognitive Games*  
*Last Updated: 2026-04-21*
---

## 1. Main Game Loop (Application Level)

```mermaid
flowchart TD
    A[Start App] --> B[Login Screen]
    B -->|Login Success| C[Game Hub]
    B -->|Sign Up| D[Sign Up Screen]
    D -->|Success| C

    C --> E{Select Game}
    E -->|Zoo Detective| F1[Zoo Detective]
    E -->|Zoo Feeder| F2[Zoo Feeder]
    E -->|Context Clues| F3[Context Clues]
    E -->|Symmetry Decor| F4[Symmetry Decor]
    E -->|Postcard Reader| F5[Postcard Reader]

    F1 --> G[Game Scene]
    F2 --> G
    F3 --> G
    F4 --> G
    F5 --> G

    G --> H{Game Active?}
    H -->|Yes| I[Process Input]
    H -->|No| J[Game Over]

    I --> K[Update Game State]
    K --> L[Check Win/Lose]
    L -->|Continue| M[Render Frame]
    M --> H

    J --> N[Show Score]
    N --> O[Save to Database]
    O --> P[Return to Game Hub]
    P --> C
```

---

## 2. Game Scene Flow (Per Game)

```mermaid
stateDiagram-v2
    [*] --> Boot
    Boot --> Preloader: Scene Start
    Preloader --> MainMenu: Load Complete
    MainMenu --> Gameplay: Start Game
    Gameplay --> Paused: ESC/Touch Pause
    Paused --> Gameplay: Resume
    Gameplay --> LevelComplete: Round Complete
    LevelComplete --> Gameplay: Next Round
    Gameplay --> GameOver: Max Rounds Done
    GameOver --> MainMenu: Return
    LevelComplete --> Victory: All Levels Done
    Victory --> MainMenu
```

---

## 3. Scene Lifecycle (Phaser 3)

```mermaid
flowchart LR
    subgraph Boot
        A1[constructor]
    end

    subgraph Init
        A2[init]
    end

    subgraph Preload
        A3[preload]
    end

    subgraph Create
        A4[create]
    end

    subgraph Update Loop
        A5[update]
    end

    A1 --> A2 --> A3 --> A4 --> A5
```

**Each Scene:**
- `Boot`: Initialize game config
- `Preloader`: Load assets (images, audio)
- `MainMenu`: Show game menu, difficulty selection
- `Gameplay`: Main game logic
- `GameOver`: Show results, save score

---

## 4. Zoo Detective Game Loop

```mermaid
flowchart TD
    A[Start Round] --> B[Generate Puzzle]
    B --> C[Show Hints]
    C --> D[Wait for Input]

    D --> E{Player Action}
    E -->|Select Animal| F[Highlight Animal]
    E -->|Place Animal| G[Check Placement]

    F --> D

    G --> H{Valid Placement?}
    H -->|Yes| I[Lock Cell]
    H -->|No| J[Show Error]

    I --> K{All Cells Filled?}
    K -->|No| D
    K -->|Yes| L[Check All Hints]

    J --> D

    L --> M{All Hints Correct?}
    M -->|Yes| N[Add Score + Next Round]
    M -->|No| O[Show Wrong Feedback]

    O --> D
    N --> P{Max Rounds?}
    P -->|No| A
    P -->|Yes| Q[Game Over]
```

**Update Loop (Per Frame):**
```mermaid
flowchart LR
    A[Handle Touch/Click] --> B[Update Selection]
    B --> C[Check Grid Collision]
    C --> D[Update UI]
    D --> E[Render]
```

---

## 5. Zoo Feeder Game Loop

```mermaid
flowchart TD
    A[Start Game] --> B[Init Conveyor Belt]
    B --> C[Spawn Animals & Food]
    C --> D[Update Conveyor]

    D --> E{Game Active?}
    E -->|Yes| F[Wait for Input]
    E -->|No| G[End Game]

    F --> H{Player Tap?}
    H -->|Yes| I[Check Food Type]
    H -->|No| D

    I --> J{Animal Accepts Food?}
    J -->|Yes| K[Add Happiness + Score]
    J -->|No| L[Decrease Happiness]

    K --> M[Update UI]
    L --> M

    M --> N{Time Up?}
    N -->|No| D
    N -->|Yes| G

    G --> O[Show Final Score]
```

**Update Loop (Per Frame):**
```mermaid
flowchart LR
    subgraph Update Phase
        A1[Move Conveyor]
        A2[Spawn Items]
        A3[Move Animals]
    end

    subgraph Input Phase
        B1[Handle Tap]
    end

    subgraph Logic Phase
        C1[Check Food Match]
        C2[Update Scores]
    end

    A1 --> A2 --> A3 --> B1 --> C1 --> C2
```

---

## 6. Context Clues Game Loop

```mermaid
flowchart TD
    A[Start Round] --> B[Load Question]
    B --> C[Show Sentence with Blank]
    C --> D[Display Options]

    D --> E{Player Select?}
    E -->|Yes| F[Check Answer]

    F --> G{Correct?}
    G -->|Yes| H[Score +20]
    G -->|No| I[Score -5]

    H --> J[Show Feedback]
    I --> J

    J --> K{Next Round?}
    K -->|Yes| A
    K -->|No| L[Game Over]

    L --> M[Show Final Score]
```

---

## 7. Symmetry Decor Game Loop

```mermaid
flowchart TD
    A[Start Round] --> B[Show Template Grid]
    B --> C[Show Decoration Items]
    C --> D[Wait for Input]

    D --> E{Drag Item?}
    E -->|Yes| F[Follow Touch/Mouse]
    E -->|No| D

    F --> G{Drop on Grid?}
    G -->|Yes| H[Mirror to Other Side]
    G -->|No| I[Return to Palette]

    H --> J[Check Completion]
    J --> K{All Placed?}
    K -->|No| D
    K -->|Yes| L[Evaluate]

    L --> M{Meet Criteria?}
    M -->|Yes| N[Score Based on Quality]
    M -->|No| O[Show Suggestions]

    O --> D
    N --> P[Next Level]
```

---

## 8. Postcard Reader Game Loop

```mermaid
flowchart TD
    A[Start Round] --> B[Show Postcard]
    B --> C[Player Reads]
    C --> D[Wait for Timer]

    D --> E{Time Up?} -->|Yes| F[Show Questions]
    D -->|Skip| F

    F --> G[Display Options]
    G --> H{Player Select?}

    H -->|Yes| I[Check Answer]
    I --> J{Correct?}
    J -->|Yes| K[Score +20]
    J -->|No| L[Score -5]

    K --> M[Next Question]
    L --> M

    M --> N{All Questions Done?}
    N -->|No| G
    N -->|Yes| O[Game Over]

    O --> P[Show Final Score]
```

---

## 9. Input Handling Flow

```mermaid
flowchart TD
    A[Input Received] --> B{Valid Input?}
    B -->|No| C[Ignore]
    B -->|Yes| D{Input Type}

    D -->|Click/Tap| E[Handle Selection]
    D -->|Drag| F[Handle Drag]
    D -->|Keyboard| G[Handle Navigation]

    E --> H{On Game Object?}
    H -->|Yes| I[Trigger Callback]
    H -->|No| J[Deselect]

    F --> K{Moving?}
    K -->|Yes| L[Update Position]
    K -->|No| M[Check Drop Zone]

    I --> N[Update State]
    L --> N
    M --> N
    J --> N
```

---

## 10. Score & Data Flow

```mermaid
flowchart TD
    A[Score Event] --> B[Update Local Score]
    B --> C[Save to State]

    C --> D{Game End?}
    D -->|Yes| E[Prepare Payload]

    E --> F[submitGameData]
    F --> G[(Supabase DB)]

    G --> H{Success?}
    H -->|Yes| I[Show Success]
    H -->|No| J[Retry / Show Error]
```

---

## 11. Render Pipeline

```mermaid
flowchart LR
    subgraph "Back to Front"
        A[Background Layer]
        B[Game Objects Layer]
        C[UI Layer]
        D[HUD Layer]
    end

    A --> B --> C --> D
```

**Layer Details:**
- **Background**: Static backgrounds, patterns
- **Game Objects**: Animals, food, puzzles, cards
- **UI**: Panels, buttons, menus
- **HUD**: Score, timer, progress bar

---

## 12. State Management Flow

```mermaid
flowchart TD
    A[App Start] --> B[Load User Session]
    B --> C[Check Auth]

    C -->|Authenticated| D[Load Patient Data]
    C -->|Not Auth| E[Anonymous Login]

    D --> F[Game Hub Ready]
    E --> F

    F --> G[User Selects Game]
    G --> H[Load Game Scene]

    H --> I[Gameplay]
    I --> J[Save Score]
    J --> K[Return to Hub]
```

---

## Notes

### Target FPS
- **60 FPS** (Phaser 3 default)
- Adaptive performance for lower-end devices

### Delta Time
- Use `delta` parameter in `update()` for frame-independent movement
- Conveyor belt timing based on delta

### Render Strategy
- Phaser 3 WebGL with Canvas fallback
- Object pooling for frequently created/destroyed objects
- Texture atlas for sprite optimization

### Input Handling Strategy
- Touch/Mouse unified via Phaser input system
- Pointer events for cross-platform support
- Drag & drop for Symmetry Decor game

### Data Persistence
- Supabase for cloud save
- LocalStorage for session cache
- Patient session management via `patient-session.js`

---

## Appendix: Score Configuration

| Game | Easy Score | Medium Score | Hard Score | Penalty |
|------|------------|--------------|------------|---------|
| Zoo Detective | +15 | +16 | +17 | -5 to -7 |
| Zoo Feeder | +15 | +16 | +17 | -5 to -7 |
| Context Clues | +20 | +20 | +20 | -5 to -7 |
| Symmetry Decor | Based on quality | Based on quality | Based on quality | N/A |
| Postcard Reader | +20 | +20 | +20 | -5 to -7 |

---

## Appendix: Round Configuration

| Game | Easy Rounds | Medium Rounds | Hard Rounds |
|------|-------------|---------------|--------------|
| All Games | 10 | 10 | 10 |
