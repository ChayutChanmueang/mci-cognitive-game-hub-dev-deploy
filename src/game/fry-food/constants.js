// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'ทำอาหารแสนอร่อย',
    description: 'เกมทำอาหารเมนูต่างๆ ด้วยการขยับมือถือ',
    instructions: 'เอียงมือถือเพื่อผัดอาหาร เมื่อถึงจังหวะ ให้สบัดมือถือขึ้นเพื่อพลิกอาหาร',
    hideLevelInfo: true,
    coverImage: 'assets/common/cover/cover_fry_food.png',
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
    /** Ignore orientation angles below this threshold in degrees (noise filter) */
    deadZone: 1.0,
    /** Radius of the frying pan visual (px in game coordinates) */
    panRadius: 320,

    // -- Flip Mechanic Settings --
    /** Minimum time to wait before egg is ready to flip (ms) */
    minCookTime: 15000,
    /** Maximum time to wait before egg is ready to flip (ms) */
    maxCookTime: 15000,
    /** How far forward (in degrees) the player must tilt the device to trigger a flip */
    flipThresholdBeta: 15,
});
