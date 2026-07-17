// US-E9-06: ScreenWakeLockManager
//
// Keeps the device screen awake while the player is actively engaged, so a short
// system screen timeout cannot interrupt a minigame or a story video.
//
// Architecture:
//   - Singleton module — import `screenWakeLock` (default export).
//   - Owner-based: several independent features may need the screen awake at the
//     same time, so each one calls `.acquire(owner)` / `.release(owner)` with its
//     own key. The underlying lock is held while at least one owner is active and
//     dropped once the last one releases.
//   - Current owners: "minigame" (Phaser, see main.js) and "video" (VideoPlayer).
//
// Two strategies, tried in order:
//   1. Screen Wake Lock API — the correct one, but it ONLY exists in a secure
//      context (HTTPS or localhost). Served over plain http:// (an nginx test VM
//      reached by LAN IP, say) `navigator.wakeLock` is simply undefined.
//   2. Silent looping <video> — playing media keeps the screen awake on Android and
//      iOS regardless of origin. Covers http:// and browsers predating the API.
//
// Report which one is live with `screenWakeLock.getStatus()` (also on
// `window.__wakeLock` in dev builds), because a wake lock that silently does
// nothing is indistinguishable from one that works until the screen dims.
import { SILENT_VIDEO_MP4, SILENT_VIDEO_WEBM } from './wake-lock-video-source.js';

class ScreenWakeLockManager {
    constructor() {
        /** @type {WakeLockSentinel|null} */
        this._sentinel = null;
        /** @type {HTMLVideoElement|null} */
        this._video = null;
        /** @type {Set<string>} Features that currently need the screen awake. */
        this._owners = new Set();
        /** @type {'none'|'wake-lock-api'|'video-fallback'} */
        this._strategy = 'none';
        this._boundVisibilityChange = this._onVisibilityChange.bind(this);
        this._boundRelease = this._onSentinelRelease.bind(this);
    }

    /** True when the Screen Wake Lock API is available (implies a secure context). */
    get isSupported() {
        return (
            typeof navigator !== 'undefined' &&
            typeof navigator.wakeLock !== 'undefined' &&
            typeof navigator.wakeLock.request === 'function'
        );
    }

    /** Diagnostics: what is actually holding the screen awake right now. */
    getStatus() {
        return {
            strategy: this._strategy,
            owners: [...this._owners],
            apiSupported: this.isSupported,
            secureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
            holding: Boolean(this._sentinel) || Boolean(this._video && !this._video.paused),
        };
    }

    /**
     * Register `owner` as needing the screen awake, engaging a strategy if this is
     * the first active owner. Idempotent per owner.
     *
     * @param {string} owner e.g. "minigame" or "video"
     */
    async acquire(owner = 'minigame') {
        this._owners.add(owner);

        if (this._strategy !== 'none') {
            return;
        }

        // Re-registering the same bound reference is a no-op, so this stays balanced
        // with the removeEventListener in release().
        document.addEventListener('visibilitychange', this._boundVisibilityChange);

        if (this.isSupported) {
            await this._requestSentinel();
        }

        // Either the API is missing (insecure origin / old browser) or the request
        // was refused. Fall back to media playback, which has no origin requirement.
        if (this._strategy === 'none') {
            if (!this.isSupported && typeof window !== 'undefined' && !window.isSecureContext) {
                console.warn(
                    '[wake-lock] Screen Wake Lock API unavailable because this page is not a ' +
                    'secure context. Serve the app over HTTPS to use it. Falling back to video.',
                );
            }
            await this._startVideo();
        }
    }

    /**
     * Unregister `owner`. The screen is only allowed to sleep again once no owner
     * remains. Idempotent — safe to call for an owner that never acquired.
     *
     * @param {string} owner e.g. "minigame" or "video"
     */
    async release(owner = 'minigame') {
        this._owners.delete(owner);

        if (this._owners.size > 0) {
            return;
        }

        document.removeEventListener('visibilitychange', this._boundVisibilityChange);
        this._strategy = 'none';
        this._stopVideo();

        if (!this._sentinel) {
            return;
        }

        // Null the field before awaiting so a concurrent acquire() cannot observe a
        // sentinel that is already on its way out.
        const sentinel = this._sentinel;
        this._sentinel = null;

        try {
            await sentinel.release();
            console.debug('[wake-lock] released');
        } catch (err) {
            // release() throws if the lock was already reclaimed by the system.
            console.debug('[wake-lock] release error (ignored):', err?.message || err);
        }
    }

