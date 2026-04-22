# MCI Cognitive Games

A web-based cognitive training games platform for MCI (Mild Cognitive Impairment) patients and elderly users. Built with Phaser 3 and Vite, featuring a modular architecture and AI-assisted development workflow.

## 🎮 Game Overview

This project contains 5 mini-games designed to train different cognitive skills:

| Game | Thai Name | Skill Trained | Core Mechanism |
|------|-----------|---------------|----------------|
| **Zoo Detective** | นักสืบสวนสัตว์ | Logical Thinking | Logical deduction by placing animals based on hints |
| **Zoo Feeder** | คนเลี้ยงสัตว์ | Decision Making | Timing and resource management in a feeding simulation |
| **Context Clues** | คำใบ้บริบท | Language | Contextual learning and word association |
| **Symmetry Decor** | ตกแต่งสมมาตร | Spatial Reasoning | Mirroring and symmetry-based object placement |
| **Postcard Reader** | ผู้อ่านไปรษณีย์ | Reading | Information sequencing and comparison |

## 🛠️ Technology Stack

- **Game Engine:** [Phaser 3.90.0](https://phaser.io/)
- **Build Tool:** [Vite 6.3.1](https://vitejs.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **UI Libraries:**
  - Material UI (MUI) @mui/material 7.3.4
  - Material Web Components @material/web 2.4.1
- **Phaser Plugins:**
  - [Rex Rainbow Plugins](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/index.html) (UI, Gestures)
  - [@koreez/phaser3-i18n](https://github.com/koreez/phaser3-i18n) (Internationalization)
- **Language:** JavaScript (ES Modules)

## 📂 Project Structure

```text
├── .agents/                # AI Agent skills and specialized instructions
├── docs/                   # Documentation and Project Logs
│   ├── Agentic AI/         # AI-assisted development docs
│   ├── Design Document/    # GDD, Class Diagrams, Database Schema, Wiki
│   ├── Meeting Logs/       # Development meeting notes
│   └── Progress Logs/      # Sprint and Weekly backlogs
├── public/                 # Static assets (images, audio, CSS)
├── src/
│   ├── core/               # Core systems (Database, Storage, Managers)
│   ├── game/               # Game modules
│   │   └── [game-name]/    # Individual game implementation
│   │       ├── components/ # Reusable game components
│   │       ├── data/       # Game-specific data structures
│   │       ├── entity/     # Game objects and entities
│   │       ├── scenes/     # Phaser Scenes (Boot, Preloader, MainMenu, Gameplay)
│   │       └── ui-elements/# Game-specific UI
│   ├── ui/                 # React/MUI screen components (Login, Hub, Dialogs)
│   ├── ui-element/         # Reusable global UI elements
│   └── util/               # Utility functions
│       ├── layout/         # UI layout helpers (Grid, Progress Bar)
│       └── object-pool/    # Performance optimization utilities
├── AGENTS.md               # Guidelines for AI development agents
└── SETUP.md                # Environment setup and configuration
```

## 📖 Documentation

### Design & Architecture
- [**Project Summary**](docs/Design%20Document/Summary-Project.md) - High-level project goals
- [**Game Design Document (GDD)**](docs/Design%20Document/GDD-Project.md) - Full game mechanics specification
- [**Wiki Overview**](docs/Design%20Document/wiki/README.md) - Technical knowledge base for developers
- [**Database Schema**](docs/Design%20Document/DatabaseSchema-Project.md) - Supabase table structures

### Project Management
- [**Sprint Backlog**](docs/Progress%20Logs/SPRINT_BACKLOG-SB01.md) - Active tasks and milestones
- [**Meeting Notes**](docs/Meeting%20Logs/MeetingNotes-260422.md) - Latest decision logs

### AI & Agents
- [**Agent Guidelines**](AGENTS.md) - Essential commands and project rules for AI agents
- [**AI Skill Usage**](docs/Agentic%20AI/PROJECT_AGENT_SKILL_USING.md) - How specialized AI skills are utilized

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env` file from `.env.example` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📈 Game Features

### Difficulty Scaling
Each game features 3 difficulty levels (Easy, Medium, Hard) with balanced scoring and penalty systems:
- **Easy:** 10 rounds, +15-20 score, -5 penalty
- **Medium:** 10 rounds, +16-20 score, -6 penalty  
- **Hard:** 10 rounds, +17-20 score, -7 penalty

### Data Tracking
The system automatically tracks patient progress and engagement via Supabase:
- Patient profiles (HN, Age, Gender, Education)
- Game performance (Scores, Levels, Completion times)
- Event logging (Application lifecycle, Game session starts)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
