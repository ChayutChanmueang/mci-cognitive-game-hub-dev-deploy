# Technical Specification: MCI-GaTE Audio Architecture

## Pattern: Global Audio Broker (via EventBus)

---

### 1. Overview

This document details the unified audio architecture for the MCI-GaTE cognitive training platform. The system implements a **Global Audio Broker** pattern to seamlessly manage audio across the main HTML/DOM hub and the individual Phaser-based minigames.

Instead of each Phaser instance managing its own Web Audio context and asset pipeline, the **hub layer** acts as the central "Audio DJ." Phaser minigames function as lightweight clients that dispatch audio requests through the shared **EventBus** — the same communication channel already used for HUD updates, game-over signals, and exit flows.

### 2. Architectural Benefits

| Benefit | Description |
| --- | --- |
| **Continuous Playback** | Background music (BGM) persists without interruption when dynamically switching between minigames. The Phaser `Game` instance is destroyed on exit, but the hub-owned audio manager survives. |
| **Centralized Asset Management** | Global audio assets (BGM, shared UI SFX) are loaded once by the hub. Game-specific SFX are loaded on demand and released when the game exits. |
| **Accessibility & Safety** | Global volume and mute settings apply instantly across the entire platform. This provides a safe, predictable experience for the senior target demographic, eliminating the risk of individual minigames bypassing master volume. |
| **Decoupled Logic** | Game scenes never import or reference the audio manager directly. They communicate solely through EventBus events, keeping games testable in isolation. |
| **VoiceService Coordination** | The broker orchestrates BGM volume ducking when the TTS `VoiceService` speaks, ensuring spoken instructions are always audible. |

### 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Hub Layer (DOM)                                            │
│                                                             │
│  ┌───────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │ AudioManager  │◄───│  EventBus    │◄──│ Phaser Scene │  │
│  │ (hub-audio)   │    │ (shared)     │   │ (minigame)   │  │
│  └──────┬────────┘    └──────────────┘   └──────────────┘  │
│         │                                                   │
│  ┌──────▼────────┐    ┌──────────────┐                     │
│  │  Howler.js    │    │ VoiceService │                     │
│  │  (Web Audio)  │    │ (TTS / SpeechSynthesis)            │
│  └──────┬────────┘    └──────┬───────┘                     │
│         │                    │                              │
│  ┌──────▼────────────────────▼───────┐                     │
│  │  StorageManager (persist prefs)   │                     │
│  └───────────────────────────────────┘                     │
│                                                             │
│  ┌───────────────────────────────────┐                     │
│  │  Hub UI Controls (mute, volume)   │                     │
│  └───────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Implementation Details

#### Phase 1: The AudioManager (Hub Layer)

The platform uses `Howler.js` at the hub level to manage the audio graph, handle cross-browser edge cases, and maintain global state. The AudioManager is a module in `src/core/` — not a `window` global.

**File:** `src/core/audio-manager.js`

