/**
 * tools/generate-tts.mjs
 *
 * Step 1 of 2 in the TTS pipeline.
 * Reads all postcard texts from constants.js and writes them to
 * tools/tts-manifest.json so the Python generator can read them
 * without having to parse JavaScript.
 *
 * Run via:  npm run generate-tts   (this runs both steps automatically)
 *
 * NOTE: This is a developer tool only. It lives in tools/ and is
 * NEVER imported by any game code — it will never appear in dist/.
 */

import { GameLevelsByTopic } from '../src/game/postcard-reader/constants.js';
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH  = path.join(__dirname, 'tts-manifest.json');

// Build manifest: { topic: { difficulty: [{ index, text }] } }
const manifest = {};

for (const [topic, difficulties] of Object.entries(GameLevelsByTopic)) {
    manifest[topic] = {};
    for (const [difficulty, cards] of Object.entries(difficulties)) {
        manifest[topic][difficulty] = cards.map((card, i) => ({
            index: i,
            text:  card.text || card.Postcard || '',
        }));
    }
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

const topicList  = Object.keys(manifest).join(', ');
const totalCards = Object.values(manifest)
    .flatMap(d => Object.values(d))
    .reduce((sum, cards) => sum + cards.length, 0);

console.log(`[manifest] Written: tools/tts-manifest.json`);
console.log(`[manifest] Topics : ${topicList}`);
console.log(`[manifest] Total  : ${totalCards} cards\n`);
