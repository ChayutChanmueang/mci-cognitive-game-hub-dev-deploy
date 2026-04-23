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
**Description:** Provides focused knowledge and utilities related to the Phaser game engine API, helping structure games and manage scene transitions efficiently.
**Best Used When:** Dealing with fundamental Phaser lifecycle events, scene management, or core game object interactions.
**Usage Example:** `Task(description="Implement score tracking system", prompt="/phaser create a global score counter that persists between scenes.", subagent_type="phaser")`

### 3. `phaser-best-practices` (Phaser Best Practices Skill)
**Description:** Offers guidelines and solutions for maintaining clean, scalable, and high-performance Phaser game codebases according to modern development standards.
**Best Used When:** Refactoring existing Phaser code to improve maintainability or optimize performance bottlenecks.
**Usage Example:** `Task(description="Optimize asset loading", prompt="/phaser-best-practices analyze how to preload assets in batches for better load times.", subagent_type="phaser-best-practices")`

### 4. `phaser-gamedev` (Phaser Game Development Skill)
**Description:** Contains utilities and examples focused on the practical implementation of game development patterns within Phaser, covering everything from physics to input handling.
**Best Used When:** Implementing specific gameplay mechanics like character movement, collision detection, or particle systems.
**Usage Example:** `Task(description="Add jump mechanic", prompt="/phaser-gamedev show code for implementing a gravity-affected jump cycle.", subagent_type="phaser-gamedev")`

### 5. `Writing Phaser 3 Games` (Project Skill)
**Description:** Specialized knowledge and tools for building and debugging games using the Phaser 3 framework. This skill is vital for any game-related development within this repository.
**Best Used When:** You are writing or refactoring core game mechanics, scenes, or assets specific to a Phaser 3 title.

---

*This documentation is maintained by the project developers and can be updated with new skills as they are integrated.*