```javascript
// src/core/audio-manager.js
import { Howl, Howler } from 'howler';
import StorageManager from './storage-manager.js';
import { EventBus } from './EventBus.js';
import VoiceService from './voice-service.js';

// ─── Storage Keys ─────────────────────────────────────────
const STORAGE_KEYS = Object.freeze({
    volume: 'audio_master_volume',
    muted: 'audio_muted',
});

// ─── Default Global Sounds ────────────────────────────────
// Shared SFX available to all games and the hub UI.
const GLOBAL_SOUND_DEFS = {
    'ui:click':     { src: ['assets/audio/global/ui-click.mp3'] },
    'ui:back':      { src: ['assets/audio/global/ui-back.mp3'] },
    'ui:success':   { src: ['assets/audio/global/success.mp3'] },
    'ui:error':     { src: ['assets/audio/global/error.mp3'] },
    'ui:celebrate': { src: ['assets/audio/global/celebrate.mp3'] },
};

// BGM tracks keyed by category or context.
// Each can have multiple variants for variety.
const BGM_DEFS = {
    hub:           { src: ['assets/audio/bgm/hub-theme.mp3'], loop: true },
    Memory:        { src: ['assets/audio/bgm/memory-ambient.mp3'], loop: true },
    Visuospatial:  { src: ['assets/audio/bgm/visuospatial-ambient.mp3'], loop: true },
    Attention:     { src: ['assets/audio/bgm/attention-ambient.mp3'], loop: true },
    Language:      { src: ['assets/audio/bgm/language-ambient.mp3'], loop: true },
    Executive:     { src: ['assets/audio/bgm/executive-ambient.mp3'], loop: true },
};

// ─── AudioManager ─────────────────────────────────────────
const AudioManager = {
    /** @type {boolean} */
    _initialized: false,

    /** @type {boolean} */
    _muted: false,

    /** @type {number} 0.0 – 1.0 */
    _volume: 0.8,

    /** @type {number} Volume level before ducking for TTS */
    _preDuckVolume: 0.8,

    /** @type {Map<string, Howl>} All loaded sound instances */
    _sounds: new Map(),

    /** @type {string|null} Currently playing BGM key */
    _currentBgmKey: null,

    /** @type {number|null} Howl sound ID of the current BGM */
    _currentBgmId: null,

    /** @type {Set<string>} Track which game namespaces are registered */
    _registeredNamespaces: new Set(),

    /** @type {number} Max concurrent SFX to prevent audio spam */
    MAX_CONCURRENT_SFX: 8,

    /** @type {number} Currently playing SFX count */
    _activeSfxCount: 0,

    // ─── Initialization ───────────────────────────────────

    /**
     * Initialize the audio system. Call once from the hub's
     * DOMContentLoaded handler. Safe to call multiple times
     * (subsequent calls are no-ops).
     */
    init() {
        if (this._initialized) return;
        this._initialized = true;

        // Restore persisted preferences
        this._volume = StorageManager.get(STORAGE_KEYS.volume, 0.8);
        this._muted = StorageManager.get(STORAGE_KEYS.muted, false);
        Howler.volume(this._volume);
        Howler.mute(this._muted);

        // Load global sounds
        this._loadSoundDefs(GLOBAL_SOUND_DEFS);

        // Pre-load hub BGM (others loaded on demand)
        this._loadSoundDefs({ 'bgm:hub': BGM_DEFS.hub });

        // Subscribe to EventBus audio events from Phaser games
        this._bindEventBus();

        // Handle mobile autoplay policy
        this._setupAutoplayResume();

        console.log('[AudioManager] Initialized');
    },

    // ─── EventBus Binding ─────────────────────────────────

    /**
     * Wire up EventBus listeners. Phaser scenes emit these
     * events; the AudioManager handles them here.
     */
    _bindEventBus() {
        // SFX playback
        EventBus.on('audio:play', (key, options) => {
            this.play(key, options);
        });

        // BGM control
        EventBus.on('audio:bgm', (key, options) => {
            this.playBgm(key, options);
        });

        EventBus.on('audio:bgm-stop', () => {
            this.stopBgm();
        });

        // Dynamic sound registration (game-specific SFX)
        EventBus.on('audio:register', (namespace, soundDefs) => {
            this.registerGameSounds(namespace, soundDefs);
        });

        EventBus.on('audio:unregister', (namespace) => {
            this.unregisterGameSounds(namespace);
        });

        // Volume/mute control from UI or game
        EventBus.on('audio:set-volume', (volume) => {
            this.setVolume(volume);
        });

        EventBus.on('audio:toggle-mute', (muteState) => {
            this.toggleMute(muteState);
        });

        // VoiceService coordination
        EventBus.on('audio:duck', () => {
            this._duckForTts();
        });

        EventBus.on('audio:unduck', () => {
            this._unduckAfterTts();
        });
    },

    // ─── Mobile Autoplay Resume ───────────────────────────

    /**
     * iOS and Android require a user gesture before the Web
     * Audio context can produce sound. We attach a one-time
     * listener to the first touch/click to resume the context.
     */
    _setupAutoplayResume() {
        const resumeContext = () => {
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume().then(() => {
                    console.log('[AudioManager] AudioContext resumed after user gesture');
                });
            }
            document.removeEventListener('touchstart', resumeContext);
            document.removeEventListener('click', resumeContext);
        };

        document.addEventListener('touchstart', resumeContext, { once: true });
        document.addEventListener('click', resumeContext, { once: true });
    },

    // ─── Sound Loading ────────────────────────────────────

    /**
     * Load a map of { key: HowlConfig } into the sound pool.
     * @param {Object<string, Object>} defs
     */
    _loadSoundDefs(defs) {
        for (const [key, config] of Object.entries(defs)) {
            if (this._sounds.has(key)) continue;

            const howl = new Howl({
                src: config.src,
                loop: config.loop || false,
                volume: config.volume ?? 1.0,
                preload: config.preload !== false,
            });

            howl.on('end', () => {
                if (!config.loop) {
                    this._activeSfxCount = Math.max(0, this._activeSfxCount - 1);
                }
            });

            this._sounds.set(key, howl);
        }
    },

    // ─── Dynamic Game Sound Registration ──────────────────

    /**
     * Register game-specific sounds. Called by a game scene
     * at creation time via EventBus.
     *
     * @param {string} namespace - Game slug, e.g. 'fry-food'
     * @param {Object<string, Object>} soundDefs - Sound definitions
     *
     * @example
     * // In a Phaser scene's create():
     * EventBus.emit('audio:register', 'fry-food', {
     *     sizzle:  { src: ['assets/fry-food/audio/sizzle.mp3'] },
     *     plating: { src: ['assets/fry-food/audio/plating.mp3'] },
     *     burn:    { src: ['assets/fry-food/audio/burn.mp3'] },
     * });
     *
     * // Then play with:
     * EventBus.emit('audio:play', 'fry-food:sizzle');
     */
    registerGameSounds(namespace, soundDefs) {
        if (!namespace || !soundDefs) return;

        const prefixed = {};
        for (const [key, config] of Object.entries(soundDefs)) {
            prefixed[`${namespace}:${key}`] = config;
        }

        this._loadSoundDefs(prefixed);
        this._registeredNamespaces.add(namespace);

        console.log(`[AudioManager] Registered sounds for "${namespace}":`,
            Object.keys(soundDefs));
    },

    /**
     * Unload all sounds belonging to a game namespace.
     * Called when a game is destroyed to free memory.
     *
     * @param {string} namespace - Game slug, e.g. 'fry-food'
     */
    unregisterGameSounds(namespace) {
        if (!namespace) return;

        const prefix = `${namespace}:`;
        for (const [key, howl] of this._sounds.entries()) {
            if (key.startsWith(prefix)) {
                howl.unload();
                this._sounds.delete(key);
            }
        }

        this._registeredNamespaces.delete(namespace);
        console.log(`[AudioManager] Unregistered sounds for "${namespace}"`);
    },

    // ─── SFX Playback ─────────────────────────────────────

    /**
     * Play a one-shot sound effect.
     *
     * @param {string} key - Sound key, e.g. 'ui:click' or 'fry-food:sizzle'
     * @param {Object} [options] - Optional overrides
     * @param {number} [options.volume] - Volume override (0.0 – 1.0)
     * @param {number} [options.rate] - Playback rate override
     * @returns {number|null} Howl sound ID, or null if blocked
     */
    play(key, options = {}) {
        if (this._muted) return null;

        const howl = this._sounds.get(key);
        if (!howl) {
            console.warn(`[AudioManager] Unknown sound key: "${key}"`);
            return null;
        }

        // Concurrency gate: prevent audio spam
        if (this._activeSfxCount >= this.MAX_CONCURRENT_SFX) {
            return null;
        }

        this._activeSfxCount++;

        const id = howl.play();

        if (options.volume !== undefined) {
            howl.volume(options.volume, id);
        }
        if (options.rate !== undefined) {
            howl.rate(options.rate, id);
        }

        return id;
    },

    // ─── BGM Playback ─────────────────────────────────────

    /**
     * Start or crossfade to a BGM track.
     *
     * @param {string} key - BGM context key: 'hub', 'Memory',
     *   'Visuospatial', 'Attention', 'Language', or 'Executive'
     * @param {Object} [options]
     * @param {number} [options.fadeDuration=1000] - Crossfade duration in ms
     */
    playBgm(key, options = {}) {
        const bgmKey = `bgm:${key}`;
        const fadeDuration = options.fadeDuration ?? 1000;

        // Already playing this track — no-op
        if (this._currentBgmKey === bgmKey && this._currentBgmId !== null) {
            return;
        }

        // Ensure the BGM is loaded
        const bgmDef = BGM_DEFS[key];
        if (bgmDef && !this._sounds.has(bgmKey)) {
            this._loadSoundDefs({ [bgmKey]: bgmDef });
        }

        const nextHowl = this._sounds.get(bgmKey);
        if (!nextHowl) {
            console.warn(`[AudioManager] Unknown BGM key: "${key}"`);
            return;
        }

        // Fade out current BGM
        if (this._currentBgmKey && this._currentBgmId !== null) {
            const prevHowl = this._sounds.get(this._currentBgmKey);
            const prevId = this._currentBgmId;
            if (prevHowl) {
                prevHowl.fade(prevHowl.volume(), 0, fadeDuration, prevId);
                setTimeout(() => prevHowl.stop(prevId), fadeDuration);
            }
        }

        // Fade in next BGM
        const nextId = nextHowl.play();
        nextHowl.volume(0, nextId);
        nextHowl.fade(0, 1.0, fadeDuration, nextId);

        this._currentBgmKey = bgmKey;
        this._currentBgmId = nextId;
    },

    /**
     * Stop the current BGM with an optional fade-out.
     *
     * @param {Object} [options]
     * @param {number} [options.fadeDuration=500] - Fade-out duration in ms
     */
    stopBgm(options = {}) {
        const fadeDuration = options.fadeDuration ?? 500;

        if (this._currentBgmKey && this._currentBgmId !== null) {
            const howl = this._sounds.get(this._currentBgmKey);
            if (howl) {
                howl.fade(howl.volume(), 0, fadeDuration, this._currentBgmId);
                const id = this._currentBgmId;
                setTimeout(() => howl.stop(id), fadeDuration);
            }
        }

        this._currentBgmKey = null;
        this._currentBgmId = null;
    },

    // ─── Volume & Mute ────────────────────────────────────

    /**
     * Set the master volume.
     * @param {number} volume - 0.0 to 1.0
     */
    setVolume(volume) {
        this._volume = Math.max(0, Math.min(1, volume));
        Howler.volume(this._volume);
        StorageManager.save(STORAGE_KEYS.volume, this._volume);
    },

    /**
     * Toggle global mute state. Affects both Howler.js audio
     * and VoiceService TTS.
     *
     * @param {boolean} [muteState] - Explicit state; omit to toggle
     */
    toggleMute(muteState) {
        this._muted = muteState !== undefined ? !!muteState : !this._muted;

        Howler.mute(this._muted);
        VoiceService.setEnabled(!this._muted);

        StorageManager.save(STORAGE_KEYS.muted, this._muted);

        console.log(`[AudioManager] Mute: ${this._muted}`);
    },

    /** @returns {boolean} Current mute state */
    isMuted() {
        return this._muted;
    },

    /** @returns {number} Current master volume (0.0 – 1.0) */
    getVolume() {
        return this._volume;
    },

    // ─── VoiceService Ducking ─────────────────────────────

    /**
     * Lower BGM volume while TTS is speaking so the voice is
     * clearly audible over background music.
     */
    _duckForTts() {
        this._preDuckVolume = this._volume;
        Howler.volume(this._volume * 0.2);
    },

    /**
     * Restore BGM volume after TTS finishes speaking.
     */
    _unduckAfterTts() {
        Howler.volume(this._preDuckVolume);
    },

    // ─── Cleanup ──────────────────────────────────────────

    /**
     * Tear down the entire audio system. Normally never called,
     * but useful for testing or full app reset.
     */
    destroy() {
        this.stopBgm({ fadeDuration: 0 });

        for (const [, howl] of this._sounds) {
            howl.unload();
        }

        this._sounds.clear();
        this._registeredNamespaces.clear();
        this._initialized = false;

        EventBus.off('audio:play');
        EventBus.off('audio:bgm');
        EventBus.off('audio:bgm-stop');
        EventBus.off('audio:register');
        EventBus.off('audio:unregister');
        EventBus.off('audio:set-volume');
        EventBus.off('audio:toggle-mute');
        EventBus.off('audio:duck');
        EventBus.off('audio:unduck');

        console.log('[AudioManager] Destroyed');
    },
};

export default AudioManager;
```

