# Game Loop Diagram

---
*Document Version: 1.0*  
*Project: [Game Title]*  
*Last Updated: YYYY-MM-DD*
---

## 1. Main Game Loop

```mermaid
flowchart TD
    A[Start Game] --> B[Main Menu]
    B -->|New Game| C[Initialize Game]
    B -->|Continue| D[Load Save Data]
    C --> E[Game Level]
    D --> E

    E --> F{Game Active?}
    F -->|Yes| G[Process Input]
    F -->|No| H[End Game]

    G --> I[Update Game State]
    I --> J[Physics & Collision]
    J --> K[AI & Logic]
    K --> L[Check Win/Lose]

    L -->|Continue| M[Render Frame]
    M --> N[Present to Screen]
    N --> E

    H --> O[Show Game Over / Victory]
    O --> P[Save Game?]
    P -->|Yes| Q[Write Save Data]
    P -->|No| R[Return to Menu]
    Q --> R
    R --> B
```

---

## 2. Game State Flow

```mermaid
stateDiagram-v2
    [*] --> MainMenu
    MainMenu --> Loading: New Game
    MainMenu --> Loading: Continue
    Loading --> Gameplay
    Gameplay --> Paused: ESC
    Paused --> Gameplay: Resume
    Gameplay --> LevelComplete: Beat Level
    LevelComplete --> Gameplay: Next Level
    Gameplay --> GameOver: Player Dies
    GameOver --> MainMenu
    LevelComplete --> Victory: Final Boss
    Victory --> MainMenu
```

---

## 3. Update Loop (Per Frame)

```mermaid
flowchart LR
    subgraph Input Phase
        A1[1. Handle Input]
    end

    subgraph Update Phase
        A2[2. Update Player]
        A3[3. Update Enemies]
        A4[4. Update Projectiles]
        A5[5. Update Particles]
    end

    subgraph Physics Phase
        B1[6. Apply Gravity]
        B2[7. Detect Collisions]
        B3[8. Resolve Physics]
    end

    subgraph Render Phase
        C1[9. Clear Screen]
        C2[10. Draw Background]
        C3[11. Draw Game Objects]
        C4[12. Draw UI/HUD]
        C3 --> C5[13. Present]
    end

    A1 --> A2 --> A3 --> A4 --> A5 --> B1 --> B2 --> B3 --> C1 --> C2 --> C3 --> C5
```

---

## 4. Player Input Flow

```mermaid
flowchart TD
    A[Input Received] --> B{Valid Input?}
    B -->|No| C[Ignore]
    B -->|Yes| D{Key Type}

    D -->|Movement| E[Move Player]
    D -->|Action| F[Perform Action]
    D -->|Menu| G[Open Menu]

    E --> H[Apply Velocity]
    H --> I[Clamp to Bounds]

    F --> J{Action Type}
    J -->|Jump| K[Check Grounded]
    K -->|Yes| L[Apply Jump Force]
    K -->|No| M[No Action]
    J -->|Attack| N[Create Hitbox]
    J -->|Interact| O[Trigger Event]

    L --> P[Play Animation]
    N --> P
    O --> P

    P --> Q[Update Animation]
    Q --> R[End Frame]
```

---

## 5. Collision Detection Loop

```mermaid
flowchart TD
    A[Start Collision Check] --> B[Get All Entities]
    B --> C[Sort by Position]
    C --> D[Pick Entity Pair]

    D --> E{Colliding?}
    E -->|No| F[Next Pair]
    E -->|Yes| G[Determine Type]

    G --> H{Solid}
    H -->|Yes| I[Push Apart]
    H -->|No| J{Damage}

    J -->|Yes| K[Apply Damage]
    J -->|No| L{Collectible}

    L -->|Yes| M[Add to Player]
    L -->|No| N[Trigger Event]

    I --> O[Update Positions]
    K --> P[Check Death]
    M --> Q[Remove Entity]
    N --> R[Fire Event]

    O --> F
    P --> F
    Q --> F
    R --> F

    F --> S{Done?}
    S -->|No| D
    S -->|Yes| T[End]
```

---

## 6. Enemy AI Loop

```mermaid
flowchart TD
    A[Update Enemy] --> B[Get Player Position]
    B --> C{Type}

    C -->|Patrol| D[Move to Waypoints]
    C -->|Chase| E[Move Toward Player]
    C -->|Ranged| F[Check Distance]
    C -->|Boss| G[Boss Logic]

    D --> H[At Waypoint?]
    H -->|Yes| I[Reverse Direction]
    H -->|No| J[Continue]

    E --> K[In Range?]
    K -->|Yes| L[Attack]
    K -->|No| J

    F --> M[Can Fire?]
    M -->|Yes| N[Spawn Projectile]
    M -->|No| O[Wait]

    G --> P{Health%}
    P -->|50%| Q[Phase 2]
    P -->|25%| R[Phase 3]

    J --> S[Play Animation]
    I --> S
    L --> S
    N --> S
    O --> S
    Q --> S
    R --> S

    S --> T[End Update]
```

---

## 7. Render Pipeline

```mermaid
flowchart LR
    subgraph "Back to Front"
        A[Background Layer]
        B[Midground Layer]
        C[Characters Layer]
        D[Foreground Layer]
        E[UI Layer]
    end

    A --> B --> C --> D --> E
```

---

## Notes

- **Target FPS**: [Target FPS]
- **Delta Time**: [Delta Time strategy]
- **Render**: [Render strategy]
- **Input**: [Input handling strategy]
