# MCI Cognitive Games

A web-based cognitive training games platform for MCI (Mild Cognitive Impairment) patients and elderly users. Built with Phaser 3 and Vite.

## Overview

This project contains 5 mini-games designed to train different cognitive skills:

| Game | Thai Name | Skill Trained |
|------|-----------|---------------|
| Zoo Detective | นักสืบสวนสัตว์ | Logical thinking, Deduction |
| Zoo Feeder | คนเลี้ยงสัตว์ | Decision making, Timing |
| Context Clues | คำใบ้บริบท | Language comprehension |
| Symmetry Decor | ตกแต่งสมมาตร | Spatial reasoning |
| Postcard Reader | ผู้อ่านไปรษณีย์ | Reading comprehension |

## Technology Stack

- **Game Engine:** Phaser 3.90.0
- **Build Tool:** Vite 6.3.1
- **Database:** Supabase
- **UI Framework:** Material UI
- **Language:** JavaScript (ES Modules)

## Project Structure

```
├── src/
│   ├── core/               # Core systems (database, storage)
│   ├── game/               # Game modules
│   │   ├── zoo-detective/  # Zoo Detective game
│   │   ├── zoo-feeder/     # Zoo Feeder game
│   │   ├── context-clues/  # Context Clues game
│   │   ├── symmetry-decor/ # Symmetry Decor game
│   │   └── postcard-reader/# Postcard Reader game
│   ├── ui/                 # React/Material UI screens
│   └── util/               # Utilities
├── public/assets/          # Static game assets
├── docs/                   # Documentation
└── dist/                   # Production build output
```

## Documentation

### Design Documents

- [Game Design Document (GDD)](docs/Design%20Document/GDD-Project.md) - Full game design specification
- [Game Loop Diagram](docs/Design%20Document/GameLoop-Project.md) - Game flow and state diagrams
- [Class Diagram](docs/Design%20Document/ClassDiagram-Project.md) - Code architecture
- [Database Schema](docs/Design%20Document/DatabaseSchema-Project.md) - Database structure

### Wiki

- [Wiki Overview](docs/Design%20Document/wiki/README.md) - Knowledge base for developers
- [Zoo Detective Details](docs/Design%20Document/wiki/gdd_zoo_detective.md)
- [Zoo Feeder Details](docs/Design%20Document/wiki/gdd_zoo_feeder.md)
- [Symmetry Decor Details](docs/Design%20Document/wiki/gdd_symmetry_decor.md)

### Other

- [Project Summary](docs/Design%20Document/PROJECT_SUMMARY.md)
- [Agent Skill Usage](docs/Agentic%20AI/PROJECT_AGENT_SKILL_USING.md)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env` file with Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Game Features

### Difficulty Levels

Each game has 3 difficulty levels:
- **Easy:** 10 rounds, +15-20 score, -5 penalty
- **Medium:** 10 rounds, +16-20 score, -6 penalty  
- **Hard:** 10 rounds, +17-20 score, -7 penalty

### Data Tracking

The system tracks:
- Patient profiles (HN, age, gender)
- Game scores and completion times
- Event logs (app opens, game starts)

## License

MIT License