---

#### Phase 2: VoiceService Integration

The existing `VoiceService` (`src/core/voice-service.js`) needs minor updates to emit ducking events before and after speaking. This lets the AudioManager lower BGM automatically.

**Changes to** `src/core/voice-service.js`:

```diff
+ import { EventBus } from './EventBus.js';

  speak(text, options = {}) {
      if (!this.synth || !this.enabled || !text) return;
      this.synth.cancel();

+     // Tell AudioManager to lower BGM while we speak
+     EventBus.emit('audio:duck');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = options.voice || this.defaultVoice;
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

+     utterance.onend = () => {
+         EventBus.emit('audio:unduck');
+     };
+
+     utterance.onerror = () => {
+         EventBus.emit('audio:unduck');
+     };

      this.synth.speak(utterance);
  }
```

---

#### Phase 3: Hub Bootstrap Integration

Initialize the AudioManager from the hub's main entry point.

**Changes to** `src/main.js`:

```diff
+ import AudioManager from './core/audio-manager.js';

  document.addEventListener('DOMContentLoaded', () => {
      const app = document.getElementById('app');
      const uiRoot = document.getElementById('ui-root');
      const gameContainer = document.getElementById('game-container');
+
+     // Initialize the global audio system
+     AudioManager.init();
+
      // ... existing hub setup
  });
```

