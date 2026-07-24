/**
 * AccelerometerManager
 * ---------------------------------------------------------------------------
 * A reusable singleton utility that wraps BOTH the DeviceOrientation and
 * DeviceMotion Web APIs for cross-platform tilt & motion input
 * (Android, iOS 13+, PWA, Chrome DevTools emulation).
 *
 * - **Orientation** (DeviceOrientationEvent): gives absolute tilt angles
 *   (beta = front/back, gamma = left/right). Best for tilt-based mechanics.
 *   This is what Chrome DevTools Sensors emulates.
 *
 * - **Motion** (DeviceMotionEvent): gives acceleration/gravity vectors.
 *   Best for shake detection. Kept as a secondary data source.
 *
 * Usage:
 *   import AccelerometerManager from '../core/accelerometer-manager.js';
 *
 *   // In scene create():
 *   await AccelerometerManager.start();
 *
 *   // In scene update():
 *   const { beta, gamma } = AccelerometerManager.getOrientation();
 *   const { x, y, z }     = AccelerometerManager.getAcceleration();
 *
 *   // In scene shutdown:
 *   AccelerometerManager.stop();
 */

class _AccelerometerManager {
    constructor() {
        /** @type {{ x: number, y: number, z: number }} Raw acceleration incl. gravity */
        this._acceleration = { x: 0, y: 0, z: 0 };

        /** @type {{ x: number, y: number, z: number }} Linear acceleration (no gravity) */
        this._linearAcceleration = { x: 0, y: 0, z: 0 };

        /**
         * Device orientation angles (degrees).
         * - alpha: compass direction (0–360)
         * - beta:  front/back tilt   (-180 to 180, 0 = flat)
         * - gamma: left/right tilt   (-90 to 90,   0 = flat)
         * @type {{ alpha: number, beta: number, gamma: number }}
         */
        this._orientation = { alpha: 0, beta: 0, gamma: 0 };

        /** @type {boolean} */
        this._listening = false;

        /**
         * Whether the user has granted motion/orientation permission.
         * Intentionally NOT reset by stop() so that iOS doesn't demand a
         * second permission button when the gameplay scene restarts.
         * @type {boolean}
         */
        this._permissionGranted = false;

        /** @type {'idle'|'requesting'|'granted'|'denied'|'unsupported'} */
        this._status = 'idle';

        /**
         * Cached result of hardware detection probe.
         * @type {boolean|null}
         */
        this._hardwareDetected = null;

        // Bound handlers so we can add/remove the same reference
        this._onDeviceMotion = this._handleDeviceMotion.bind(this);
        this._onDeviceOrientation = this._handleDeviceOrientation.bind(this);
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Returns true if running on an iOS device (iPhone, iPad, iPod).
     *
     * Uses user-agent detection because the iOS sensor permission API
     * (DeviceOrientationEvent.requestPermission) only exists on secure origins
     * (HTTPS). On plain HTTP dev servers that API is absent even on iOS, so
     * we cannot rely on its presence to detect iOS.
     */
    isIOS() {
        return (
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            // iPad Pro in desktop mode reports "MacIntel" but has touch points
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
        );
    }

    /**
     * Returns true if the browser exposes at least one of the device sensor APIs.
     */
    isSupported() {
        return (
            typeof DeviceMotionEvent !== 'undefined' ||
            typeof DeviceOrientationEvent !== 'undefined'
        );
    }

    /**
     * Returns true when a user-gesture-gated permission prompt is needed.
     *
     * On iOS, DeviceOrientationEvent.requestPermission() must be called from
     * a direct user gesture (tap/click). Critically, this API only exists on
     * HTTPS secure contexts — on a plain HTTP dev server it is absent even
     * though the device is still iOS and still needs the gesture.
     *
     * We therefore detect iOS via user-agent instead of checking for the API,
     * and skip the prompt only once permission has already been granted this
     * session (tracked by _permissionGranted).
     */
    requiresPermissionRequest() {
        // Already granted this session — no button needed.
        if (this._permissionGranted) return false;

        // iOS always needs to start sensor access from a user gesture,
        // regardless of whether the requestPermission API is available.
        return this.isIOS();
    }

    /**
     * Start listening for device orientation + motion events.
     *
     * On iOS this MUST be called from a direct user gesture (tap/click):
     *   - On HTTPS: calls DeviceOrientationEvent.requestPermission() which shows
     *     the native iOS "Allow motion & orientation" system dialog.
     *   - On HTTP (dev server): requestPermission doesn't exist, but starting
     *     from a user gesture still works — we skip the API call and go straight
     *     to adding event listeners.
     * On Android / desktop browsers no gesture is required.
     *
     * @returns {Promise<'granted'|'denied'|'unsupported'>}
     */
    async start() {
        if (this._listening) return this._status;

        if (!this.isSupported()) {
            this._status = 'unsupported';
            console.warn('[AccelerometerManager] Device sensor APIs not supported.');
            return this._status;
        }

        // iOS: must be called from a user gesture.
        // The inner guards check for the API presence to handle both HTTP and HTTPS.
        if (this.requiresPermissionRequest()) {
            this._status = 'requesting';
            try {
                // Request orientation permission (iOS)
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    const result = await DeviceOrientationEvent.requestPermission();
                    if (result !== 'granted') {
                        this._status = 'denied';
                        console.warn('[AccelerometerManager] Orientation permission denied.');
                        return this._status;
                    }
                }
                // Request motion permission (iOS)
                if (typeof DeviceMotionEvent.requestPermission === 'function') {
                    const result = await DeviceMotionEvent.requestPermission();
                    if (result !== 'granted') {
                        this._status = 'denied';
                        console.warn('[AccelerometerManager] Motion permission denied.');
                        return this._status;
                    }
                }
                this._permissionGranted = true;
                this._status = 'granted';
            } catch (err) {
                this._status = 'denied';
                console.error('[AccelerometerManager] Permission request failed:', err);
                return this._status;
            }
        } else {
            // Android / non-permission browsers
            this._permissionGranted = true;
            this._status = 'granted';
        }

        // Listen to BOTH events — orientation for tilt, motion for acceleration
        window.addEventListener('deviceorientation', this._onDeviceOrientation, true);
        window.addEventListener('devicemotion', this._onDeviceMotion, true);
        this._listening = true;
        console.log('[AccelerometerManager] Started listening (orientation + motion).');
        return this._status;
    }

