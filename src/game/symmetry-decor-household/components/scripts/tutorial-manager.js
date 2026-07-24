import Phaser from "phaser";
import TutorialHand from "./tutorial-hand";
import { TutorialConfig, getDifficultyLevelNumber } from "../../constants";
import SessionStorageManager from "../../../../core/session-storage-manager";

export default class TutorialManager {
    constructor(scene, difficulty, grid, levelData, solution, symmetryType) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.grid = grid;
        this.levelData = levelData;
        this.solution = solution;
        this.symmetryType = symmetryType;

        this.config = TutorialConfig[this.difficulty];
        this.tutorialHand = null;
        this.idleTimer = null;
        this.isActive = true;

        // Ensure config exists
        if (!this.config) {
            console.warn(`TutorialManager: No config found for difficulty ${this.difficulty}`);
            this.isActive = false;
        }
        
        // Listeners bindings
        this.onPlayerInteraction = this.onPlayerInteraction.bind(this);
        this.dismissTutorial = this.dismissTutorial.bind(this);
    }

    init() {
        if (!this.isActive) return;

        // Validate config constraints
        if (this.config.showOnFirstStart && this.config.showOnEveryStart) {
            console.warn("TutorialManager: Both showOnFirstStart and showOnEveryStart are true. Defaulting to showOnEveryStart.");
        }
        if (!this.config.dismissOnDrag && !this.config.dismissOnTap) {
            console.warn("TutorialManager: Both dismissOnDrag and dismissOnTap are false. Forcing dismissOnDrag = true.");
            this.config.dismissOnDrag = true;
        }

        const levelNumber = getDifficultyLevelNumber(this.difficulty);
        const storageKey = `symmetry_decor_tutorial_shown_${levelNumber}`;
        const hasShownBefore = sessionStorage.getItem(storageKey) === 'true';

        let shouldShowNow = false;

        if (this.config.showOnEveryStart && !hasShownBefore) {
            shouldShowNow = true;
            sessionStorage.setItem(storageKey, 'true');
        } else if (this.config.showOnFirstStart && !hasShownBefore) {
            shouldShowNow = true;
            localStorage.setItem(storageKey, 'true');
        }

        // We need to track interaction even before tutorial is shown to reset the idle timer
        if (this.config.showOnIdle) {
            this._registerGlobalInteractionListeners();
        }

        if (shouldShowNow) {
            // Slight delay so the scene is fully rendered
            this.scene.time.delayedCall(500, () => {
                this.showTutorial();
            });
        } else if (this.config.showOnIdle) {
            this.startIdleTimer();
        }
    }

    _registerGlobalInteractionListeners() {
        this.scene.input.on('pointerdown', this.onPlayerInteraction);
        this.scene.input.on('pointermove', this.onPlayerInteraction);
        this.scene.input.on('dragstart', this.onPlayerInteraction);
    }

    _unregisterGlobalInteractionListeners() {
        this.scene.input.off('pointerdown', this.onPlayerInteraction);
        this.scene.input.off('pointermove', this.onPlayerInteraction);
        this.scene.input.off('dragstart', this.onPlayerInteraction);
    }

    startIdleTimer() {
        if (!this.isActive || !this.config.showOnIdle) return;

        this.clearIdleTimer();
        this.idleTimer = this.scene.time.delayedCall(this.config.idleTimeoutMs, () => {
            if (this.isActive) {
                this.showTutorial();
            }
        });
    }

    clearIdleTimer() {
        if (this.idleTimer) {
            this.idleTimer.remove();
            this.idleTimer = null;
        }
    }

    resetIdleTimer() {
        this.startIdleTimer();
    }

    onPlayerInteraction() {
        if (this.tutorialHand && this.tutorialHand.isVisible()) {
            // Handled by dismiss listeners instead if they are active
            return;
        }
        this.resetIdleTimer();
    }

    showTutorial() {
        if (!this.isActive) return;

        // Clear timer so it doesn't fire while tutorial is showing
        this.clearIdleTimer();

        if (!this.tutorialHand) {
            this.tutorialHand = new TutorialHand(
                this.scene, 
                this.grid, 
                this.levelData, 
                this.solution, 
                this.symmetryType, 
                this.config
            );
        }

        this.tutorialHand.show();
        this._registerDismissListeners();
    }

    dismissTutorial() {
        if (this.tutorialHand && this.tutorialHand.isVisible()) {
            this.tutorialHand.dismiss();
            this._unregisterDismissListeners();
            this.resetIdleTimer();
        }
    }

    _registerDismissListeners() {
        if (this.config.dismissOnDrag) {
            this.scene.input.on('dragstart', this.dismissTutorial);
        }
        if (this.config.dismissOnTap) {
            this.scene.input.on('pointerdown', this.dismissTutorial);
        }
    }

    _unregisterDismissListeners() {
        this.scene.input.off('dragstart', this.dismissTutorial);
        this.scene.input.off('pointerdown', this.dismissTutorial);
    }

    destroy() {
        this.isActive = false;
        this.clearIdleTimer();
        this._unregisterGlobalInteractionListeners();
        this._unregisterDismissListeners();
        if (this.tutorialHand) {
            this.tutorialHand.destroy();
            this.tutorialHand = null;
        }
    }
}