Start hub BGM when the player reaches the hub screen:

```diff
  const showHub = async (options = {}) => {
      // ... existing hub setup
+     EventBus.emit('audio:bgm', 'hub');
      // ...
  };
```

Switch BGM when a cognitive category is selected:

```diff
  onStateChange: ({ scene, activeCategory }) => {
      navigateTo(getHubRouteHash({ scene, category: activeCategory }), { replace: true });
+     if (scene === 'selection' && activeCategory) {
+         EventBus.emit('audio:bgm', activeCategory);
+     }
  },
```

Clean up game-specific audio when a game is destroyed:

```diff
  const destroyActiveGame = () => {
      if (activeGameInstance && typeof activeGameInstance.destroy === 'function') {
          activeGameInstance.destroy(true);
      }
      activeGameInstance = null;
      if (gameContainer) {
          gameContainer.innerHTML = '';
      }
      document.documentElement.style.removeProperty('--game-mode-background');
+
+     // Unregister any game-specific sounds to free memory
+     EventBus.emit('audio:unregister', currentGameSlug);
  };
```

---

#### Phase 4: Hub DOM Controls (User Interface)

Audio controls in the hub UI, bound to the AudioManager via EventBus.

```html
<div id="audio-controls" class="audio-controls">
    <button id="mute-toggle" aria-label="Toggle mute">
        <span class="material-symbols-rounded">volume_up</span>
    </button>
    <input
        type="range"
        id="volume-slider"
        min="0"
        max="1"
        step="0.05"
        aria-label="Master volume"
    />
</div>

<script type="module">
    import AudioManager from './core/audio-manager.js';

    const muteBtn = document.getElementById('mute-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const muteIcon = muteBtn.querySelector('.material-symbols-rounded');

    // Sync UI with persisted state
    volumeSlider.value = AudioManager.getVolume();
    muteIcon.textContent = AudioManager.isMuted() ? 'volume_off' : 'volume_up';

    muteBtn.addEventListener('click', () => {
        AudioManager.toggleMute();
        muteIcon.textContent = AudioManager.isMuted() ? 'volume_off' : 'volume_up';
    });

    volumeSlider.addEventListener('input', (e) => {
        AudioManager.setVolume(parseFloat(e.target.value));
    });
</script>
```

