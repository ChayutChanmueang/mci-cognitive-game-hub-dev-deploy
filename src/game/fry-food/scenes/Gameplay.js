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
        this._currentTiltAngle = 0;   // smoothed left/right rotation (degrees)
        this._currentPitchAngle = 0;  // smoothed forward/back pitch (degrees)
        this._foodOffsetX = 0;        // food X offset from pan centre
        this._foodOffsetY = 0;        // food Y offset from pan centre

        // -- Hide HUD (we don't need score/progress for this game) ----------
        EventBus.emit('minigame:hide-hud');

        // -- Draw frying pan ------------------------------------------------
        this._createPan(cx, cy);

        // -- Place a test food item on the pan ------------------------------
        this._createFood(cx, cy);

        // -- Debug text overlay ---------------------------------------------
        this._createDebugOverlay();

        // -- Start accelerometer --------------------------------------------
        this._initAccelerometer();

        // -- Cleanup on scene shutdown --------------------------------------
        this.events.once('shutdown', () => {
            AccelerometerManager.stop();
            this._removeIOSButton();
        });
    }

    update(time, delta) {
        const settings = AccelerometerSettings;
        const orientation = AccelerometerManager.getOrientation();
        const accel = AccelerometerManager.getAcceleration();
        const deltaSec = delta / 1000;

        // -- Gamma: left/right tilt -----------------------------------------
        // gamma ranges from -90 to 90 degrees.
        let rawGamma = orientation.gamma;
        if (Math.abs(rawGamma) < settings.deadZone) {
            rawGamma = 0;
        }

        const targetAngle = Phaser.Math.Clamp(
            rawGamma * settings.sensitivity,
            -settings.maxTiltAngle,
            settings.maxTiltAngle
        );

        this._currentTiltAngle = Phaser.Math.Linear(
            this._currentTiltAngle,
            targetAngle,
            settings.smoothing
        );

        // -- Beta: forward/backward tilt ------------------------------------
        // beta = 0 when device is flat (face-up) = pan perfectly level.
        // Tilting forward (top away from you) → positive beta → food slides up.
        // Tilting backward (top toward you)   → negative beta → food slides down.
        let rawBeta = orientation.beta;
        if (Math.abs(rawBeta) < settings.deadZone) {
            rawBeta = 0;
        }

        const targetPitch = Phaser.Math.Clamp(
            rawBeta * settings.sensitivity,
            -settings.maxTiltAngle,
            settings.maxTiltAngle
        );

        this._currentPitchAngle = Phaser.Math.Linear(
            this._currentPitchAngle,
            targetPitch,
            settings.smoothing
        );

        // -- Apply tilt to pan container ------------------------------------
        if (this._panContainer) {
            // Rotate for left/right tilt
            this._panContainer.setAngle(this._currentTiltAngle);

            // Scale Y to simulate forward/back perspective tilt
            // At 0° pitch → scaleY = 1.0 (flat), at ±30° → scaleY ≈ 0.5
            const pitchNorm = Math.abs(this._currentPitchAngle) / settings.maxTiltAngle;
            const scaleY = Phaser.Math.Linear(1.0, 0.5, pitchNorm);
            this._panContainer.setScale(1, scaleY);
        }

        // -- Slide food along the pan surface (both axes) -------------------
        const maxOffset = settings.panRadius - 50;

        // X slide from left/right tilt
        const tiltRad = Phaser.Math.DegToRad(this._currentTiltAngle);
        this._foodOffsetX += Math.sin(tiltRad) * settings.foodSlideSpeed * deltaSec;
        this._foodOffsetX = Phaser.Math.Clamp(this._foodOffsetX, -maxOffset, maxOffset);

        // Y slide from forward/back tilt
        const pitchRad = Phaser.Math.DegToRad(this._currentPitchAngle);
        this._foodOffsetY += Math.sin(pitchRad) * settings.foodSlideSpeed * deltaSec;
        this._foodOffsetY = Phaser.Math.Clamp(this._foodOffsetY, -maxOffset, maxOffset);

        // Keep food inside circular pan boundary
        const dist = Math.sqrt(this._foodOffsetX ** 2 + this._foodOffsetY ** 2);
        if (dist > maxOffset) {
            const scale = maxOffset / dist;
            this._foodOffsetX *= scale;
            this._foodOffsetY *= scale;
        }

        if (this._food) {
            this._food.x = this._foodOffsetX;
            this._food.y = this._foodOffsetY;
        }

        // -- Update debug overlay -------------------------------------------
        this._updateDebugText(orientation, accel);
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

        // Assemble into container — everything rotates together
        this._panContainer = this.add.container(cx, cy, [
            panBase, panSurface, oilSheen, rimHighlight, handle,
        ]);
    }

    /**
     * Create a simple test food item (an "egg" for now) placed on the pan.
     */
    _createFood(cx, cy) {
        const foodGfx = this.add.graphics();

        // Egg white (slightly transparent)
        foodGfx.fillStyle(0xffffff, 0.9);
        foodGfx.fillEllipse(0, 0, 100, 80);

        // Egg yolk
        foodGfx.fillStyle(0xffaa00, 1);
        foodGfx.fillCircle(5, -2, 25);

        // Yolk highlight
        foodGfx.fillStyle(0xffdd44, 0.7);
        foodGfx.fillCircle(10, -7, 10);

        this._food = foodGfx;

        // Add food to the pan container so it rotates with the pan
        if (this._panContainer) {
            this._panContainer.add(this._food);
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
                this.scale.startFullscreen();
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

        const lines = [
            `Status: ${status}${active ? ' ✅' : ''}`,
            `── Orientation (primary) ──`,
            `  α: ${orientation.alpha.toFixed(1)}°  β: ${orientation.beta.toFixed(1)}°  γ: ${orientation.gamma.toFixed(1)}°`,
            `── Acceleration ──`,
            `  X: ${accel.x.toFixed(2)}  Y: ${accel.y.toFixed(2)}  Z: ${accel.z.toFixed(2)}`,
            `── Game State ──`,
            `  Tilt (L/R): ${this._currentTiltAngle.toFixed(1)}°`,
            `  Pitch (F/B): ${this._currentPitchAngle.toFixed(1)}°`,
            `  Food: (${this._foodOffsetX.toFixed(0)}, ${this._foodOffsetY.toFixed(0)})px`,
        ];

        if (!AccelerometerManager.isSupported()) {
            lines.push('⚠️ No sensor APIs detected (desktop?)');
            lines.push('Use Chrome DevTools → Sensors → Orientation');
        }

        this._debugText.setText(lines.join('\n'));
    }
}