    /** @private Request a wake-lock sentinel, tolerating every failure mode. */
    async _requestSentinel() {
        try {
            const sentinel = await navigator.wakeLock.request('screen');

            // The last owner may have left while the request was in flight.
            if (this._owners.size === 0) {
                sentinel.release().catch(() => {});
                return;
            }

            this._sentinel = sentinel;
            this._sentinel.addEventListener('release', this._boundRelease);
            this._strategy = 'wake-lock-api';
            console.debug('[wake-lock] acquired via Wake Lock API');
        } catch (err) {
            // Typically NotAllowedError: document hidden, or the user revoked it.
            console.warn('[wake-lock] Wake Lock API request failed:', err?.message || err);
            this._sentinel = null;
        }
    }

    /** @private Keep the screen awake by looping a silent video. */
    async _startVideo() {
        if (this._owners.size === 0 || typeof document === 'undefined') {
            return;
        }

        if (!this._video) {
            const video = document.createElement('video');
            video.setAttribute('playsinline', '');
            video.setAttribute('title', 'wake lock');
            video.loop = true;
            // Chromium only grants a video wake lock to a video it considers visible:
            // in the viewport, non-trivially sized, and not display:none/visibility:hidden.
            // So this stays on-screen and 64px square, hidden by near-zero opacity rather
            // than by any property the visibility check inspects.
            video.style.cssText =
                'position:fixed;bottom:0;left:0;width:64px;height:64px;opacity:0.01;' +
                'pointer-events:none;z-index:0;';

            for (const [src, type] of [[SILENT_VIDEO_WEBM, 'video/webm'], [SILENT_VIDEO_MP4, 'video/mp4']]) {
                const source = document.createElement('source');
                source.src = src;
                source.type = type;
                video.appendChild(source);
            }

            document.body.appendChild(video);
            this._video = video;
        }

        try {
            // Try with (silent) audio first: Chrome is more willing to keep the screen
            // awake for an audible track than a muted one.
            this._video.muted = false;
            await this._video.play();
        } catch {
            try {
                // Autoplay policy refused the unmuted attempt — muted always autoplays.
                this._video.muted = true;
                await this._video.play();
            } catch (err) {
                console.warn('[wake-lock] video fallback failed to play:', err?.message || err);
                this._stopVideo();
                return;
            }
        }

        this._strategy = 'video-fallback';
        console.debug(`[wake-lock] acquired via video fallback (muted=${this._video.muted})`);
    }

    /** @private */
    _stopVideo() {
        if (!this._video) {
            return;
        }
        this._video.pause();
        this._video.remove();
        this._video = null;
    }

    /** @private Fires when the system reclaims the lock (e.g. tab hidden). */
    _onSentinelRelease() {
        console.debug('[wake-lock] released by system');
        this._sentinel = null;
        if (this._strategy === 'wake-lock-api') {
            this._strategy = 'none';
        }
    }

    /** @private Re-engage once the tab is visible again, if an owner still needs it. */
    async _onVisibilityChange() {
        if (document.visibilityState !== 'visible' || this._owners.size === 0) {
            // Tab hidden — the system reclaims the lock and pauses media on its own.
            return;
        }

        // Still genuinely holding the screen: nothing to re-engage.
        if (this._strategy === 'wake-lock-api' && this._sentinel) {
            return;
        }
        if (this._strategy === 'video-fallback' && this._video && !this._video.paused) {
            return;
        }

        if (this.isSupported) {
            await this._requestSentinel();
        }

        if (this._strategy !== 'wake-lock-api') {
            await this._startVideo();
        }
    }
}

const screenWakeLock = new ScreenWakeLockManager();

if (typeof window !== 'undefined') {
    // Lets the owner check on a real device: `__wakeLock.getStatus()` in the console.
    window.__wakeLock = screenWakeLock;
}

export default screenWakeLock;
