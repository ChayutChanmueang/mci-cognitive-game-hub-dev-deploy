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
