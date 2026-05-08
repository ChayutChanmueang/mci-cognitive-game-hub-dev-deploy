# mci-cognitive-games Agent Guidelines

## Project Overview
This is a Phaser 3 game template using Vite for bundling with hot-reload support.

## Essential Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server (includes anonymous logging)
- `npm run dev-nolog` - Start development server without logging
- `npm run build` - Create production build (includes logging)
- `npm run build-nolog` - Create production build without logging
- `npm start` - Alias for dev server

## Project Structure
- `index.html` - Main HTML container
- `public/assets` - Static game assets (served directly)
- `public/style.css` - Global styles
- `src/main.js` - Application bootstrap
- `src/game/main.js` - Game entry point
- `src/game/scenes/` - Phaser game scenes

## Development Workflow
1. Clone repository
2. Run `npm install`
3. Start development with `npm run dev`
4. **UX/UI Improvements:** Always refer to `docs/wiki/guidelines/ux-ui-guidelines.md` before making any UI changes.
5. Edit files in `src/` - Vite handles hot reloading
6. Game serves at `http://localhost:8080`

## Build & Deployment
- Production builds output to `dist/` folder
- All contents of `dist/` must be deployed to web server
- Static assets in `public/assets` are copied to `dist/assets` during build

## Logging Mechanism
Scripts automatically run `log.js` which sends anonymous template usage data.
To disable:
- Use `-nolog` variants (`dev-nolog`, `build-nolog`)
- Or delete `log.js` and remove calls from package.json scripts

## Memory Tiers & Project Instructions
To ensure consistency across different Agent sessions, this project uses a tiered memory system:

### 1. Shared Project Instructions (`AGENTS.md`)
- **Status:** Committed to Git.
- **Role:** Foundational Mandates & Team-shared conventions.
- **Content:** Architecture decisions, UI/UX guidelines reference, and core workflows.
- **Agent Rule:** Always prioritize instructions in this file.

### 2. Private Project Memory (`MEMORY.md`)
- **Status:** NOT Committed (Local only).
- **Role:** Personal notes and local environment setup.
- **Location:** `C:\Users\noppon\.gemini\tmp\mci-cognitive-games\memory\MEMORY.md` (managed by Gemini CLI).
- **Use case:** Storing temporary debug notes or machine-specific configurations.

## Technology Stack
- Phaser 3.90.0
- Vite 6.3.1
- ES Modules (package.json has "type": "module")