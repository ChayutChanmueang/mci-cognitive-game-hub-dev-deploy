/**
 * VideoPlayer.js
 *
 * A self-contained, embeddable video player component.
 * Manages its own UI (overlays, progress bar) inside any container element.
 * Does NOT create modals, backdrops, or popup wrappers — that is the caller's responsibility.
 *
 * Features:
 *  - No native browser controls (prevents seeking/skipping)
 *  - Play / Pause via tap on the player surface
 *  - Replay button
 *  - Read-only progress bar (visual only, pointer-events: none)
 *  - Material Web 3 components for controls
 *
 * Usage:
 *   import { VideoPlayer } from './video-player/VideoPlayer.js';
 *
 *   // Mount into any container — player fills 100% of it
 *   const player = VideoPlayer.mount(containerEl, {
 *     src: 'https://example.com/video.mp4',
 *   });
 *
 *   // Control programmatically
 *   player.play();
 *   player.pause();
 *   player.replay();
 *
 *   // Cleanup when done
 *   player.destroy();
 *
 * Material Web components required (loaded via material-bundle.js):
 *   <md-fab>, <md-filled-tonal-icon-button>, <md-linear-progress>, <md-icon>
 */

// ---------------------------------------------------------------------------
// HTML template (player UI only — no modal/popup wrapper)
// ---------------------------------------------------------------------------

function _buildPlayerHTML(src, label) {
    return /* html */ `
        <div class="vp-root">
            <!-- Video element — no native controls -->
            <video
                class="vp-video"
                src="${_esc(src)}"
                playsinline
                preload="metadata"
                aria-label="${_esc(label)}"
            ></video>

            <!-- Overlay A: initial (before first play) -->
            <div class="vp-overlay vp-overlay--init" aria-hidden="false">
                <md-fab
                    class="vp-btn-play-init"
                    size="large"
                    variant="primary"
                    aria-label="เล่นวิดีโอ"
                    type="button"
                >
                    <span class="material-symbols-rounded play-symbols-size" slot="icon">play_arrow</span>
                </md-fab>
            </div>

            <!-- Overlay B: paused (shown after first play starts) -->
            <div class="vp-overlay vp-overlay--paused vp-hidden" aria-hidden="true">
                <div class="vp-controls">
                    <md-filled-tonal-icon-button
                        class="vp-btn-replay"
                        aria-label="เล่นซ้ำตั้งแต่ต้น"
                        type="button"
                    >
                        <span class="material-symbols-rounded">replay</span>
                    </md-filled-tonal-icon-button>
                    <md-fab
                        class="vp-btn-resume"
                        size="large"
                        variant="primary"
                        aria-label="เล่นต่อ"
                        type="button"
                    >
                        <span class="material-symbols-rounded play-symbols-size" slot="icon">play_arrow</span>
                    </md-fab>
                </div>
            </div>

            <!-- Progress bar (read-only) -->
            <div class="vp-progress-wrap" aria-hidden="true">
                <md-linear-progress
                    class="vp-progress"
                    value="0"
                    aria-label="ความคืบหน้าวิดีโอ"
                ></md-linear-progress>
            </div>
        </div>
    `;
}

function _esc(v) {
    return String(v ?? "")
        .replaceAll("&",  "&amp;")
        .replaceAll("<",  "&lt;")
        .replaceAll(">",  "&gt;")
        .replaceAll('"',  "&quot;")
        .replaceAll("'",  "&#39;");
}

// ---------------------------------------------------------------------------
// VideoPlayer class
// ---------------------------------------------------------------------------

export class VideoPlayer {

    // ── Static factory ───────────────────────────────────────────────────────

    /**
     * Mount a VideoPlayer inside the given container element.
     *
     * @param {HTMLElement} container  - Element to render the player into.
     * @param {object}      options
     * @param {string}      options.src          - Video URL.
     * @param {string}      [options.label='']   - Accessible label for the video.
     * @returns {VideoPlayer}          The player instance (call .destroy() to clean up).
     */
    static mount(container, { src, label = "" } = {}) {
        const player = new VideoPlayer(container, { src, label });
        player._mount();
        return player;
    }

    // ── Constructor ──────────────────────────────────────────────────────────

