import { EventBus } from "../core/EventBus.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export class MinigameHUD {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.element = null;
        this.scoreElement = null;
        this.timeElement = null;
        this.progressBar = null;
        
        this.state = {
            score: 0,
            level: options.level || "",
            timeLeft: options.timeLimit || 0,
            maxTime: options.timeLimit || 0,
            gameTitle: options.gameTitle || "เกมฝึกสมอง",
            showTimer: options.showTimer !== false,
            lives: options.lives !== undefined ? options.lives : null,
        };

        this.boundOnScore = this.onScoreUpdate.bind(this);
        this.boundOnLevel = this.onLevelUpdate.bind(this);
        this.boundOnTick = this.onTick.bind(this);
        this.boundOnTickProgress = this.onTickProgress.bind(this);
        this.boundOnLives = this.onLivesUpdate.bind(this);

        this.boundOnGameOver = this.onGameOver.bind(this);
        this.boundOnShow = this.show.bind(this);
        this.boundOnHide = this.hide.bind(this);
        this.boundOnMenuMode = this.menuMode.bind(this);
    }

    render() {
        const { gameTitle, score, level, timeLeft, maxTime, showTimer, lives } = this.state;
        const timePct = maxTime > 0 ? timeLeft / maxTime : 0;

        const container = document.createElement("div");
        container.className = "minigame-hud";
        container.classList.add(`minigame-hud--${this.options.gameSlug}`);
        const topbarStyleGames = [
            "zoo-feeder",
            "medicine-feeder",
            "zoo-detective",
            "context-clues",
            "symmetry-decor",
            "symmetry-decor-household",
            "postcard-reader",
            "fry-food",
        ];
        if (topbarStyleGames.includes(this.options.gameSlug)) {
            container.classList.add("minigame-hud--zoo-feeder");
        }
        let topbarHtml = "";
        if (topbarStyleGames.includes(this.options.gameSlug)) {
            const scoreLabelText = score;
            const iconSrc = "assets/icon_star.png";

            topbarHtml = `
                <md-icon-button id="hud-exit-button" aria-label="ออกจากเกม" class="minigame-hud__exit-btn">
                    <md-icon class="material-symbols-rounded">arrow_back</md-icon>
                </md-icon-button>
                <div class="minigame-hud__center-group">
                    <div class="minigame-hud__score-box">
                        <img src="${iconSrc}" class="minigame-hud__score-star" alt="icon" />
                        <span class="minigame-hud__score-text"><span id="hud-score">${scoreLabelText}</span></span>
                    </div>
                    <div class="minigame-hud__time-box">
                        <img src="assets/icon_time.png" class="minigame-hud__time-icon" alt="time" />
                        <span class="minigame-hud__time-text"><span id="hud-time-display">${formatTime(timeLeft)}</span></span>
                    </div>
                </div>
            `;
        } else {
            topbarHtml = `
                <div class="minigame-hud__left">
                    <md-icon-button id="hud-exit-button" aria-label="ออกจากเกม">
                        <md-icon class="material-symbols-rounded">arrow_back</md-icon>
                    </md-icon-button>
                    <div class="minigame-hud__title-group">
                        <h2 class="minigame-hud__title">${escapeHtml(gameTitle)}</h2>
                        <span class="minigame-hud__level" id="hud-level">${escapeHtml(level)}</span>
                    </div>
                </div>
                <div class="minigame-hud__right">
                    <div class="minigame-hud__stat" id="hud-lives-container" style="display: ${lives !== null ? 'flex' : 'none'}; align-items: center; gap: 4px; margin-right: 16px; color: #d32f2f;">
                        <md-icon class="material-symbols-rounded">favorite</md-icon>
                        <span class="minigame-hud__stat-value" id="hud-lives">${lives}</span>
                    </div>
                    <div class="minigame-hud__stat">
                        <span class="minigame-hud__stat-label">คะแนน</span>
                        <span class="minigame-hud__stat-value" id="hud-score">${score}</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="minigame-hud__topbar">
                ${topbarHtml}
            </div>
            
            ${showTimer ? `
                <div class="minigame-hud__timer-wrap">
                    <div class="minigame-hud__timer-label" id="hud-timer-text">${this.options.gameSlug === "postcard-reader" ? timeLeft + ' <span class="minigame-hud__timer-unit">วินาที</span>' : timeLeft + "s"}</div>
                    <md-linear-progress
                        id="hud-timer-progress"
                        class="minigame-hud__timer-bar"
                        value="${timePct}"
                    ></md-linear-progress>
                </div>
            ` : ""}
        `;

        this.element = container;
        this.scoreElement = container.querySelector("#hud-score");
        this.timeElement = container.querySelector("#hud-timer-text");
        this.timeDisplayElement = container.querySelector("#hud-time-display");
        this.progressBar = container.querySelector("#hud-timer-progress");
        this.timerWrap = container.querySelector(".minigame-hud__timer-wrap");

        container.querySelector("#hud-exit-button")?.addEventListener("click", () => {
            EventBus.emit('audio:play', 'ui:click');
            EventBus.emit("minigame:exit-request");
        });

        this.root.appendChild(container);
        this.initEvents();

        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                const topbar = this.element.querySelector(".minigame-hud__topbar");
                const centerGroup = this.element.querySelector(".minigame-hud__center-group");
                
                if (topbar && centerGroup) {
                    // Center group is 330px wide (150 + 30 + 150). Exit button needs ~70px on left.
                    // For perfect centering with a 25px safe space, we need (width - 330)/2 >= 78 => width >= 486px.
                    const minWidth = 486;
                    if (width < minWidth && width > 0) {
                        const ratio = width / minWidth;
                        centerGroup.style.transform = `scale(${ratio})`;
                        centerGroup.style.transformOrigin = "center center";
                    } else {
                        centerGroup.style.transform = "";
                    }
                }
            }
        });
        if (this.root) {
            this.resizeObserver.observe(this.root);
        }
    }

    initEvents() {
        EventBus.on("minigame:score", this.boundOnScore);
        EventBus.on("minigame:level", this.boundOnLevel);
        EventBus.on("minigame:tick", this.boundOnTick);
        EventBus.on("minigame:tick-progress", this.boundOnTickProgress);
        EventBus.on("minigame:lives", this.boundOnLives);
        EventBus.on("minigame:game-over", this.boundOnGameOver);
        EventBus.on("minigame:show-hud", this.boundOnShow);
        EventBus.on("minigame:hide-hud", this.boundOnHide);
        EventBus.on("minigame:menu-mode", this.boundOnMenuMode);
        
        this.boundOnShowTimer = () => { if (this.timerWrap) this.timerWrap.style.display = ""; };
        this.boundOnHideTimer = () => { if (this.timerWrap) this.timerWrap.style.display = "none"; };
        EventBus.on("minigame:show-timer", this.boundOnShowTimer);
        EventBus.on("minigame:hide-timer", this.boundOnHideTimer);
    }

    onScoreUpdate({ score }) {
        this.state.score = score;
        if (this.scoreElement) {
            this.scoreElement.textContent = score;
            this.scoreElement.classList.remove("pulse", "pop-animation");
            // Force a reflow to reset the animation instantly
            void this.scoreElement.offsetWidth;
            this.scoreElement.classList.add("pop-animation");
        }
    }

    onLevelUpdate({ level }) {
        this.state.level = level;
        const levelEl = this.element.querySelector("#hud-level");
        if (levelEl) {
            levelEl.textContent = level;
        }
    }

    onLivesUpdate({ lives }) {
        this.state.lives = lives;
        if (!this.livesContainer) {
            this.livesContainer = this.element?.querySelector("#hud-lives-container");
            this.livesElement = this.element?.querySelector("#hud-lives");
        }
        if (this.livesContainer && this.livesElement) {
            this.livesContainer.style.display = 'flex';
            this.livesElement.textContent = lives;
            this.livesElement.classList.add("pulse");
            setTimeout(() => this.livesElement.classList.remove("pulse"), 300);
        }
    }


    onTick({ timeLeft, maxTime, updateProgress = true }) {
        this.state.timeLeft = timeLeft;
        if (maxTime !== undefined) {
            this.state.maxTime = maxTime;
        }
        if (this.timeElement && this.options.gameSlug !== "postcard-reader") {
            this.timeElement.textContent = `${timeLeft}s`;
        }
        if (this.timeDisplayElement) {
            this.timeDisplayElement.textContent = formatTime(timeLeft);
        }
        if (this.progressBar && updateProgress) {
            const pct = this.state.maxTime > 0 ? timeLeft / this.state.maxTime : 0;
            this.progressBar.value = pct;
            
            if (pct < 0.25) {
                this.progressBar.classList.add("warning");
            }
        }
    }

    onTickProgress({ timeLeft, maxTime }) {
        if (this.timeElement) {
            if (this.options.gameSlug === "postcard-reader") {
                this.timeElement.innerHTML = `${timeLeft} <span class="minigame-hud__timer-unit">วินาที</span>`;
            } else {
                this.timeElement.textContent = `${timeLeft}s`;
            }
        }
        if (this.progressBar) {
            const pct = maxTime > 0 ? timeLeft / maxTime : 0;
            this.progressBar.value = pct;
            
            if (pct < 0.25) {
                this.progressBar.classList.add("warning");
            } else {
                this.progressBar.classList.remove("warning");
            }
        }
    }

    onGameOver(data) {
        // Handle game over (maybe show result panel)
    }

    show() {
        if (this.element) {
            this.element.style.display = "";
            const topbar = this.element.querySelector(".minigame-hud__topbar");
            if (topbar) {
                topbar.style.background = "";
                topbar.style.boxShadow = "";
                topbar.style.pointerEvents = "auto";
            }
            const titleGroup = this.element.querySelector(".minigame-hud__title-group");
            if (titleGroup) titleGroup.style.display = "";
            
            const rightGroup = this.element.querySelector(".minigame-hud__right");
            if (rightGroup) rightGroup.style.display = "";
            
            const timerWrap = this.element.querySelector(".minigame-hud__timer-wrap");
            if (timerWrap) timerWrap.style.display = "";
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = "none";
        }
    }

    menuMode() {
        if (this.element) {
            this.element.style.display = "";
            const topbar = this.element.querySelector(".minigame-hud__topbar");
            if (topbar) {
                topbar.style.background = "transparent";
                topbar.style.boxShadow = "none";
                topbar.style.pointerEvents = "none"; // Let clicks pass through background
            }
            
            // Re-enable pointer events for the back button so it remains clickable
            const exitBtn = this.element.querySelector("#hud-exit-button");
            if (exitBtn) exitBtn.style.pointerEvents = "auto";

            const titleGroup = this.element.querySelector(".minigame-hud__title-group");
            if (titleGroup) titleGroup.style.display = "none";
            
            const rightGroup = this.element.querySelector(".minigame-hud__right");
            if (rightGroup) rightGroup.style.display = "none";
            
            const timerWrap = this.element.querySelector(".minigame-hud__timer-wrap");
            if (timerWrap) timerWrap.style.display = "none";
        }
    }

    destroy() {
        EventBus.off("minigame:score", this.boundOnScore);
        EventBus.off("minigame:level", this.boundOnLevel);
        EventBus.off("minigame:tick", this.boundOnTick);
        EventBus.off("minigame:tick-progress", this.boundOnTickProgress);
        EventBus.off("minigame:lives", this.boundOnLives);
        EventBus.off("minigame:game-over", this.boundOnGameOver);
        EventBus.off("minigame:show-hud", this.boundOnShow);
        EventBus.off("minigame:hide-hud", this.boundOnHide);
        EventBus.off("minigame:menu-mode", this.boundOnMenuMode);
        EventBus.off("minigame:show-timer", this.boundOnShowTimer);
        EventBus.off("minigame:hide-timer", this.boundOnHideTimer);
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        this.element?.remove();
    }

}
