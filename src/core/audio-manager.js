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
    'ui:click':     { src: ['assets/audio/common/sfx/Button_Click.mp3'] },
    'ui:popup':     { src: ['assets/audio/common/sfx/Panel_PopUp.mp3'] },
};

// BGM tracks keyed by category or context.
const BGM_DEFS = {
    hub:           { src: ['assets/audio/gamehub/bgm/GameHub_BGM.mp3'], loop: true },
    'zoo-feeder':  { src: ['assets/audio/zoo-feeder/Zoo Feeder_BGM.mp3'], loop: true, volume: 0.05 },
    'context-clues':{ src: ['assets/audio/context-clue/Context Clue_BGM.mp3'], loop: true },
    'zoo-detective':{ src: ['assets/audio/zoo-detective/Zoo Detective_BGM.mp3'], loop: true },
    'symmetry-decor':{ src: ['assets/audio/symmetry-decor/Symmetry_BGM.mp3'], loop: true },
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

        // Handle page visibility (mute audio when minimized)
        this._setupVisibilityHandling();

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

    // ─── Visibility Handling ──────────────────────────────

    /**
     * Mute audio when the page is minimized or backgrounded.
     */
    _setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Mute globally when hidden so audio stops playing in background
                Howler.mute(true);
                // Also suspend context to save battery and stop time progression if possible
                if (Howler.ctx && typeof Howler.ctx.suspend === 'function') {
                    Howler.ctx.suspend().catch(() => {});
                }
            } else {
                // Restore user's actual mute state when visible again
                Howler.mute(this._muted);
                if (Howler.ctx && typeof Howler.ctx.resume === 'function') {
                    Howler.ctx.resume().catch(() => {});
                }
            }
        });
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
     * Toggle global mute state.
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
     * Lower BGM volume while TTS is speaking.
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
     * Tear down the entire audio system.
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
