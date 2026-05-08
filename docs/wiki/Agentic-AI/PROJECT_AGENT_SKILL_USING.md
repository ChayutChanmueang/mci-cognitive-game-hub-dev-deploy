# Skills Documentation for mci-cognitive-games

This document lists all specialized agents or "skills" used in this project. These skills streamline complex development workflows like code review, testing, and framework-specific analysis using the opencode CLI environment.

## 🚀 Quick Start Guide

To utilize a skill, you generally invoke it via `npx skills add <url> --skill <name>` or use pre-installed agents.

**Local Installation:**
**External Skill Resources:**
For a comprehensive list of community-contributed skills and advanced examples, please check out these external resources:

*   **Skills Directory:** [https://skills.sh/](https://skills.sh/)
*   **Awesome Skills Repositories:**
    *   `sickn33/antigravity-awesome-skills`
    *   `alirezarezvani/claude-skills`
    *   `awesome-opencode/awesome-opencode`

---
*(Continue with the rest of the document)*

## 🛠 Available Skills


### 1. `javascript-mastery` (Community Skill)
**Description:** An advanced skill that provides deep knowledge, best practices, and common pitfalls specific to modern JavaScript development. This skill is excellent for reviewing JS code segments against current industry standards.
**Best Used When:** You are working with complex or legacy JavaScript code and require expert-level review.
**Usage Example:** `Task(description="Review auth flow", prompt="Analyze the current user authentication flow and suggest improvements.", subagent_type="javascript-mastery")`

### 2. `phaser` (Phaser Game Dev Skill)
**Description:** Build 2D browser games with Phaser 3 using scene-based architecture and centralized state. Use when creating a new 2D game, adding 2D game features, working with Phaser, or building sprite-based web games.
**Best Used When:** Creating a new Phaser project, adding scenes, entities, physics, UI, tilemaps, animations, input, audio, camera, or for fixing Phaser-specific bugs and performance problems.

### 3. `phaser-best-practices` (Phaser Best Practices Skill)
**Description:** Offers guidelines and solutions for maintaining clean, scalable, and high-performance Phaser game codebases according to modern development standards.
**Best Used When:** Refactoring existing Phaser code to improve maintainability or optimize performance bottlenecks.

### 4. `phaser-gamedev` (Phaser Game Development Skill)
**Description:** Build 2D games with Phaser 3 framework. Covers scene lifecycle, sprites, physics (Arcade/Matter), tilemaps, animations, input handling, and game architecture.
**Best Used When:** Implementing specific gameplay mechanics like character movement, collision detection, or particle systems.

### 5. `Writing Phaser 3 Games` (Project Skill)
**Description:** Specialized knowledge and tools for building and debugging games using the Phaser 3 framework. This skill is vital for any game-related development within this repository.
**Best Used When:** You are writing or refactoring core game mechanics, scenes, or assets specific to a Phaser 3 title.

### 6. `skill-creator` (Skill Creation Skill)
**Description:** Create new skills, modify and improve existing skills, and measure skill performance.
**Best Used When:** Creating a skill from scratch, editing, or optimizing an existing skill, running evals to test a skill, or benchmarking performance.

### 7. `graphify` (Knowledge Mapping Skill)
**Description:** Converts any input (code, docs, papers, images) into a knowledge graph with clustered communities, outputting HTML + JSON + audit report.
**Best Used When:** Analyzing codebase structure, mapping documentation relationships, or visualizing complex system dependencies.

### 8. `supabase-postgres-best-practices` (Database Skill)
**Description:** Postgres performance optimization and best practices from Supabase.
**Best Used When:** Writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.

### 9. `game-ui-ux-web` (UI/UX Skill)
**Description:** Creates, polishes, and maintains consistent UI/UX for browser-based games built with Phaser.js + Vite + Material UI (MUI).
**Best Used When:** Building or refining game UI — HUD elements, menu screens, minigame UI overlays, loading/transition screens, or theme systems.

### 10. `game-doc-manager` (Documentation Skill)
**Description:** Manages all documentation for game development projects — including GDD (Game Design Documents), Software Design docs, and Agile management artifacts.
**Best Used When:** Planning sprints, updating the backlog, drafting system architecture, or reviewing game design documents.


---

*This documentation is maintained by the project developers and can be updated with new skills as they are integrated.*
