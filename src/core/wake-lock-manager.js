// US-E9-06: ScreenWakeLockManager
//
// Acquires a Screen Wake Lock when a Phaser game is active, preventing the
// device screen from dimming or sleeping during gameplay. Releases the lock
// when the player returns to the Game Hub or the browser tab is hidden.
//
// Architecture:
//   - Singleton module — import `screenWakeLock` (default export).
//   - Call `.acquire()` after the Phaser game successfully launches.
//   - Call `.release()` when leaving the Phaser game (hidePhaserCanvas
//     covers all exit paths: explicit exit button, game-over, route change).
//
// Limitations:
//   - Requires a secure context (HTTPS or localhost).
//   - Not supported on all browsers (e.g. some iOS Safari versions).
//   - Always fails gracefully — errors never block game launch.

class ScreenWakeLockManager {
    constructor() {
        /** @type {WakeLockSentinel|null} */
        this._sentinel = null;
        /** @type {boolean} true while the player is inside a Phaser game. */
        this._isPhaserActive = false;
        this._boundVisibilityChange = this._onVisibilityChange.bind(this);
    }

    /** True when the browser API is available. */
    get isSupported() {
        return (
            typeof navigator !== 'undefined' &&
            typeof navigator.wakeLock !== 'undefined' &&
            typeof navigator.wakeLock.request === 'function'
        );
    }

    /**
     * Request a screen wake lock.
     * Call this once after the Phaser game finishes launching.
     * Idempotent — safe to call when already holding a lock.
     */
    async acquire() {
        this._isPhaserActive = true;

        if (!this.isSupported) {
            return;
        }

        // Deduplicate — no need to request twice.
        if (this._sentinel) {
            return;
        }

        try {
            this._sentinel = await navigator.wakeLock.request('screen');
            this._sentinel.addEventListener('release', this._onRelease.bind(this));
            if (typeof console !== 'undefined') {
                console.debug('[wake-lock] acquired');
            }
        } catch (err) {
            // Common reasons: document not visible, user revoked, no secure context at
            // runtime. None of these are fatal — the game will still work.
            if (typeof console !== 'undefined') {
                console.warn('[wake-lock] acquire failed (non-fatal):', err?.message || err);
            }
            this._sentinel = null;
        }

        // Watch tab visibility so we re-acquire when the player returns while still
        // in a Phaser game. Registered once on acquire; removed on release.
        document.addEventListener('visibilitychange', this._boundVisibilityChange);
    }

    /**
     * Release the wake lock.
     * Call this whenever the player leaves a Phaser game for any reason
     * (exit button, game-over, back navigation, route change).
     * Idempotent — safe to call when no lock is held.
     */
    async release() {
        this._isPhaserActive = false;

        document.removeEventListener('visibilitychange', this._boundVisibilityChange);

        if (this._sentinel) {
            const sentinel = this._sentinel;
            this._sentinel = null;
            try {
                await sentinel.release();
                if (typeof console !== 'undefined') {
                    console.debug('[wake-lock] released');
                }
            } catch (err) {
                // release() can throw if already released or the document is hidden.
                if (typeof console !== 'undefined') {
                    console.debug('[wake-lock] release error (ignored):', err?.message || err);
                }
            }
        }
    }

    /** @private Fires when the system reclaims the wake lock (e.g. tab hidden). */
    _onRelease() {
        if (typeof console !== 'undefined') {
            console.debug('[wake-lock] released by system');
        }
        this._sentinel = null;
    }

    /** @private Re-acquire when tab becomes visible again, only while still in a Phaser game. */
    async _onVisibilityChange() {
        if (document.visibilityState !== 'visible') {
            // Tab hidden — the system will fire `release` on the sentinel shortly.
            // We don't release manually; _onRelease handles nulling _sentinel.
            return;
        }

        // Tab became visible — only re-acquire if the player is still in a game.
        if (!this._isPhaserActive) {
            return;
        }

        if (this._sentinel) {
            // Already holding the lock (rare but possible on some browsers).
            return;
        }

        if (!this.isSupported) {
            return;
        }

        try {
            this._sentinel = await navigator.wakeLock.request('screen');
            this._sentinel.addEventListener('release', this._onRelease.bind(this));
            if (typeof console !== 'undefined') {
                console.debug('[wake-lock] re-acquired after tab visibility');
            }
        } catch (err) {
            if (typeof console !== 'undefined') {
                console.warn('[wake-lock] re-acquire failed (non-fatal):', err?.message || err);
            }
            this._sentinel = null;
        }
    }
}

const screenWakeLock = new ScreenWakeLockManager();
export default screenWakeLock;
