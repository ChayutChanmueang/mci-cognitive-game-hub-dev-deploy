// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'Fry Food',
    description: '',
    instructions: '',
    titleFontSize: '80px',
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => `Level ${level}`,
    // Panel colour tokens — override the shared CSS defaults for this game
    panelBorderColor: '#DE8D23',
    panelHeaderColor: '#FEA837',
    // Font colour tokens
    primaryFontColor: '#945E17',
    secondaryFontColor: '#DE8519',
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    // Panel colour tokens for the game-over result panel
    panelBorderColor: '#DE8D23',
    panelHeaderColor: '#FEA837',
    // Font colour tokens
    primaryFontColor: '#945E17',
    secondaryFontColor: '#DE8519',
});

// ---------------------------------------------------------------------------
// Accelerometer / Frying Pan Tilt Settings
// ---------------------------------------------------------------------------
export const AccelerometerSettings = Object.freeze({
    /** Multiplier applied to gamma angle to get pan rotation (1 = 1:1 mapping) */
    sensitivity: 1,
    /** Ignore orientation angles below this threshold in degrees (noise filter) */
    deadZone: 1.0,
    /** Maximum pan rotation in degrees (clamped to ±this value) */
    maxTiltAngle: 30,
    /** Lerp factor for smoothing pan rotation (0 = frozen, 1 = instant) */
    smoothing: 0.15,
    /** Speed at which food slides along the tilted pan surface (px/sec) */
    foodSlideSpeed: 250,
    /** Radius of the frying pan visual (px in game coordinates) */
    panRadius: 320,
});
