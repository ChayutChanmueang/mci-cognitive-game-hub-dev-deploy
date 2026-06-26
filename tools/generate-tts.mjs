/**
 * tools/generate-tts.mjs
 *
 * Generates pre-recorded TTS MP3 files for the Postcard Reader game
 * using Google Cloud Text-to-Speech API (free tier: Standard voices).
 *
 * ── Setup (one-time) ────────────────────────────────────────────────────
 *  1. Go to https://console.cloud.google.com/
 *  2. Create or select a project
 *  3. Enable "Cloud Text-to-Speech API"
 *  4. Create an API key (APIs & Services → Credentials)
 *  5. Add to .env:   GOOGLE_TTS_API_KEY=AIza...
 *
 * ── Usage ────────────────────────────────────────────────────────────────
 *  npm run generate-tts
 *
 * ── Free tier voices (th-TH-Standard-*) ─────────────────────────────────
 *  th-TH-Standard-A   Female  (default)
 *  th-TH-Standard-B   Male
 *  th-TH-Standard-C   Female
 *  th-TH-Standard-D   Male
 *  Free quota: 4 million characters/month
 *
 * ── Premium voices (th-TH-Neural2-*) ────────────────────────────────────
 *  th-TH-Neural2-C    Female — more natural
 *  th-TH-Neural2-D    Male   — more natural
 *  Free quota: 1 million characters/month, then paid
 *
 * ── Override voice via .env ──────────────────────────────────────────────
 *  TTS_VOICE=th-TH-Neural2-C
 *
 * ── Output ────────────────────────────────────────────────────────────────
 *  public/assets/audio/postcard-reader/tts/{topic}/{difficulty}/{index}.mp3
 *
 * This script is idempotent — existing files are skipped.
 * Delete individual files (or the whole tts/ folder) to regenerate.
 *
 * NOTE: This is a developer tool only. It lives in tools/ and is
 * NEVER imported by any game code — it will never appear in dist/.
 */

import { GameLevelsByTopic } from '../src/game/postcard-reader/constants.js';
import fs   from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

// ── Resolve project root ───────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ── Load .env manually (no dotenv dependency needed) ──────────────────────
function loadEnv() {
    const envPath = path.join(ROOT, '.env');
    if (!fs.existsSync(envPath)) {
        console.warn('⚠️  No .env file found at project root.');
        return;
    }
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx < 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) process.env[key] = val;
    }
}
loadEnv();

// ── Configuration ─────────────────────────────────────────────────────────
const API_KEY       = process.env.GOOGLE_TTS_API_KEY;
const VOICE_NAME    = process.env.TTS_VOICE ?? 'th-TH-Standard-A';  // free tier default
const SPEAKING_RATE = parseFloat(process.env.TTS_RATE ?? '0.85');
const LANGUAGE      = 'th-TH';
const DELAY_MS      = 150; // between API calls — avoids quota burst errors
const OUT_DIR       = path.join(ROOT, 'public', 'assets', 'audio', 'postcard-reader', 'tts');

// ── Validate ──────────────────────────────────────────────────────────────
if (!API_KEY) {
    console.error('\n❌  GOOGLE_TTS_API_KEY is missing from .env\n');
    console.error('   Add this line to your .env file:');
    console.error('   GOOGLE_TTS_API_KEY=AIza...\n');
    console.error('   Get a key at: https://console.cloud.google.com/\n');
    process.exit(1);
}

// ── Google Cloud TTS REST call ─────────────────────────────────────────────
function synthesize(text) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            input:       { text },
            voice:       { languageCode: LANGUAGE, name: VOICE_NAME },
            audioConfig: { audioEncoding: 'MP3', speakingRate: SPEAKING_RATE },
        });

        const reqOptions = {
            hostname: 'texttospeech.googleapis.com',
            path:     `/v1/text:synthesize?key=${API_KEY}`,
            method:   'POST',
            headers:  {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(reqOptions, (res) => {
            let raw = '';
            res.on('data',  (chunk) => { raw += chunk; });
            res.on('end',   () => {
                try {
                    const json = JSON.parse(raw);
                    if (json.error) {
                        reject(new Error(`API error ${json.error.code}: ${json.error.message}`));
                    } else if (!json.audioContent) {
                        reject(new Error('API returned no audioContent'));
                    } else {
                        resolve(Buffer.from(json.audioContent, 'base64'));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse API response: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
    const totalCards = Object.values(GameLevelsByTopic)
        .flatMap(d => Object.values(d))
        .reduce((sum, cards) => sum + cards.length, 0);

    console.log('\n┌────────────────────────────────────────────┐');
    console.log('│  🎙️   Postcard Reader TTS Generator         │');
    console.log('└────────────────────────────────────────────┘');
    console.log(`  Voice        : ${VOICE_NAME}`);
    console.log(`  Speaking rate: ${SPEAKING_RATE}`);
    console.log(`  Total cards  : ${totalCards}`);
    console.log(`  Output       : ${path.relative(ROOT, OUT_DIR)}`);
    console.log('');

    let generated = 0;
    let skipped   = 0;
    let failed    = 0;

    for (const [topic, difficulties] of Object.entries(GameLevelsByTopic)) {
        console.log(`📁  Topic: ${topic}`);

        for (const [difficulty, cards] of Object.entries(difficulties)) {
            console.log(`  📂  ${difficulty} (${cards.length} cards)`);

            for (let i = 0; i < cards.length; i++) {
                const outPath = path.join(OUT_DIR, topic, difficulty, `${i}.mp3`);
                const relPath = path.relative(ROOT, outPath).replace(/\\/g, '/');

                // Idempotent — skip already generated files
                if (fs.existsSync(outPath)) {
                    console.log(`     ⏭️   skip   ${relPath}`);
                    skipped++;
                    continue;
                }

                const text = cards[i].text || cards[i].Postcard;
                if (!text) {
                    console.warn(`     ⚠️   no text for index ${i} — skipping`);
                    continue;
                }

                try {
                    const mp3 = await synthesize(text);
                    fs.mkdirSync(path.dirname(outPath), { recursive: true });
                    fs.writeFileSync(outPath, mp3);
                    const kb = (mp3.length / 1024).toFixed(1);
                    console.log(`     ✅  wrote  ${relPath}  (${kb} KB)`);
                    generated++;

                    await sleep(DELAY_MS);

                } catch (err) {
                    console.error(`     ❌  failed ${relPath}: ${err.message}`);
                    failed++;
                }
            }
        }
        console.log('');
    }

    console.log('┌────────────────────────────────────────────┐');
    console.log(`│  ✅  Generated : ${String(generated).padEnd(26)} │`);
    console.log(`│  ⏭️   Skipped   : ${String(skipped).padEnd(26)} │`);
    console.log(`│  ❌  Failed    : ${String(failed).padEnd(26)} │`);
    console.log('└────────────────────────────────────────────┘\n');

    if (failed > 0) {
        console.error('Some files failed. Check your API key and network.\n');
        process.exit(1);
    }

    if (generated > 0) {
        console.log('🎉  Done! MP3 files are ready in:');
        console.log(`   ${path.relative(ROOT, OUT_DIR)}\n`);
    }
}

main().catch((err) => {
    console.error('\nFatal error:', err.message);
    process.exit(1);
});
