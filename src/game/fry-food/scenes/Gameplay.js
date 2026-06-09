import Phaser from 'phaser';
import { EventBus } from '../../../core/EventBus.js';
import AccelerometerManager from '../../../core/accelerometer-manager.js';
import { AccelerometerSettings, GameOverSetting } from '../constants.js';
import { showLevelCompleteEffect } from '../../common/ui-elements/scripts/level-complete-effect.js';

/**
 * Food configuration for the fry-food minigame.
 * Each entry defines a food type with its sprite frames and level mapping.
 *
 * - `name`: display / identifier name
 * - `frameCount`: how many sprite frames exist on disk
 * - `folder`: sub-path under `assets/fry-food/`
 * - `prefix`: filename prefix (e.g. `egg` → `egg_1.png`)
 * - `levelToFrame(level)`: returns the 1-based frame index for a given cook level (1-4).
 *   Foods with 4 frames map 1:1.  Foods with 2 frames double up (2 levels per frame).
 */
const FOOD_CONFIGS = [
    {
        name: 'egg',
        frameCount: 4,
        folder: 'egg',
        prefix: 'egg',
        levelToFrame: (level) => Math.min(level, 4),
    },
    {
        name: 'fried_rice',
        frameCount: 2,
        folder: 'fried_rice',
        prefix: 'fried_rice',
        levelToFrame: (level) => (level <= 2 ? 1 : 2),
    },
    {
        name: 'pancake',
        frameCount: 4,
        folder: 'pancake',
        prefix: 'pancake',
        levelToFrame: (level) => Math.min(level, 4),
    },
    {
        name: 'okonomiyaki',
        frameCount: 2,
        folder: 'okonomiyaki',
        prefix: 'okonomiyaki',
        levelToFrame: (level) => (level <= 2 ? 1 : 2),
    },
];

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super('fry-food-gameplay-scene');
    }

    preload() {
        // Preload gameplay assets here
        this.load.image('fry-food-bg', 'assets/fry-food/background.png');
        this.load.image('fry-food-pan', 'assets/fry-food/pan.png');
        this.load.image('fry-food-mortar', 'assets/fry-food/mortar.png');
        this.load.image('bottle-4', 'assets/fry-food/bottle_4.png');
        this.load.image('bottle-5', 'assets/fry-food/bottle_5.png');
        this.load.image('bottle-6', 'assets/fry-food/bottle_6.png');
        this.load.image('fry-food-plant', 'assets/fry-food/plant.png');
        this.load.image('fry-food-tray', 'assets/fry-food/tray.png');

        // Pick a random food for this session
        this._foodConfig = Phaser.Utils.Array.GetRandom(FOOD_CONFIGS);

        // Load only the sprites for the chosen food
        const cfg = this._foodConfig;
        for (let i = 1; i <= cfg.frameCount; i++) {
            this.load.image(
                `${cfg.name}-${i}`,
                `assets/fry-food/${cfg.folder}/${cfg.prefix}_${i}.png`
            );
        }
    }

    create(data) {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        // -- Background -----------------------------------------------------
        const bg = this.add.image(cx, cy, 'fry-food-bg');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // -- Environment ----------------------------------------------------
        const mortar = this.add.image(-180, -180, 'fry-food-mortar').setOrigin(0, 0);
        mortar.setScale(3.25);
        
        const plant = this.add.image(width + 205, -220, 'fry-food-plant').setOrigin(1, 0);
        plant.setScale(3);

        const tray = this.add.image(width + 150, 220, 'fry-food-tray').setOrigin(1, 0);
        tray.setScale(2.15);
        tray.setAngle(15);

        // -- Bottles --------------------------------------------------------
        // The user requested bottle 6, 4, 5 order
        const b6 = this.add.image(cx - 200, 100, 'bottle-6').setOrigin(0.5, 0);
        b6.setScale(1.25);
        const b4 = this.add.image(cx - 125, -80, 'bottle-4').setOrigin(0.5, 0);
        b4.setScale(2.5);
        const b5 = this.add.image(cx + 50, -20, 'bottle-5').setOrigin(0.5, 0);
        b5.setScale(2.5);

        // -- State ----------------------------------------------------------
        this._gameState = 'COOKING'; // 'COOKING', 'READY', 'FLIPPING'
        this._cookTimer = null;
        this._flipInitiated = false; // tracked when device tilted forward past threshold
        this._startBetaAngle = 0;    // Baseline angle captured when smoke appears
        this._cookLevel = 0;         // Tracks how many times it was flipped
        this._flipThresholdBeta = AccelerometerSettings.flipThresholdBeta; // dynamic threshold for designer

        // -- Show DOM HUD (zoo-feeder top bar style) -------------------------
        this.score = 0;
        this.gameTime = 180;
        EventBus.emit('minigame:show-hud');
        EventBus.emit('minigame:score', { score: this.score });
        EventBus.emit('minigame:tick', { timeLeft: this.gameTime, maxTime: this.gameTime, updateProgress: false });
        this._startTimer(this.gameTime);

        // -- Draw frying pan ------------------------------------------------
        this._createPan(cx, cy);

        // -- Place a test food item on the pan ------------------------------
        this._createFood(cx, cy);

        // -- Create Smoke Visuals -------------------------------------------
        this._createSmoke(cx, cy);

        // -- Create Flip Prompt ---------------------------------------------
        this._createFlipPrompt(cx, height);

        // -- Create Progress Bar Icon ---------------------------------------
        this._createProgressBarIcon();

        // -- Debug text overlay ---------------------------------------------
        // this._createDebugOverlay();

        // -- Designer Menu --------------------------------------------------
        // this._createDesignerMenu();

        // -- Start accelerometer --------------------------------------------
        this._initAccelerometer();

        // -- Start Game Loop ------------------------------------------------
        this._startCooking();

        // -- Cleanup on scene shutdown --------------------------------------
        this.events.once('shutdown', () => {
            AccelerometerManager.stop();
            this._removeIOSButton();
            this._removeDesignerMenu();
            if (this._cookTimer) {
                this._cookTimer.remove();
            }
            if (this.countdownTimer) {
                this.countdownTimer.remove();
            }
            if (this._flipPromptContainer && typeof this._flipPromptContainer.destroy === 'function') {
                this._flipPromptContainer.destroy();
            }
            if (this._smokeDom && typeof this._smokeDom.destroy === 'function') {
                this._smokeDom.destroy();
            }
            if (this._progressBarIcon && this._progressBarIcon.parentNode) {
                this._progressBarIcon.parentNode.removeChild(this._progressBarIcon);
                this._progressBarIcon = null;
            }

            // Exit fullscreen if running in a browser
            const isBrowser = !window.matchMedia('(display-mode: standalone)').matches;
            if (isBrowser) {
                if (this.scale && this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                }
                if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
                if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                    screen.orientation.unlock();
                }
            }
        });
    }

    update(time, delta) {
        const settings = AccelerometerSettings;
        const orientation = AccelerometerManager.getOrientation();
        const accel = AccelerometerManager.getAcceleration();

        // -- Beta: forward/backward tilt ------------------------------------
        // beta = 0 when device is flat (face-up) = pan perfectly level.
        // Tilting forward (top away from you) → positive beta
        let rawBeta = orientation.beta;
        if (Math.abs(rawBeta) < settings.deadZone) {
            rawBeta = 0;
        }

        // -- Gesture Recognition: Flip --------------------------------------
        if (this._gameState === 'READY') {
            const targetBeta = this._startBetaAngle + this._flipThresholdBeta;

            // Player tilts phone up/forward past the relative threshold
            if (rawBeta > targetBeta) {
                this._flipInitiated = true;
            }
            // Player brings phone back down after tilting up past the threshold
            else if (this._flipInitiated && rawBeta < targetBeta) {
                this._executeFlip();
            }
        } else {
            // Reset if they aren't ready
            this._flipInitiated = false;
        }

        // -- Update debug overlay -------------------------------------------
        this._updateDebugText(orientation, accel);

        // -- Update progress bar --------------------------------------------
        if (this._gameState === 'COOKING' && this._cookTimer) {
            if (time - (this._lastProgressUpdate || 0) > 100) {
                this._lastProgressUpdate = time;
                const elapsed = this._cookTimer.getElapsed();
                const total = this._cookTimer.delay;
                let pct = elapsed / total;
                pct = Phaser.Math.Clamp(pct, 0, 1);
                EventBus.emit('minigame:tick-progress', { timeLeft: elapsed, maxTime: total });
                this._updateProgressBarIcon(pct);
            }
        } else if (this._gameState === 'READY') {
            if (this._lastProgressUpdate !== -1) {
                this._lastProgressUpdate = -1;
                EventBus.emit('minigame:tick-progress', { timeLeft: 1, maxTime: 1 });
                this._updateProgressBarIcon(1);
            }
        } else if (this._gameState === 'FLIPPING') {
            if (this._lastProgressUpdate !== -2) {
                this._lastProgressUpdate = -2;
                // Don't emit minigame:tick-progress here — it would set
                // progressBar.value via the HUD handler and trigger the
                // shadow-DOM transition before our instant-reset can act.
                this._updateProgressBarIcon(0, true);
            }
        }

        // -- Tilt food on pan -----------------------------------------------
        // During COOKING, tilt acts as a force that accelerates the food
        // across the pan (like a ball on a tilted surface). Leveling the
        // phone applies friction but the food stays where it slid to.
        // When READY or FLIPPING the food smoothly returns to center.
        if (this._food) {
            const TILT_MAX_PX = 120;      // max offset from center
            const ACCEL_SCALE = 0.012;    // tilt-to-acceleration factor
            const FRICTION    = 0.92;     // velocity damping per frame
            const RETURN_LERP = 0.08;     // speed of return-to-center

            if (this._foodBaseX === undefined) {
                this._foodBaseX = this._food.x;
                this._foodBaseY = this._food.y;
                this._foodVelX  = 0;
                this._foodVelY  = 0;
            }

            if (this._gameState === 'COOKING') {
                if (this._slideBaseGamma === undefined) {
                    this._slideBaseGamma = orientation.gamma || 0;
                    this._slideBaseBeta = orientation.beta || 0;
                }

                let deltaGamma = (orientation.gamma || 0) - this._slideBaseGamma;
                let deltaBeta = (orientation.beta || 0) - this._slideBaseBeta;

                if (Math.abs(deltaGamma) < settings.deadZone) deltaGamma = 0;
                if (Math.abs(deltaBeta) < settings.deadZone) deltaBeta = 0;

                // Tilt angle → acceleration
                this._foodVelX += deltaGamma * ACCEL_SCALE;
                this._foodVelY += deltaBeta * ACCEL_SCALE;

                // Apply friction so food slows down when phone is level
                this._foodVelX *= FRICTION;
                this._foodVelY *= FRICTION;

                // Update position, clamped to a circular area like the pan
                let offsetX = (this._food.x - this._foodBaseX) + this._foodVelX;
                let offsetY = (this._food.y - this._foodBaseY) + this._foodVelY;
                const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
                if (dist > TILT_MAX_PX) {
                    const scale = TILT_MAX_PX / dist;
                    offsetX *= scale;
                    offsetY *= scale;
                    // Kill velocity along the edge so the food doesn't "push" against the rim
                    this._foodVelX *= 0.3;
                    this._foodVelY *= 0.3;
                }

                this._food.x = this._foodBaseX + offsetX;
                this._food.y = this._foodBaseY + offsetY;

                // Sliding the food around adds a tiny bit of cook progress
                const prevX = this._foodPrevX ?? this._food.x;
                const prevY = this._foodPrevY ?? this._food.y;
                const dx = this._food.x - prevX;
                const dy = this._food.y - prevY;
                const moved = Math.sqrt(dx * dx + dy * dy);
                this._foodPrevX = this._food.x;
                this._foodPrevY = this._food.y;

                if (moved > 0.5 && this._cookTimer) {
                    const SLIDE_BOOST = 0.002;
                    this._cookTimer.elapsed += this._cookTimer.delay * SLIDE_BOOST * Math.min(moved / 3, 1);
                }
            } else {
                // Smoothly slide food back to center before flipping
                this._foodVelX = 0;
                this._foodVelY = 0;
                this._food.x = Phaser.Math.Linear(this._food.x, this._foodBaseX, RETURN_LERP);
                this._food.y = Phaser.Math.Linear(this._food.y, this._foodBaseY, RETURN_LERP);
            }
        }
    }

    // =======================================================================
    // GAME LOGIC
    // =======================================================================

    _startTimer(gameTime) {
        if (this.countdownTimer) return;
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this._gameState === 'GAME_OVER') return;
                const remaining = Math.ceil(this.countdownTimer.getOverallRemainingSeconds());
                EventBus.emit('minigame:tick', { timeLeft: remaining, maxTime: gameTime, updateProgress: false });
                if (remaining <= 0) {
                    this._endGame();
                }
            },
            repeat: gameTime - 1,
        });
    }

    _startCooking() {
        this._gameState = 'COOKING';
        this._flipInitiated = false;
        this._slideBaseGamma = undefined;
        this._slideBaseBeta = undefined;

        // Hide smoke if it was active
        if (this._smokeDom) {
            this._smokeDom.setVisible(false);
        }

        if (this._flipPromptContainer) {
            this._flipPromptContainer.setVisible(false);
        }

        const settings = AccelerometerSettings;
        const cookTime = Phaser.Math.Between(settings.minCookTime, settings.maxCookTime);

        // Timer for cooking
        if (this._cookTimer) {
            this._cookTimer.remove();
        }

        this._cookTimer = this.time.delayedCall(cookTime, () => {
            this._readyToFlip();
        });
    }

    _readyToFlip() {
        this._gameState = 'READY';

        // Capture the baseline device angle at the exact moment the egg is ready
        this._startBetaAngle = AccelerometerManager.getOrientation().beta;

        // Show flip prompt
        if (this._flipPromptContainer) {
            this._flipPromptContainer.setVisible(true);
        }

        // Show smoke to indicate it's ready
        if (this._smokeDom) {
            this._smokeDom.setVisible(true);
        }
    }

    _executeFlip() {
        this._flipInitiated = false;

        // Temporarily disable mechanics while animating
        this._gameState = 'FLIPPING';

        if (this._smokeDom) {
            this._smokeDom.setVisible(false);
        }

        if (this._flipPromptContainer) {
            this._flipPromptContainer.setVisible(false);
        }

        this._cookLevel++;
        this.score = this._cookLevel * 100;
        EventBus.emit('minigame:score', { score: this.score });

        // Visual change to food
        const cfg = this._foodConfig;
        const frame = cfg.levelToFrame(this._cookLevel + 1);
        const newTexture = `${cfg.name}-${frame}`;
        const newIconSrc = `assets/fry-food/${cfg.folder}/${cfg.prefix}_${frame}.png`;

        if (this._progressBarIcon) {
            this._progressBarIcon.src = newIconSrc;
        }

        // Tween to jump up, change scale, and fall down
        this.tweens.add({
            targets: this._food,
            scaleX: 1.2,
            scaleY: 1.2,
            y: '-=200', // Jump up relative to its current position
            duration: 300,
            yoyo: true,
            ease: 'Quad.easeOut',
            onYoyo: () => {
                // Change texture halfway through the jump (when it's "flipped")
                if (this._foodSprite) {
                    this._foodSprite.setTexture(newTexture);
                }
            },
            onComplete: () => {
                if (this._cookLevel >= 4) {
                    this._endGame();
                } else {
                    // Done flipping, restart cook cycle
                    this._startCooking();
                }
            }
        });
    }

    _endGame() {
        this._gameState = 'GAME_OVER';

        if (this._cookTimer) {
            this._cookTimer.remove();
        }
        if (this.countdownTimer) {
            this.countdownTimer.remove();
        }
        
        // Trigger the premium DOM effect
        showLevelCompleteEffect();

        // Wait for the effect to finish before showing the game over panel
        this.time.delayedCall(1500, () => {
            EventBus.emit('minigame:game-over', {
                score: this._cookLevel * 100,
                level: this._cookLevel,
                panelBorderColor: GameOverSetting.panelBorderColor,
                panelHeaderColor: GameOverSetting.panelHeaderColor,
                resultImage: 'assets/fry-food/tray.png',
            });
        });
    }

    // =======================================================================
    // PRIVATE HELPERS
    // =======================================================================

    /**
     * Draw the frying pan using the image asset, grouped in a Container
     * so we can rotate the whole thing as one unit.
     */
    _createPan(cx, cy) {
        const panImage = this.add.image(0, 0, 'fry-food-pan');
        panImage.setAngle(90);
        panImage.setScale(2.15);

        // Assemble into container, move down 250px
        this._panContainer = this.add.container(cx, cy + 250, [
            panImage
        ]);
    }

    /**
     * Create a simple test food item (an "egg" for now) placed on the pan.
     */
    _createFood(cx, cy) {
        // Container for food so we can tween it easily (moved up 400px)
        this._food = this.add.container(0, -400);

        const cfg = this._foodConfig;
        const initialFrame = cfg.levelToFrame(1);
        this._foodSprite = this.add.sprite(0, 0, `${cfg.name}-${initialFrame}`);
        this._foodSprite.setScale(1.5);
        
        this._food.add(this._foodSprite);

        if (this._panContainer) {
            this._panContainer.add(this._food);
        }
    }

    /**
     * Create a DOM-canvas-based smoke particle effect.
     * Renders animated smoke wisps that rise, drift, expand, and fade.
     */
    _createSmoke(cx, cy) {
        const uiRoot = document.getElementById('ui-root');
        if (!uiRoot) return;

        const CANVAS_W = 480;
        const CANVAS_H = 400;

        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        Object.assign(canvas.style, {
            position: 'absolute',
            left: '50%',
            bottom: 'calc(38% - 15px)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: '800',
            visibility: 'hidden',
        });

        uiRoot.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const particles = [];
        const MAX_PARTICLES = 35;
        let animId = null;

        // Spawn a new smoke particle at the bottom-center of the canvas
        function spawnParticle() {
            particles.push({
                x: CANVAS_W / 2 + (Math.random() - 0.5) * 140,
                y: CANVAS_H / 2 + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -(Math.random() * 1.0 + 0.5),
                radius: 20 + Math.random() * 20,
                growRate: 0.25 + Math.random() * 0.35,
                alpha: 0.0,
                maxAlpha: 0.4 + Math.random() * 0.15,
                life: 0,
                maxLife: 110 + Math.random() * 70,
                wobbleSpeed: 0.02 + Math.random() * 0.03,
                wobbleAmp: 0.4 + Math.random() * 0.6,
                phase: Math.random() * Math.PI * 2,
            });
        }

        function render() {
            ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

            // Spawn particles to maintain count
            while (particles.length < MAX_PARTICLES) {
                spawnParticle();
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life++;
                const t = p.life / p.maxLife; // 0→1 progress

                // Fade in for the first 20%, then fade out
                if (t < 0.2) {
                    p.alpha = p.maxAlpha * (t / 0.2);
                } else {
                    p.alpha = p.maxAlpha * (1 - (t - 0.2) / 0.8);
                }

                // Grow over time
                p.radius += p.growRate;

                // Drift with wobble
                p.x += p.vx + Math.sin(p.life * p.wobbleSpeed + p.phase) * p.wobbleAmp;
                p.y += p.vy;

                // Remove dead particles
                if (p.life >= p.maxLife) {
                    particles.splice(i, 1);
                    continue;
                }

                // Draw soft radial gradient circle
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                grad.addColorStop(0, `rgba(220, 220, 220, ${p.alpha})`);
                grad.addColorStop(0.5, `rgba(200, 200, 200, ${p.alpha * 0.6})`);
                grad.addColorStop(1, `rgba(180, 180, 180, 0)`);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            animId = requestAnimationFrame(render);
        }

        // Public API object (matches the existing show/hide/destroy pattern)
        this._smokeDom = {
            setVisible: (visible) => {
                canvas.style.visibility = visible ? 'visible' : 'hidden';
                if (visible && !animId) {
                    // Reset particles when showing
                    particles.length = 0;
                    render();
                } else if (!visible && animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            },
            destroy: () => {
                if (animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
                if (canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
            },
        };
    }

    _createFlipPrompt(cx, height) {
        const uiRoot = document.getElementById('ui-root');
        if (!uiRoot) return;

        this._flipPromptDom = document.createElement('div');
        Object.assign(this._flipPromptDom.style, {
            position: 'absolute',
            left: '50%',
            bottom: '100px',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            pointerEvents: 'none',
            zIndex: '900',
            visibility: 'hidden'
        });

        const textEl = document.createElement('div');
        textEl.textContent = 'ได้เวลากลับอาหารแล้ว !';
        Object.assign(textEl.style, {
            fontFamily: 'sans-serif',
            fontSize: '32px',
            color: '#ffffff',
            fontWeight: 'bold',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.8), 2px -2px 4px rgba(0,0,0,0.8), -2px 2px 4px rgba(0,0,0,0.8)'
        });

        // Animated phone-tilt icon using sprite frames
        const iconEl = document.createElement('img');
        const tillingFrames = [
            'assets/fry-food/tilling/phone_tile_1.png',
            'assets/fry-food/tilling/phone_tile_2.png',
            'assets/fry-food/tilling/phone_tile_3.png',
            'assets/fry-food/tilling/phone_tile_4.png',
        ];
        iconEl.src = tillingFrames[0];
        iconEl.alt = 'Tilt phone to flip';
        Object.assign(iconEl.style, {
            width: '96px',
            height: '96px',
            objectFit: 'contain',
            imageRendering: 'auto',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
        });

        // Cycle through frames in a ping-pong pattern (1→2→3→4→3→2→1→…)
        let tillingFrameIndex = 0;
        let tillingDirection = 1;
        this._tillingAnimInterval = setInterval(() => {
            tillingFrameIndex += tillingDirection;
            if (tillingFrameIndex >= tillingFrames.length - 1) {
                tillingDirection = -1;
            } else if (tillingFrameIndex <= 0) {
                tillingDirection = 1;
            }
            iconEl.src = tillingFrames[tillingFrameIndex];
        }, 300);

        this._flipPromptDom.appendChild(textEl);
        this._flipPromptDom.appendChild(iconEl);

        uiRoot.appendChild(this._flipPromptDom);

        // Wrapper object to maintain the existing API for show/hide
        this._flipPromptContainer = {
            setVisible: (visible) => {
                this._flipPromptDom.style.visibility = visible ? 'visible' : 'hidden';
            },
            destroy: () => {
                if (this._tillingAnimInterval) {
                    clearInterval(this._tillingAnimInterval);
                    this._tillingAnimInterval = null;
                }
                if (this._flipPromptDom && this._flipPromptDom.parentNode) {
                    this._flipPromptDom.parentNode.removeChild(this._flipPromptDom);
                }
            }
        };
    }

    _createProgressBarIcon() {
        const wrap = document.querySelector('.minigame-hud__timer-wrap');
        if (!wrap) return;

        const cfg = this._foodConfig;
        const initialFrame = cfg.levelToFrame(1);
        const src = `assets/fry-food/${cfg.folder}/${cfg.prefix}_${initialFrame}.png`;

        this._progressBarIcon = document.createElement('img');
        this._progressBarIcon.src = src;
        Object.assign(this._progressBarIcon.style, {
            position: 'absolute',
            bottom: '15px',
            left: '0%',
            transform: 'translate(-50%, 50%)',
            width: '56px', 
            height: '56px',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: '10',
            visibility: 'hidden',
            transition: 'left 150ms linear'
        });

        wrap.appendChild(this._progressBarIcon);
    }

    _updateProgressBarIcon(pct, instant = false) {
        if (!this._progressBarIcon) return;
        this._progressBarIcon.style.visibility = pct >= 0 ? 'visible' : 'hidden';

        const pb = document.getElementById('hud-timer-progress');

        if (instant && pb) {
            // Remove from DOM, set value, re-insert.
            // This is the only reliable way to cancel md-linear-progress's
            // internal shadow-DOM CSS transition — it kills all running
            // transitions when the element leaves the document.
            const parent = pb.parentNode;
            const nextSibling = pb.nextSibling;
            parent.removeChild(pb);
            pb.value = 0;
            if (nextSibling) {
                parent.insertBefore(pb, nextSibling);
            } else {
                parent.appendChild(pb);
            }
            this._progressBarIcon.style.transition = 'none';
            this._progressBarIcon.style.left = '0%';
        } else {
            this._progressBarIcon.style.transition = 'left 150ms linear';
            this._progressBarIcon.style.left = `${pct * 100}%`;
        }
    }

    /**
     * Create the debug text overlay at the top of the screen.
     */
    _createDebugOverlay() {
        this._debugText = this.add.text(30, 30, 'Accelerometer: initializing...', {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: { x: 16, y: 12 },
            wordWrap: { width: this.scale.width - 60 },
        }).setDepth(3000);
    }

    /**
     * Start the AccelerometerManager. On iOS, show a permission button first.
     */
    async _initAccelerometer() {
        if (AccelerometerManager.requiresPermissionRequest()) {
            // iOS requires a user gesture — show a button
            this._showIOSPermissionButton();
        } else {
            this._tryLockOrientation();
            const status = await AccelerometerManager.start();
            console.log('[FryFood] Accelerometer status:', status);
        }
    }

    /**
     * Show a DOM button for iOS permission request (must be triggered by user gesture).
     */
    _showIOSPermissionButton() {
        const uiRoot = document.getElementById('ui-root');
        if (!uiRoot) return;

        this._iosButton = document.createElement('button');
        this._iosButton.id = 'accel-permission-btn';
        this._iosButton.textContent = '🎮 Enable Motion Control';
        Object.assign(this._iosButton.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '9999',
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            color: '#fff',
            backgroundColor: '#FEA837',
            border: '3px solid #DE8D23',
            borderRadius: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        });

        this._iosButton.addEventListener('click', async () => {
            this._tryLockOrientation();
            const status = await AccelerometerManager.start();
            console.log('[FryFood] iOS accelerometer status:', status);
            this._removeIOSButton();
        }, { once: true });

        uiRoot.appendChild(this._iosButton);
    }

    /**
     * Remove the iOS permission button from the DOM.
     */
    _removeIOSButton() {
        if (this._iosButton && this._iosButton.parentNode) {
            this._iosButton.parentNode.removeChild(this._iosButton);
            this._iosButton = null;
        }
    }

    /**
     * Attempt to lock the screen orientation to portrait and enter fullscreen.
     * Note: This usually requires a user gesture or fullscreen mode on mobile browsers.
     */
    async _tryLockOrientation() {
        if (this.scale && !this.scale.isFullscreen) {
            try {
                const fsPromise = this.scale.startFullscreen();
                if (fsPromise && typeof fsPromise.catch === 'function') {
                    fsPromise.catch(() => { });
                }
            } catch (e) {
                // ignore
            }
        }

        // Phaser's built-in scale manager orientation lock
        if (this.scale) {
            this.scale.lockOrientation('portrait-primary');
        }

        // Native Web API orientation lock ('portrait-primary' prevents 180° upside-down rotation)
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
            try {
                await screen.orientation.lock('portrait-primary');
                console.log('[FryFood] Screen orientation locked to portrait-primary.');
            } catch (error) {
                console.warn('[FryFood] Could not lock screen orientation:', error);
            }
        }
    }

    /**
     * Update the debug text with current sensor values.
     */
    _updateDebugText(orientation, accel) {
        if (!this._debugText) return;

        const status = AccelerometerManager.getStatus();
        const active = AccelerometerManager.isActive();

        let timeLeft = 0;
        if (this._cookTimer) {
            timeLeft = (this._cookTimer.getRemaining() / 1000).toFixed(1);
        }

        const lines = [
            `Status: ${status}${active ? ' ✅' : ''}`,
            `── Game State ──`,
            `  State: ${this._gameState}`,
            `  Cook Level: ${this._cookLevel}`,
            `  Timer: ${this._gameState === 'COOKING' ? timeLeft + 's' : '---'}`,
            `  Flip Initiated: ${this._flipInitiated}`,
            `  Flip Threshold: +${this._flipThresholdBeta}°`,
            `── Sensor Data ──`,
            `  β (Pitch): ${orientation.beta.toFixed(1)}°`,
            `  Baseline β: ${this._gameState === 'READY' ? this._startBetaAngle.toFixed(1) + '°' : '---'}`,
        ];

        if (!AccelerometerManager.isSupported()) {
            lines.push('⚠️ No sensor APIs detected (desktop?)');
            lines.push('Use Chrome DevTools → Sensors → Orientation');
        }

        this._debugText.setText(lines.join('\n'));
    }

    /**
     * Create a DOM-based menu for the designer to tweak variables.
     */
    _createDesignerMenu() {
        const uiRoot = document.getElementById('ui-root');
        if (!uiRoot) return;

        this._designerMenu = document.createElement('div');
        Object.assign(this._designerMenu.style, {
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px',
            borderRadius: '10px',
            color: 'white',
            fontFamily: 'sans-serif',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '200px',
            pointerEvents: 'auto' // Ensure it can be clicked even if parent is disabled
        });

        // Label
        const title = document.createElement('div');
        title.textContent = '🛠️ Designer Tools';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '5px';

        // Slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.style.display = 'flex';
        sliderContainer.style.flexDirection = 'column';

        const label = document.createElement('label');
        label.textContent = `Flip Angle: ${this._flipThresholdBeta}°`;
        label.style.fontSize = '14px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '180';
        slider.value = this._flipThresholdBeta.toString();
        slider.style.marginTop = '5px';
        slider.style.pointerEvents = 'auto';

        // Prevent Phaser or mobile emulator from swallowing the touch/pointer events
        const stopPropagation = (e) => e.stopPropagation();
        slider.addEventListener('pointerdown', stopPropagation);
        slider.addEventListener('touchstart', stopPropagation);
        slider.addEventListener('touchmove', stopPropagation);
        slider.addEventListener('mousedown', stopPropagation);

        slider.addEventListener('input', (e) => {
            this._flipThresholdBeta = parseInt(e.target.value, 10);
            label.textContent = `Flip Angle: ${this._flipThresholdBeta}°`;
        });

        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);

        this._designerMenu.appendChild(title);
        this._designerMenu.appendChild(sliderContainer);
        uiRoot.appendChild(this._designerMenu);
    }

    /**
     * Remove the designer menu from DOM.
     */
    _removeDesignerMenu() {
        if (this._designerMenu && this._designerMenu.parentNode) {
            this._designerMenu.parentNode.removeChild(this._designerMenu);
            this._designerMenu = null;
        }
    }
}
