import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// Single source of truth for the app version is package.json (US-E7-05).
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

export default defineConfig({
    base: '/',
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    server: {
        port: 8080
    }
});
