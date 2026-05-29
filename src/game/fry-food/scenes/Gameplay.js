import Phaser from 'phaser';
import { EventBus } from '../../../core/EventBus.js';
import AccelerometerManager from '../../../core/accelerometer-manager.js';
import { AccelerometerSettings } from '../constants.js';

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super('fry-food-gameplay-scene');
    }

    preload() {
        // Preload gameplay assets here
    }

    create(data) {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        // -- State ----------------------------------------------------------
        this._gameState = 'COOKING'; // 'COOKING', 'READY', 'FLIPPING'
        this._cookTimer = null;
        this._flipInitiated = false; // tracked when device tilted forward past threshold
        this._cookLevel = 0;         // Tracks how many times it was flipped
        this._flipThresholdBeta = AccelerometerSettings.flipThresholdBeta; // dynamic threshold for designer
        
        // -- Hide HUD (we don't need score/progress for this game) ----------
        EventBus.emit('minigame:hide-hud');

        // -- Draw frying pan ------------------------------------------------
        this._createPan(cx, cy);

        // -- Place a test food item on the pan ------------------------------
        this._createFood(cx, cy);

        // -- Create Smoke Visuals -------------------------------------------
        this._createSmoke(cx, cy);

        // -- Debug text overlay ---------------------------------------------
        this._createDebugOverlay();

        // -- Designer Menu --------------------------------------------------
        this._createDesignerMenu();

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
            // Player tilts phone up/forward
            if (rawBeta > this._flipThresholdBeta) {
                this._flipInitiated = true;
            } 
            // Player brings phone back down after tilting up
            else if (this._flipInitiated && rawBeta < 5) { // 5 degrees threshold to count as "back to flat"
                this._executeFlip();
            }
        } else {
            // Reset if they tilt while cooking or just to clear stale state
            if (rawBeta < 5) {
                this._flipInitiated = false;
            }
        }

        // -- Update debug overlay -------------------------------------------
        this._updateDebugText(orientation, accel);
    }

    // =======================================================================
    // GAME LOGIC
    // =======================================================================

    _startCooking() {
        this._gameState = 'COOKING';
        this._flipInitiated = false;
        
        // Hide smoke if it was active
        if (this._smokeGfx) {
            this._smokeGfx.setVisible(false);
            if (this._smokeTween) this._smokeTween.stop();
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
        
        // Show smoke to indicate it's ready
        if (this._smokeGfx) {
            this._smokeGfx.setVisible(true);
            this._smokeGfx.y = -50; // Start slightly above the egg
            this._smokeGfx.alpha = 0;

            this._smokeTween = this.tweens.add({
                targets: this._smokeGfx,
                alpha: { from: 0.4, to: 0.9 },
                y: '-=60', // Drift up 60px from current position
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    _executeFlip() {
        this._flipInitiated = false;
        
        // Temporarily disable mechanics while animating
        this._gameState = 'FLIPPING';
        
        if (this._smokeGfx) {
            this._smokeGfx.setVisible(false);
            if (this._smokeTween) this._smokeTween.stop();
        }

        this._cookLevel++;

        // Visual change to egg (darker color as it cooks)
        const cookColors = [0xffffff, 0xffddaa, 0xffbb77, 0xdd8844, 0xaa5522];
        const newColor = cookColors[Math.min(this._cookLevel, cookColors.length - 1)];

        // Tween to jump up, change scale, and fall down
        this.tweens.add({
            targets: this._food,
            scaleX: 1.2,
            scaleY: 1.2,
            y: -200, // Jump up (in container coordinates relative to pan)
            duration: 300,
            yoyo: true,
            ease: 'Quad.easeOut',
            onYoyo: () => {
                // Change color halfway through the jump (when it's "flipped")
                if (this._foodWhite) {
                    this._foodWhite.clear();
                    this._foodWhite.fillStyle(newColor, 1);
                    this._foodWhite.fillEllipse(0, 0, 300, 240); // 3x scaled
                }
            },
            onComplete: () => {
                // Done flipping, restart cook cycle
                this._startCooking();
            }
        });
    }

    // =======================================================================
    // PRIVATE HELPERS
    // =======================================================================

    /**
     * Draw a simple frying pan using Phaser Graphics, grouped in a Container
     * so we can rotate the whole thing as one unit.
     */
    _createPan(cx, cy) {
        const r = AccelerometerSettings.panRadius;

        // Pan base (dark circle)
        const panBase = this.add.graphics();
        panBase.fillStyle(0x3a3a3a, 1);
        panBase.fillCircle(0, 0, r);

        // Inner cooking surface (slightly lighter)
        const panSurface = this.add.graphics();
        panSurface.fillStyle(0x4a4a4a, 1);
        panSurface.fillCircle(0, 0, r - 20);

        // Oil sheen (subtle semi-transparent ellipse)
        const oilSheen = this.add.graphics();
        oilSheen.fillStyle(0xffcc00, 0.08);
        oilSheen.fillEllipse(0, -20, r * 1.2, r * 0.7);

        // Pan rim highlight (top arc for 3D feel)
        const rimHighlight = this.add.graphics();
        rimHighlight.lineStyle(4, 0x666666, 0.6);
        rimHighlight.beginPath();
        rimHighlight.arc(0, 0, r - 2, Phaser.Math.DegToRad(-160), Phaser.Math.DegToRad(-20), false);
        rimHighlight.strokePath();

        // Handle
        const handle = this.add.graphics();
        handle.fillStyle(0x5a3a1a, 1);
        handle.fillRoundedRect(-30, r - 10, 60, 200, 12);
        // Handle rivet
        handle.fillStyle(0x888888, 1);
        handle.fillCircle(0, r + 20, 8);

        // Assemble into container
        this._panContainer = this.add.container(cx, cy, [
            panBase, panSurface, oilSheen, rimHighlight, handle,
        ]);
    }

    /**
     * Create a simple test food item (an "egg" for now) placed on the pan.
     */
    _createFood(cx, cy) {
        // Container for food so we can tween it easily
        this._food = this.add.container(0, 0);
        
        // We separate the white so we can change its color
        this._foodWhite = this.add.graphics();
        this._foodWhite.fillStyle(0xffffff, 0.9); // Initial white
        this._foodWhite.fillEllipse(0, 0, 300, 240); // 3x scaled

        const foodYolk = this.add.graphics();
        foodYolk.fillStyle(0xffaa00, 1);
        foodYolk.fillCircle(15, -6, 75); // 3x scaled
        foodYolk.fillStyle(0xffdd44, 0.7); // Yolk highlight
        foodYolk.fillCircle(30, -21, 30); // 3x scaled

        this._food.add([this._foodWhite, foodYolk]);

        if (this._panContainer) {
            this._panContainer.add(this._food);
        }
    }

    _createSmoke(cx, cy) {
        this._smokeGfx = this.add.graphics();
        // Made smoke whiter and larger to match the 3x scaled egg
        this._smokeGfx.fillStyle(0xeeeeee, 1);
        this._smokeGfx.fillEllipse(0, 0, 360, 120);
        this._smokeGfx.fillEllipse(-60, -90, 240, 150);
        this._smokeGfx.fillEllipse(90, -60, 270, 180);
        
        // Initial state is hidden
        this._smokeGfx.setVisible(false);
        
        // Add to pan so it's above the food
        if (this._panContainer) {
            this._panContainer.add(this._smokeGfx);
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
                    fsPromise.catch(() => {});
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
            `  Flip Threshold: ${this._flipThresholdBeta}°`,
            `── Sensor Data ──`,
            `  β (Pitch): ${orientation.beta.toFixed(1)}°`,
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
