# Contributing to MCI Cognitive Games

Thank you for your interest in contributing to the MCI Cognitive Games project! This project aims to provide high-quality cognitive training tools for elderly users and MCI patients.

As a project that leverages **Agentic AI-assisted development**, we follow specific workflows to ensure both human developers and AI agents can collaborate effectively.

## 🚀 Getting Started

1. **Setup**: Follow the instructions in [SETUP.md](SETUP.md) to configure your local environment and Supabase credentials.
2. **Explore**: Familiarize yourself with the [README.md](README.md) to understand the project structure and technology stack.
3. **Tasks**: Check the [Sprint Backlog](docs/Progress%20Logs/SPRINT_BACKLOG-SB01.md) or open issues for tasks that need attention.

## 🛠️ Development Workflow

### 1. Branching Strategy
- We use a feature-branch workflow.
- Create a new branch for every feature or bug fix: `feature/your-feature-name` or `fix/your-fix-name`.
- Always branch off from the latest `main` branch.

### 2. Commit Message Guidelines
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting/styling changes
- `refactor:` for code restructuring
- `chore:` for maintenance tasks

Example: `feat: add difficulty scaling to Symmetry Decor`

### 3. Coding Standards
- **JavaScript**: Use modern ES6+ syntax and ES Modules.
- **Phaser 3**: Follow the scene-based architecture. Keep game logic separated from UI rendering where possible.
- **Modularity**: New games should be placed in `src/game/[game-name]/` following the established folder structure (scenes, entities, components).
- **Performance**: Use the `util/object-pool/` for frequently created/destroyed game objects.

## 🤖 Working with AI Agents

This project uses specialized AI agents (OpenCode, Gemini CLI). If you are modifying agent behavior:
- Update the instructions in the `.agents/` directory.
- Refer to [AGENTS.md](AGENTS.md) for essential commands used by agents.
- Ensure all AI-generated code is reviewed and tested by a human before merging.

## 📝 Documentation & Progress Tracking

Maintaining clear documentation is critical for our AI-assisted workflow:
- **CHANGELOG**: Every significant change should be recorded in the [CHANGELOG](CHANGELOG).
- **Project Logs**: Update relevant files in `docs/Progress Logs/` when starting or completing tasks.
- **Markdown**: Use clean Markdown formatting. Documentation is often read by AI agents to understand context.

## 🤝 Submitting Changes

1. **Test Your Changes**: Run `npm run dev` and ensure no console errors are present.
2. **Submit a Pull Request (PR)**:
   - Provide a clear description of what the PR changes.
   - Link to any relevant issues or backlog items.
   - Wait for a review from the project maintainers.

## 📜 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all. Please be respectful in all interactions within this repository.

---
*Happy Coding!* 🧩
