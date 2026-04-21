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
4. Edit files in `src/` - Vite handles hot reloading
5. Game serves at `http://localhost:8080`

## Build & Deployment
- Production builds output to `dist/` folder
- All contents of `dist/` must be deployed to web server
- Static assets in `public/assets` are copied to `dist/assets` during build

## Logging Mechanism
Scripts automatically run `log.js` which sends anonymous template usage data.
To disable:
- Use `-nolog` variants (`dev-nolog`, `build-nolog`)
- Or delete `log.js` and remove calls from package.json scripts

## Technology Stack
- Phaser 3.90.0
- Vite 6.3.1
- ES Modules (package.json has "type": "module")