    /**
     * Probe for actual orientation hardware by listening to deviceorientation
     * events for up to `timeoutMs`. Resolves `true` if at least one event
     * fires with non-null beta/gamma values, `false` otherwise.
     *
     * This is necessary because most browsers expose the DeviceOrientationEvent
     * API even on devices without a physical gyroscope/accelerometer.
     *
     * @param {number} [timeoutMs=3000] - How long to wait for sensor data.
     * @returns {Promise<boolean>}
     */
    async detectHardwareSupport(timeoutMs = 3000) {
        if (this._hardwareDetected !== null) {
            return this._hardwareDetected;
        }

        return new Promise((resolve) => {
            let timeoutId;

            const handleProbeEvent = (event) => {
                // If we receive an event with actual beta or gamma data, hardware exists
                if (event.beta !== null || event.gamma !== null) {
                    clearTimeout(timeoutId);
                    window.removeEventListener('deviceorientation', handleProbeEvent, true);
                    this._hardwareDetected = true;
                    resolve(true);
                }
            };

            // Set timeout to resolve false if no valid event received
            timeoutId = setTimeout(() => {
                window.removeEventListener('deviceorientation', handleProbeEvent, true);
                this._hardwareDetected = false;
                console.warn('[AccelerometerManager] No orientation hardware detected within timeout.');
                resolve(false);
            }, timeoutMs);

            window.addEventListener('deviceorientation', handleProbeEvent, true);
        });
    }

    /**
     * Whether orientation hardware was detected.
     * Will return null if detectHardwareSupport() hasn't completed yet.
     * @returns {boolean|null}
     */
    hasOrientationHardware() {
        return this._hardwareDetected;
    }

    /**
     * Stop listening and reset sensor values.
     * NOTE: _permissionGranted and _status are intentionally preserved so
     * that iOS does not require a second permission tap when the scene
     * restarts within the same browser session.
     */
    stop() {
        if (this._listening) {
            window.removeEventListener('deviceorientation', this._onDeviceOrientation, true);
            window.removeEventListener('devicemotion', this._onDeviceMotion, true);
            this._listening = false;
            console.log('[AccelerometerManager] Stopped listening.');
        }
        this._acceleration = { x: 0, y: 0, z: 0 };
        this._linearAcceleration = { x: 0, y: 0, z: 0 };
        this._orientation = { alpha: 0, beta: 0, gamma: 0 };
    }

    /**
     * Full reset — clears permission state as well.
     * Use only when you need to re-trigger the iOS permission dialog
     * (e.g., the user explicitly denied and wants to retry).
     */
    reset() {
        this.stop();
        this._permissionGranted = false;
        this._status = 'idle';
        console.log('[AccelerometerManager] Full reset (permission state cleared).');
    }

    /**
     * Get the latest device orientation (tilt angles in degrees).
     * This is the PRIMARY data source for tilt-based mechanics.
     *
     * - gamma: left/right tilt (-90 to 90). Negative = tilt left, Positive = tilt right.
     * - beta:  front/back tilt (-180 to 180). 0 = flat, positive = tilted toward user.
     * - alpha: compass heading (0 to 360).
     *
     * Works with Chrome DevTools → Sensors → Orientation emulation.
     *
     * @returns {{ alpha: number, beta: number, gamma: number }}
     */
    getOrientation() {
        return { ...this._orientation };
    }

    /**
     * Get the latest acceleration values (includes gravity).
     * Secondary data source — useful for shake detection or as fallback.
     *
     * @returns {{ x: number, y: number, z: number }}
     */
    getAcceleration() {
        return { ...this._acceleration };
    }

    /**
     * Get the latest acceleration values WITHOUT gravity.
     * Useful for detecting shakes / sudden movements.
     *
     * @returns {{ x: number, y: number, z: number }}
     */
    getLinearAcceleration() {
        return { ...this._linearAcceleration };
    }

    /**
     * Get current status string.
     * @returns {'idle'|'requesting'|'granted'|'denied'|'unsupported'}
     */
    getStatus() {
        return this._status;
    }

    /**
     * Whether we are actively receiving data.
     */
    isActive() {
        return this._listening && this._status === 'granted';
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    /**
     * @param {DeviceOrientationEvent} event
     */
    _handleDeviceOrientation(event) {
        this._orientation = {
            alpha: event.alpha ?? 0,
            beta: event.beta ?? 0,
            gamma: event.gamma ?? 0,
        };
    }

    /**
     * @param {DeviceMotionEvent} event
     */
    _handleDeviceMotion(event) {
        const accel = event.accelerationIncludingGravity;
        if (accel) {
            this._acceleration = {
                x: accel.x ?? 0,
                y: accel.y ?? 0,
                z: accel.z ?? 0,
            };
        }

        const linear = event.acceleration;
        if (linear) {
            this._linearAcceleration = {
                x: linear.x ?? 0,
                y: linear.y ?? 0,
                z: linear.z ?? 0,
            };
        }
    }
}

// Export as singleton
const AccelerometerManager = new _AccelerometerManager();
export default AccelerometerManager;