---

#### Phase 5: Phaser Minigame Integration

Phaser scenes never import `AudioManager` directly. All audio is dispatched through EventBus — the same pattern already used for `minigame:score`, `minigame:tick`, etc.

**Example: Registering game sounds on scene create**

```javascript
// Inside any Phaser Scene's create() method
import { EventBus } from '../../core/EventBus.js';

class FryFoodGameplay extends Phaser.Scene {
    create() {
        // Register this game's sound effects
        EventBus.emit('audio:register', 'fry-food', {
            sizzle:    { src: ['assets/fry-food/audio/sizzle.mp3'] },
            plating:   { src: ['assets/fry-food/audio/plating.mp3'] },
            burn:      { src: ['assets/fry-food/audio/burn.mp3'] },
            flip:      { src: ['assets/fry-food/audio/flip.mp3'] },
            ding:      { src: ['assets/fry-food/audio/ding.mp3'] },
        });

        // ... rest of create
    }

    onFlipFood(food) {
        EventBus.emit('audio:play', 'fry-food:flip');
        // ... game logic
    }

    onFoodCooked(food) {
        // Play a shared global success sound
        EventBus.emit('audio:play', 'ui:success');
        // ... game logic
    }

    onFoodBurned(food) {
        // Play a game-specific burn sound
        EventBus.emit('audio:play', 'fry-food:burn');
        // Also play the shared error sound
        EventBus.emit('audio:play', 'ui:error');
        // ... game logic
    }
}
```

> **Note:** Games do NOT need to call `audio:unregister` themselves. The hub's
> `destroyActiveGame()` handles cleanup automatically when the player exits.

---

### 5. EventBus Audio Protocol

All audio events follow the `audio:*` namespace, consistent with the existing `minigame:*` convention.

