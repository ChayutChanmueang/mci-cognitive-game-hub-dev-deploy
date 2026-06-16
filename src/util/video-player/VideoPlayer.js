/**
 * VideoPlayer.js
 *
 * A self-contained, embeddable video player component.
 * Manages its own UI (overlays, volume bar, progress bar) inside any container element.
 * Does NOT create modals, backdrops, or popup wrappers — that is the caller's responsibility.
 *
 * Features:
 *  - No native browser controls (prevents seeking/skipping)
 *  - Play / Pause via tap on the player surface
 *  - Replay button
 *  - Volume step-up / step-down buttons + mute toggle
 *  - Read-only progress bar (visual only, pointer-events: none)
 *  - Material Web 3 components for controls
 *
 * Usage:
 *   import { VideoPlayer } from './video-player/VideoPlayer.js';
 *
 *   const player = VideoPlayer.mount(containerEl, { src: 'https://…/video.mp4' });
 *
 *   player.play();
 *   player.pause();
 *   player.replay();
 *   player.setVolume(0.5);   // 0.0 – 1.0
 *   player.setMuted(true);
 *   player.destroy();
 *
 *   // Events: 'play', 'pause', 'ended', 'progress', 'volume-changed', 'mute-changed', 'destroy'
 *   player.on('volume-changed', (v) => console.log(v));
 *
 * Material Web components required:
 *   <md-fab>, <md-filled-tonal-icon-button>, <md-linear-progress>, <md-icon>
 */

const VOLUME_STEP = 0.25;

