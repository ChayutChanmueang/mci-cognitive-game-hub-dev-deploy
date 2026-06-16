/**
 * video-manager.js
 *
 * Singleton that owns global video volume and mute state.
 * Registers VideoPlayer instances and keeps them in sync.
 *
 * Game UI integration via EventBus:
 *   EventBus.emit('video:set-volume', 0.5)   — set exact volume
 *   EventBus.emit('video:toggle-mute')        — toggle mute
 *
 * Emits to game UI:
 *   'video:volume-changed'  (volume: number)
 *   'video:mute-changed'    (muted: boolean)
 */

import StorageManager from './storage-manager.js';
import { EventBus } from './EventBus.js';

const STORAGE_KEYS = Object.freeze({
    volume: 'video_master_volume',
    muted:  'video_muted',
});

const VideoManager = {
    _initialized: false,

    /** @type {number} 0.0 – 1.0 */
    _volume: 0.8,

    /** @type {boolean} */
    _muted: false,

    /** @type {Set<import('../util/video-player/VideoPlayer.js').VideoPlayer>} */
    _instances: new Set(),

    // ── Init ──────────────────────────────────────────────────────────────────

    init() {
        if (this._initialized) return;
        this._initialized = true;

        this._volume = StorageManager.get(STORAGE_KEYS.volume, 0.8);
        this._muted  = StorageManager.get(STORAGE_KEYS.muted,  false);

        EventBus.on('video:set-volume',  (v) => this.setVolume(v));
        EventBus.on('video:toggle-mute', (s) => this.toggleMute(s));
    },

    // ── Registration ──────────────────────────────────────────────────────────

    /**
     * Register a VideoPlayer instance.
     * Applies current global state immediately and subscribes to
     * events emitted by the player when the user adjusts controls.
     */
    register(player) {
        if (!this._initialized) this.init();
        this._instances.add(player);

        player.on('volume-changed', (v) => {
            this._volume = v;
            StorageManager.save(STORAGE_KEYS.volume, this._volume);
            for (const p of this._instances) {
                if (p !== player) p.setVolume(this._volume);
            }
            EventBus.emit('video:volume-changed', this._volume);
        });

        player.on('mute-changed', (muted) => {
            this._muted = muted;
            StorageManager.save(STORAGE_KEYS.muted, this._muted);
            for (const p of this._instances) {
                if (p !== player) p.setMuted(this._muted);
            }
            EventBus.emit('video:mute-changed', this._muted);
        });

        player.on('destroy', () => this._instances.delete(player));

        player.setVolume(this._volume);
        player.setMuted(this._muted);
    },

    // ── External control (from game UI) ───────────────────────────────────────

    setVolume(volume) {
        this._volume = Math.max(0, Math.min(1, Number(volume) || 0));
        StorageManager.save(STORAGE_KEYS.volume, this._volume);
        for (const p of this._instances) p.setVolume(this._volume);
        EventBus.emit('video:volume-changed', this._volume);
    },

    toggleMute(muteState) {
        this._muted = muteState !== undefined ? Boolean(muteState) : !this._muted;
        StorageManager.save(STORAGE_KEYS.muted, this._muted);
        for (const p of this._instances) p.setMuted(this._muted);
        EventBus.emit('video:mute-changed', this._muted);
    },

    isMuted()   { return this._muted; },
    getVolume() { return this._volume; },
};

export default VideoManager;
