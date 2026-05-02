# MCI Cognitive Games

A web-based cognitive training games platform for MCI (Mild Cognitive Impairment) patients and elderly users. Built with Phaser 3 and Vite, featuring a modular architecture and an advanced **Agentic AI-assisted development workflow**.

## 🎮 Game Overview

This project contains 5 mini-games designed to train different cognitive skills:

| Game | Thai Name | Skill Trained | Core Mechanism |
|------|-----------|---------------|----------------|
| **Zoo Detective** | นักสืบสวนสัตว์ | Logical Thinking | Logical deduction by placing animals based on hints |
| **Zoo Feeder** | คนเลี้ยงสัตว์ | Decision Making | Timing and resource management in a feeding simulation |
| **Context Clues** | คำใบ้บริบท | Language | Contextual learning and word association |
| **Symmetry Decor** | ตกแต่งสมมาตร | Spatial Reasoning | Mirroring and symmetry-based object placement |
| **Postcard Reader** | ผู้อ่านไปรษณีย์ | Reading | Information sequencing and comparison |

## 🤖 Agentic AI & Development Workflow

This project leverages cutting-edge AI orchestration for both development and documentation:

- **AI Agents:** 
  - **OpenCode:** Primary agent for code generation, refactoring, and complex logic implementation.
  - **Gemini CLI:** Specialized interactive agent for project orchestration, research, and task automation.
- **Content Management:** 
  - Primary content and documentation are managed using **Markdown** for portability and AI readability.
  - **VS Code Extensions:**
    - **Markdown for Human:** Enhanced visualization and editing for documentation.
    - **Obsidian Canvas Viewer:** Integration with Obsidian Canvas (`.canvas`) files directly within VS Code for visual project mapping.
- **Visual Design & Mapping:** 
  - **Obsidian:** Used for knowledge management and visual logic mapping via Obsidian Canvas (found in `docs/Idea.canvas`).

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
├── docs/                   # Documentation and Knowledge Base
│   ├── agile/              # Backlog, Sprint Plans, Reports
│   ├── gdd/                # Game Design Documents (Concept, Mechanics)
│   ├── software/           # Technical Design (Architecture, Schema)
│   ├── wiki/               # Project Wiki and research logs
│   ├── index.md            # Master Project Index
│   └── changelog.md        # Documentation History
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

### 🧭 Master Navigation
- [**Project Index**](docs/index.md) - The central hub for all documentation
- [**Knowledge Wiki**](docs/wiki/wiki.md) - Detailed technical guides and research

### 📘 Game Design (GDD)
- [**Game Concept**](docs/gdd/00-concept.md) - Vision and USPs
- [**Core Mechanics**](docs/gdd/01-mechanics.md) - Gameplay rules and loops

### 💻 Software Design
- [**Architecture**](docs/software/00-architecture.md) - Tech stack and system overview
- [**Database Schema**](docs/software/03-data-schema.md) - Supabase data structures

### 🚀 Project Management
- [**Product Backlog**](docs/agile/product-backlog.md) - Feature list and status
- [**Sprint Planning**](docs/agile/sprint-planning.md) - Project roadmap and timeline

### 🤖 AI & Agents
- [**Agent Guidelines**](AGENTS.md) - Essential commands and project rules for AI agents
- [**AI Skill Usage**](docs/wiki/Agentic-AI/PROJECT_AGENT_SKILL_USING.md) - How specialized AI skills are utilized

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