// ---------------------------------------------------------------------------
// HTML template
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

            <!-- Overlay: buffering / loading -->
            <div class="vp-overlay vp-overlay--loading vp-hidden" aria-hidden="true" role="status" aria-live="polite">
                <div class="vp-loading-indicator">
                    <md-circular-progress
                        indeterminate
                        four-color
                        aria-label="กำลังโหลดวิดีโอ"
                    ></md-circular-progress>
                    <span class="vp-loading-text">กำลังโหลดวิดีโอ...</span>
                </div>
            </div>

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

            <!-- Volume controls (always visible, top-right corner) -->
            <div class="vp-volume-bar" aria-label="ควบคุมเสียง">
                <!-- vol-down / vol-up hidden until required
                <md-filled-tonal-icon-button class="vp-btn-vol-down" aria-label="ลดเสียง" type="button">
                    <span class="material-symbols-rounded">remove</span>
                </md-filled-tonal-icon-button>
                -->
                <md-filled-tonal-icon-button class="vp-btn-mute" aria-label="ปิดเสียง" type="button">
                    <span class="material-symbols-rounded">volume_up</span>
                </md-filled-tonal-icon-button>
                <!-- vol-down / vol-up hidden until required
                <md-filled-tonal-icon-button class="vp-btn-vol-up" aria-label="เพิ่มเสียง" type="button">
                    <span class="material-symbols-rounded">add</span>
                </md-filled-tonal-icon-button>
                -->
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
     * @param {HTMLElement} container
     * @param {object}      options
     * @param {string}      options.src
     * @param {string}      [options.label='']
     * @returns {VideoPlayer}
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
        this._isLoading  = false;
        this._volume     = 1.0;
        this._muted      = false;
    }

    // ── Public playback API ──────────────────────────────────────────────────

    play()   { this._play(); }
    pause()  { if (this._video) this._video.pause(); }
    replay() { this._replay(); }

    get paused()      { return this._video?.paused ?? true; }
    get currentTime() { return this._video?.currentTime ?? 0; }
    get duration()    { return this._video?.duration ?? 0; }

    // ── Public volume API ────────────────────────────────────────────────────

    /**
     * Set volume (0.0 – 1.0). Does NOT emit 'volume-changed' —
     * intended for external sync (e.g. VideoManager).
     */
    setVolume(volume) {
        this._volume = Math.max(0, Math.min(1, Number(volume) || 0));
        if (this._video) this._video.volume = this._volume;
        this._updateVolumeIcon();
    }

    /**
     * Set muted state. Does NOT emit 'mute-changed' —
     * intended for external sync (e.g. VideoManager).
     */
    setMuted(muted) {
        this._muted = Boolean(muted);
        if (this._video) this._video.muted = this._muted;
        this._updateVolumeIcon();
    }

    getVolume() { return this._volume; }
    isMuted()   { return this._muted; }

    // ── Events ───────────────────────────────────────────────────────────────

    /**
     * @param {'play'|'pause'|'ended'|'progress'|'volume-changed'|'mute-changed'|'destroy'} event
     * @param {Function} callback
     */
    on(event, callback) {
        this._listeners[event] = this._listeners[event] ?? [];
        this._listeners[event].push(callback);
        return this;
    }

    // ── Destroy ──────────────────────────────────────────────────────────────

    destroy() {
        this._emit('destroy');
        if (this._video) {
            this._video.pause();
            this._video.src = "";
            this._video.load();
        }
        this._root?.remove();
        this._root      = null;
        this._video     = null;
        this._listeners = {};
    }

    // ── Internal mount ───────────────────────────────────────────────────────

    /** @private */
    _mount() {
        this._listeners = {};

        this._container.innerHTML = _buildPlayerHTML(this._src, this._label);
        this._root = this._container.querySelector(".vp-root");

        this._video        = this._root.querySelector(".vp-video");
        this._overlayLoad  = this._root.querySelector(".vp-overlay--loading");
        this._overlayInit  = this._root.querySelector(".vp-overlay--init");
        this._overlayPause = this._root.querySelector(".vp-overlay--paused");
        this._btnPlayInit  = this._root.querySelector(".vp-btn-play-init");
        this._btnResume    = this._root.querySelector(".vp-btn-resume");
        this._btnReplay    = this._root.querySelector(".vp-btn-replay");
        this._btnVolDown   = this._root.querySelector(".vp-btn-vol-down");
        this._btnMute      = this._root.querySelector(".vp-btn-mute");
        this._btnMuteIcon  = this._btnMute?.querySelector("span");
        this._btnVolUp     = this._root.querySelector(".vp-btn-vol-up");
        this._progress     = this._root.querySelector(".vp-progress");

        this._video.volume = this._volume;
        this._video.muted  = this._muted;

        this._bindEvents();
    }

    /** @private */
    _bindEvents() {
        // Tap on stage → pause while playing (ignore control buttons)
        this._root.addEventListener("click", (e) => {
            if (e.target.closest("md-fab, md-filled-tonal-icon-button")) return;
            if (!this._hasStarted || this._video.paused) return;
            this._video.pause();
        });

        // Playback controls
        this._btnPlayInit.addEventListener("click", () => this._play());
        this._btnResume.addEventListener("click",   () => this._play());
        this._btnReplay.addEventListener("click",   () => this._replay());

        // Volume controls — user-initiated, so emit events
        // vol-down / vol-up commented out in HTML until required
        this._btnVolDown?.addEventListener("click", () => this._userSetVolume(this._volume - VOLUME_STEP));
        this._btnVolUp?.addEventListener("click",   () => this._userSetVolume(this._volume + VOLUME_STEP));
        this._btnMute.addEventListener("click",     () => this._userToggleMute());

        // Video events
        this._video.addEventListener("timeupdate", () => {
            if (!this._video.duration) return;
            this._progress.value = this._video.currentTime / this._video.duration;
            this._emit("progress", this._video.currentTime / this._video.duration);
        });

        this._video.addEventListener("loadstart", () => {
            if (!this._hasStarted) return;
            this._showLoadingOverlay();
        });

        this._video.addEventListener("waiting", () => {
            if (!this._hasStarted || this._video.paused || this._video.ended) return;
            this._showLoadingOverlay();
        });

        this._video.addEventListener("stalled", () => {
            if (!this._hasStarted || this._video.paused || this._video.ended) return;
            this._showLoadingOverlay();
        });

        this._video.addEventListener("canplay", () => {
            if (!this._hasStarted || this._video.paused || this._video.ended) return;
            this._hideAllOverlays();
        });

        this._video.addEventListener("playing", () => {
            this._hideAllOverlays();
        });

        this._video.addEventListener("play", () => {
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
            this._showPausedOverlay(false);
            this._emit("ended");
        });
    }

    // ── Volume helpers ───────────────────────────────────────────────────────

    /** @private — user action: update state + emit so VideoManager can sync others */
    _userSetVolume(volume) {
        this.setVolume(volume);
        this._emit("volume-changed", this._volume);
    }

    /** @private — user action: toggle mute + emit */
    _userToggleMute() {
        this.setMuted(!this._muted);
        this._emit("mute-changed", this._muted);
    }

    /** @private — update mute button icon to reflect current state */
    _updateVolumeIcon() {
        if (!this._btnMuteIcon) return;
        if (this._muted) {
            this._btnMuteIcon.textContent = "volume_off";
            this._btnMute.setAttribute("aria-label", "เปิดเสียง");
        } else if (this._volume === 0) {
            this._btnMuteIcon.textContent = "volume_mute";
            this._btnMute.setAttribute("aria-label", "ปิดเสียง");
        } else if (this._volume <= 0.5) {
            this._btnMuteIcon.textContent = "volume_down";
            this._btnMute.setAttribute("aria-label", "ปิดเสียง");
        } else {
            this._btnMuteIcon.textContent = "volume_up";
            this._btnMute.setAttribute("aria-label", "ปิดเสียง");
        }
    }

    // ── Playback helpers ─────────────────────────────────────────────────────

    /** @private */
    _play() {
        this._hasStarted = true;
        this._showLoadingOverlay();
        const playRequest = this._video.play();

        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(() => {
                this._hideLoadingOverlay();
                if (this._hasStarted) {
                    this._showPausedOverlay(true);
                } else {
                    this._showInitialOverlay();
                }
            });
        }
    }

    /** @private */
    _replay() {
        this._video.currentTime = 0;
        this._play();
    }

    // ── Overlay helpers ──────────────────────────────────────────────────────

    /** @private */
    _hideAllOverlays() {
        this._hideLoadingOverlay();
        this._setVisible(this._overlayInit,  false);
        this._setVisible(this._overlayPause, false);
    }

    /** @private */
    _showInitialOverlay() {
        this._hideLoadingOverlay();
        this._setVisible(this._overlayInit,  true);
        this._setVisible(this._overlayPause, false);
    }

    /** @private */
    _showPausedOverlay(showResume) {
        this._hideLoadingOverlay();
        this._setVisible(this._overlayInit,   false);
        this._setVisible(this._overlayPause,  true);
        this._btnResume.style.display = showResume ? "" : "none";
    }

    /** @private */
    _showLoadingOverlay() {
        this._isLoading = true;
        this._setVisible(this._overlayLoad,  true);
        this._setVisible(this._overlayInit,  false);
        this._setVisible(this._overlayPause, false);
    }

    /** @private */
    _hideLoadingOverlay() {
        this._isLoading = false;
        this._setVisible(this._overlayLoad, false);
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
