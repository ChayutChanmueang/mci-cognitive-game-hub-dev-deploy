"""
tools/generate_tts.py

Step 2 of 2 in the TTS pipeline.
Generates pre-recorded TTS WAV files for the Postcard Reader game
using PyThaiTTS — free, fully offline, no API key required.

━━━ Setup (one-time) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  pip install PyThaiTTS

━━━ Usage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  npm run generate-tts              (recommended — runs both steps)
  python tools/generate_tts.py      (direct run, needs manifest first)

━━━ Available models ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  lunarlist_onnx   Default. Fast CPU inference. Solid quality.
  khanomtan        Alternative model, may sound different.
  vachana          Supports multiple speakers (th_f_1, th_m_1, …).

  Override via env:  set PYTHAI_MODEL=khanomtan && npm run generate-tts

━━━ Output ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  public/assets/audio/postcard-reader/tts/{topic}/{difficulty}/{index}.wav

This script is idempotent — existing files are skipped.
Delete individual files (or the tts/ folder) to regenerate.

NOTE: This is a developer tool only. It is NEVER imported by game code
and will never appear in the production dist/ bundle.
"""

import json
import os
import sys
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
TOOLS_DIR = Path(__file__).resolve().parent
ROOT_DIR  = TOOLS_DIR.parent
MANIFEST  = TOOLS_DIR / "tts-manifest.json"
OUT_DIR   = ROOT_DIR / "public" / "assets" / "audio" / "postcard-reader" / "tts"

# ── Config ─────────────────────────────────────────────────────────────────
MODEL = os.environ.get("PYTHAI_MODEL", "lunarlist_onnx")

# ── Dependency check ───────────────────────────────────────────────────────
try:
    from pythaitts import TTS
except ImportError:
    print()
    print("❌  PyThaiTTS is not installed.")
    print("   Run:  pip install PyThaiTTS")
    print()
    sys.exit(1)

# ── Manifest check ─────────────────────────────────────────────────────────
if not MANIFEST.exists():
    print()
    print(f"❌  Manifest not found at: {MANIFEST}")
    print("   Run: node tools/generate-tts.mjs")
    print("   Or use: npm run generate-tts  (runs both steps)")
    print()
    sys.exit(1)

# ── Load manifest ──────────────────────────────────────────────────────────
with open(MANIFEST, "r", encoding="utf-8") as f:
    manifest = json.load(f)

total_cards = sum(
    len(cards)
    for difficulties in manifest.values()
    for cards in difficulties.values()
)

# ── Init TTS ───────────────────────────────────────────────────────────────
print()
print("┌──────────────────────────────────────────────┐")
print("│  🎙️   Postcard Reader TTS Generator           │")
print("└──────────────────────────────────────────────┘")
print(f"  Engine     : PyThaiTTS")
print(f"  Model      : {MODEL}")
print(f"  Total cards: {total_cards}")
print(f"  Output     : {OUT_DIR.relative_to(ROOT_DIR)}")
print()

print(f"⏳  Loading TTS model (may take a moment on first run)...")
try:
    tts = TTS(pretrained=MODEL)
except Exception as e:
    print(f"\n❌  Failed to load model '{MODEL}': {e}")
    print("   Try: pip install --upgrade PyThaiTTS")
    sys.exit(1)
print("✅  Model loaded.\n")


# ── Text sanitizer ─────────────────────────────────────────────────────────
# PyThaiTTS preprocessor crashes on certain characters found in hard-level
# cards. We clean the text ourselves before passing it to the model.

import re

# Map of standalone Latin letters used as labels in the game content
_LABEL_MAP = {
    ' A ': ' เอ ', ' B ': ' บี ', ' C ': ' ซี ',
    'A.': 'เอ.', 'B.': 'บี.', 'C.': 'ซี.',
}

def sanitize_text(text: str) -> str:
    """
    Clean text so PyThaiTTS preprocessor does not crash on:
      - Thousands commas  : "1,500" → "1500"
      - Time colons       : "6:00"  → "6.00"  (PyThaiTTS reads dot as pause)
      - Standalone Latin  : " A "   → " เอ "
    """
    # Remove thousands-separator commas in numbers  (1,500 → 1500)
    text = re.sub(r'(\d),(\d)', r'\1\2', text)

    # Replace colon in time format with dot  (6:00 → 6.00, 10:30 → 10.30)
    text = re.sub(r'(\d{1,2}):(\d{2})', r'\1.\2', text)

    # Replace standalone Latin letter labels
    for src, dst in _LABEL_MAP.items():
        text = text.replace(src, dst)

    return text



# ── Generate ───────────────────────────────────────────────────────────────
generated = 0
skipped   = 0
failed    = 0

for topic, difficulties in manifest.items():
    print(f"📁  Topic: {topic}")

    for difficulty, cards in difficulties.items():
        print(f"  📂  {difficulty} ({len(cards)} cards)")

        for card in cards:
            idx  = card["index"]
            text = card.get("text", "").strip()

            out_path = OUT_DIR / topic / difficulty / f"{idx}.wav"
            rel_path = out_path.relative_to(ROOT_DIR)

            # Idempotent — skip files that already exist
            if out_path.exists():
                print(f"     ⏭️   skip   {rel_path}")
                skipped += 1
                continue

            if not text:
                print(f"     ⚠️   no text for index {idx} — skipping")
                continue

            # Sanitize before sending to PyThaiTTS
            clean_text = sanitize_text(text)
            if clean_text != text:
                print(f"     🔧  sanitized: {text!r} → {clean_text!r}")

            try:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                tts.tts(
                    text=clean_text,
                    filename=str(out_path),
                    return_type="file",
                    preprocess=True,   # auto-converts numbers/ๆ to spoken Thai
                )

                size_kb = out_path.stat().st_size / 1024
                print(f"     ✅  wrote  {rel_path}  ({size_kb:.0f} KB)")
                generated += 1

            except Exception as e:
                print(f"     ❌  failed {rel_path}: {e}")
                failed += 1

    print()

# ── Summary ────────────────────────────────────────────────────────────────
print("┌──────────────────────────────────────────────┐")
print(f"│  ✅  Generated : {str(generated):<29}│")
print(f"│  ⏭️   Skipped   : {str(skipped):<29}│")
print(f"│  ❌  Failed    : {str(failed):<29}│")
print("└──────────────────────────────────────────────┘")
print()

if generated > 0:
    print("🎉  Done! WAV files are ready in:")
    print(f"   {OUT_DIR.relative_to(ROOT_DIR)}")
    print()

if failed > 0:
    print("Some files failed. Check the errors above.")
    sys.exit(1)