    /** @private — use VideoPlayer.mount() */
    constructor(container, { src, label }) {
        this._container  = container;
        this._src        = src;
        this._label      = label;
        this._root       = null;
        this._hasStarted = false;
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /** Start / resume playback. */
    play() {
        this._play();
    }

    /** Pause playback. */
    pause() {
        if (this._video) this._video.pause();
    }

    /** Restart from the beginning. */
    replay() {
        this._replay();
    }

    /** Whether the video is currently paused. */
    get paused() {
        return this._video?.paused ?? true;
    }

    /** Current playback position in seconds. */
    get currentTime() {
        return this._video?.currentTime ?? 0;
    }

    /** Total duration in seconds (0 if not loaded yet). */
    get duration() {
        return this._video?.duration ?? 0;
    }

    /**
     * Register a callback for player events.
     * @param {'play'|'pause'|'ended'|'progress'} event
     * @param {Function} callback
     */
    on(event, callback) {
        this._listeners[event] = this._listeners[event] ?? [];
        this._listeners[event].push(callback);
        return this;
    }

    /**
     * Remove the player from the DOM and release resources.
     */
    destroy() {
        if (this._video) {
            this._video.pause();
            this._video.src = "";
            this._video.load();
        }
        this._root?.remove();
        this._root  = null;
        this._video = null;
        this._listeners = {};
    }

    // ── Internal mount ───────────────────────────────────────────────────────

    /** @private */
    _mount() {
        this._listeners = {};

        this._container.innerHTML = _buildPlayerHTML(this._src, this._label);
        this._root = this._container.querySelector(".vp-root");

        this._video        = this._root.querySelector(".vp-video");
        this._overlayInit  = this._root.querySelector(".vp-overlay--init");
        this._overlayPause = this._root.querySelector(".vp-overlay--paused");
        this._btnPlayInit  = this._root.querySelector(".vp-btn-play-init");
        this._btnResume    = this._root.querySelector(".vp-btn-resume");
        this._btnReplay    = this._root.querySelector(".vp-btn-replay");
        this._progress     = this._root.querySelector(".vp-progress");

        this._bindEvents();
    }

    /** @private */
    _bindEvents() {
        // Tap on stage → pause while playing
        this._root.addEventListener("click", (e) => {
            if (e.target.closest("md-fab, md-filled-tonal-icon-button")) return;
            if (!this._hasStarted || this._video.paused) return;
            this._video.pause();
        });

        // Control buttons
        this._btnPlayInit.addEventListener("click", () => this._play());
        this._btnResume.addEventListener("click",   () => this._play());
        this._btnReplay.addEventListener("click",   () => this._replay());

        // Video events
        this._video.addEventListener("timeupdate", () => {
            if (!this._video.duration) return;
            this._progress.value = this._video.currentTime / this._video.duration;
            this._emit("progress", this._video.currentTime / this._video.duration);
        });

        this._video.addEventListener("play", () => {
            this._hideAllOverlays();
            this._btnResume.style.display = "";
            this._emit("play");
        });

        this._video.addEventListener("pause", () => {
            if (!this._hasStarted) return;
            this._showPausedOverlay(!this._video.ended);
            this._emit("pause");
        });

        this._video.addEventListener("ended", () => {
            this._progress.value = 1;
            this._showPausedOverlay(false); // ended → hide resume btn
            this._emit("ended");
        });
    }

    // ── Playback helpers ─────────────────────────────────────────────────────

    /** @private */
    _play() {
        this._hasStarted = true;
        this._video.play();
        this._hideAllOverlays();
    }

    /** @private */
    _replay() {
        this._video.currentTime = 0;
        this._play();
    }

    // ── Overlay helpers ──────────────────────────────────────────────────────

    /** @private */
    _hideAllOverlays() {
        this._setVisible(this._overlayInit,  false);
        this._setVisible(this._overlayPause, false);
    }

    /**
     * @private
     * @param {boolean} showResume - true = show play+replay, false = replay only
     */
    _showPausedOverlay(showResume) {
        this._setVisible(this._overlayInit,  false);
        this._setVisible(this._overlayPause, true);
        this._btnResume.style.display = showResume ? "" : "none";
    }

    /** @private */
    _setVisible(el, visible) {
        el.classList.toggle("vp-hidden", !visible);
        el.setAttribute("aria-hidden", String(!visible));
    }

    // ── Event emitter ────────────────────────────────────────────────────────

    /** @private */
    _emit(event, ...args) {
        this._listeners[event]?.forEach((cb) => cb(...args));
    }
}
