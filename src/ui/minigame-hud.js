import { EventBus } from "../core/EventBus.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
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
        };

        this.boundOnScore = this.onScoreUpdate.bind(this);
        this.boundOnLevel = this.onLevelUpdate.bind(this);
        this.boundOnTick = this.onTick.bind(this);

        this.boundOnGameOver = this.onGameOver.bind(this);
    }

    render() {
        const { gameTitle, score, level, timeLeft, maxTime } = this.state;
        const timePct = maxTime > 0 ? timeLeft / maxTime : 0;

        const container = document.createElement("div");
        container.className = "minigame-hud";
        container.innerHTML = `
            <div class="minigame-hud__topbar">
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

                    <div class="minigame-hud__stat">
                        <span class="minigame-hud__stat-label">คะแนน</span>
                        <span class="minigame-hud__stat-value" id="hud-score">${score}</span>
                    </div>
                </div>
            </div>
            
            <div class="minigame-hud__timer-wrap">
                <div class="minigame-hud__timer-label" id="hud-timer-text">${timeLeft}s</div>
                <md-linear-progress 
                    id="hud-timer-progress"
                    class="minigame-hud__timer-bar" 
                    value="${timePct}"
                ></md-linear-progress>
            </div>
        `;

        this.element = container;
        this.scoreElement = container.querySelector("#hud-score");
        this.timeElement = container.querySelector("#hud-timer-text");
        this.progressBar = container.querySelector("#hud-timer-progress");

        container.querySelector("#hud-exit-button")?.addEventListener("click", () => {
            EventBus.emit("minigame:exit-request");
        });

        this.root.appendChild(container);
        this.initEvents();
    }

    initEvents() {
        EventBus.on("minigame:score", this.boundOnScore);
        EventBus.on("minigame:level", this.boundOnLevel);
        EventBus.on("minigame:tick", this.boundOnTick);
        EventBus.on("minigame:game-over", this.boundOnGameOver);
    }

    onScoreUpdate({ score }) {
        this.state.score = score;
        if (this.scoreElement) {
            this.scoreElement.textContent = score;
            this.scoreElement.classList.add("pulse");
            setTimeout(() => this.scoreElement.classList.remove("pulse"), 300);
        }
    }

    onLevelUpdate({ level }) {
        this.state.level = level;
        const levelEl = this.element.querySelector("#hud-level");
        if (levelEl) {
            levelEl.textContent = level;
        }
    }


    onTick({ timeLeft }) {
        this.state.timeLeft = timeLeft;
        if (this.timeElement) {
            this.timeElement.textContent = `${timeLeft}s`;
        }
        if (this.progressBar) {
            const pct = this.state.maxTime > 0 ? timeLeft / this.state.maxTime : 0;
            this.progressBar.value = pct;
            
            if (pct < 0.25) {
                this.progressBar.classList.add("warning");
            }
        }
    }

    onGameOver(data) {
        // Handle game over (maybe show result panel)
    }

    destroy() {
        EventBus.off("minigame:score", this.boundOnScore);
        EventBus.off("minigame:level", this.boundOnLevel);
        EventBus.off("minigame:tick", this.boundOnTick);
        EventBus.off("minigame:game-over", this.boundOnGameOver);
        this.element?.remove();
    }

}