| Event | Direction | Payload | Description |
| --- | --- | --- | --- |
| `audio:play` | Game → Hub | `(key: string, options?: { volume, rate })` | Play a one-shot SFX |
| `audio:bgm` | Game/Hub → Hub | `(key: string, options?: { fadeDuration })` | Start or crossfade to a BGM track |
| `audio:bgm-stop` | Game/Hub → Hub | — | Stop current BGM with fade-out |
| `audio:register` | Game → Hub | `(namespace: string, defs: Object)` | Load game-specific sounds |
| `audio:unregister` | Hub → Hub | `(namespace: string)` | Unload game-specific sounds |
| `audio:set-volume` | UI → Hub | `(volume: number)` | Set master volume (0.0–1.0) |
| `audio:toggle-mute` | UI → Hub | `(muteState?: boolean)` | Toggle or set mute state |
| `audio:duck` | VoiceService → Hub | — | Lower BGM for TTS playback |
| `audio:unduck` | VoiceService → Hub | — | Restore BGM after TTS ends |

---

### 6. Sound Key Naming Convention

Sound keys use a `namespace:name` pattern to avoid collisions:

| Prefix | Usage | Examples |
| --- | --- | --- |
| `ui:*` | Shared UI sounds (global) | `ui:click`, `ui:success`, `ui:error`, `ui:celebrate` |
| `bgm:*` | Background music tracks | `bgm:hub`, `bgm:Memory`, `bgm:Attention` |
| `{game-slug}:*` | Game-specific SFX | `fry-food:sizzle`, `zoo-detective:magnify`, `postcard-reader:flip` |

---

### 7. Asset Preloading Strategy

| Asset Type | When Loaded | When Unloaded |
| --- | --- | --- |
| **Global SFX** (`ui:*`) | `AudioManager.init()` at app start | Never (persists for app lifetime) |
| **Hub BGM** (`bgm:hub`) | `AudioManager.init()` at app start | Never |
| **Category BGM** (`bgm:Memory`, etc.) | On first `playBgm()` call for that category | Never (cached for reuse) |
| **Game SFX** (`{game-slug}:*`) | When game scene emits `audio:register` | When hub calls `audio:unregister` on game destroy |

---

### 8. File Structure

```
public/assets/audio/
├── global/
│   ├── ui-click.mp3
│   ├── ui-back.mp3
│   ├── success.mp3
│   ├── error.mp3
│   └── celebrate.mp3
├── bgm/
│   ├── hub-theme.mp3
│   ├── memory-ambient.mp3
│   ├── visuospatial-ambient.mp3
│   ├── attention-ambient.mp3
│   ├── language-ambient.mp3
│   └── executive-ambient.mp3
└── (game-specific audio lives under each game's asset folder)

public/assets/fry-food/audio/
├── sizzle.mp3
├── plating.mp3
├── burn.mp3
├── flip.mp3
└── ding.mp3

public/assets/zoo-detective/audio/
├── magnify.mp3
├── clue-found.mp3
└── case-solved.mp3
```

---

### 9. Deployment Notes

1. **Dependencies:** Add `howler` to `package.json`:
   ```
   npm install howler
   ```

2. **Script Loading:** `AudioManager` is an ES module imported by `src/main.js`. No separate `<script>` tag needed — Vite bundles it automatically.

3. **Standalone Game Testing:** If a Phaser game is booted outside the hub (e.g., during isolated development), `EventBus.emit('audio:play', ...)` calls are harmless no-ops because no listener is registered. Games will not crash.

4. **Audio File Format:** Use `.mp3` for maximum browser compatibility. For games that need lower latency, consider adding `.webm` or `.ogg` as fallback formats in the `src` array:
   ```javascript
   { src: ['assets/audio/sfx.webm', 'assets/audio/sfx.mp3'] }
   ```

5. **File Size Guidelines:**
   - SFX: ≤ 100 KB each (mono, 44.1 kHz, 128 kbps)
   - BGM: ≤ 2 MB each (stereo, 44.1 kHz, 128 kbps, loopable)

---

### 10. Future Considerations

| Feature | Description |
| --- | --- |
| **Audio Sprites** | Combine multiple short SFX into a single audio file with sprite definitions to reduce HTTP requests. Howler.js supports this natively. |
| **Spatial Audio** | For games that benefit from directional sound (e.g., zoo-detective), Howler supports stereo panning via `pos()` and `stereo()`. |
| **Adaptive Music** | Layer multiple BGM stems that can be mixed dynamically based on game state (calm → intense). |
| **Offline Support** | The existing Service Worker (`sw.js`) should cache audio assets for offline play. Add audio file paths to the SW precache list. |

<parameter name="toolAction">Writing updated spec