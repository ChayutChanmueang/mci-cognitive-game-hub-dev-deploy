# Setup & Installation

## Requirements

- [Node.js](https://nodejs.org) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

The server runs on `http://localhost:8080` by default.

## Build

Create production build:

```bash
npm run build
```

Output is in the `dist/` folder.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (with anonymous logging) |
| `npm run dev-nolog` | Start dev server (without logging) |
| `npm run build` | Create production build |
| `npm run build-nolog` | Create production build (without logging) |

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

1. Run `npm run build`
2. Upload all contents of `dist/` folder to your web server
3. Configure your web server to serve the static files

## About log.js

This project includes optional anonymous usage tracking. To disable:

- Use `-nolog` variants (`dev-nolog`, `build-nolog`)
- Or delete `log.js` and remove calls from `package.json` scripts
