// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'ภาพสะท้อน',
    description: 'เกมจัดวางของให้สมมาตรกัน',
    instructions: 'จัดของให้สมมาตรกัน ตามการสะท้อนของกระจก',
    titleFontSize: '80px',
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => {
        if (level === 1) return 'ตาราง 4x4 / สะท้อน 2 ทิศทาง';
        if (level === 2) return 'ตารางใหญ่ขึ้น / สะท้อน 4 ทิศทาง';
        return 'ตารางใหญ่สุด / สะท้อนหลายรูปแบบ';
    },
    // Panel colour tokens — override the shared CSS defaults for this game
    panelBorderColor: '#DB4670',
    panelHeaderColor: '#FF5585',
    // Font colour tokens
    primaryFontColor: '#A83855',
    secondaryFontColor: '#F26A8D',
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    // Panel colour tokens for the game-over result panel
    panelBorderColor: '#DB4670',
    panelHeaderColor: '#FF5585',
    // Font colour tokens
    primaryFontColor: '#A83855',
    secondaryFontColor: '#F26A8D',
});

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------
export const SampleConstants = Object.freeze({
    VARIABLE1: "Testing..."
})
export const Difficulty = Object.freeze({
    EASY: 'Easy',
    NORMAL: 'Normal',
    HARD: 'Hard'
});

export const DifficultyLevelNumber = Object.freeze({
    [Difficulty.EASY]: 1,
    [Difficulty.NORMAL]: 2,
    [Difficulty.HARD]: 3,
});

export function getDifficultyLevelNumber(difficulty) {
    return DifficultyLevelNumber[difficulty] || Number(difficulty) || 1;
}

export const Config = Object.freeze({
    MaxRound: {
        [Difficulty.EASY]: 3,
        [Difficulty.NORMAL]: 5,
        [Difficulty.HARD]: 5
    },
    IncreaseScore: {
        [Difficulty.EASY]: 100,
        [Difficulty.NORMAL]: 200,
        [Difficulty.HARD]: 300
    },
    DecreaseScore: {
        [Difficulty.EASY]: 20,
        [Difficulty.NORMAL]: 50,
        [Difficulty.HARD]: 100
    },
    TimeLimitMs: 180000 // 3 Minutes
});

export const GameLevels = {
    [Difficulty.EASY]: [
        {
            GRIDCONFIG:{
                width: 900,
                height: 900,
                columns: 6,
                rows:6,
                padding:0,
                showSymmetryLine:true,
                symmetryType:'vertical' //Possible Config (vertical,horizontal,both)
            },
            LEVEL:[ // When making a level be sure to order the line by X axis
                {POS: {X:0,Y:0}, Type: "Rectangle", Color: 0xff0000, DRAGGABLE: false},
                {POS: {X:0,Y:5}, Type: "Rectangle", Color: 0x00ff00, DRAGGABLE: false},
                {POS: {X:2,Y:2}, Type: "Rectangle", Color: 0x0000ff, DRAGGABLE: false},
                {POS: {X:2,Y:3}, Type: "Rectangle", Color: 0xffff00, DRAGGABLE: false},
                {POS: {X:3,Y:2}, Type: "Rectangle", Color: 0xffff00, DRAGGABLE: true},
                {POS: {X:3,Y:3}, Type: "Rectangle", Color: 0x0000ff, DRAGGABLE: true},
                {POS: {X:5,Y:0}, Type: "Rectangle", Color: 0x00ff00, DRAGGABLE: true},
                {POS: {X:5,Y:5}, Type: "Rectangle", Color: 0xff0000, DRAGGABLE: true}
            ],
            SOLUTION:[ // When making a level solution be sure to order the line by X axis
                {POS: {X:3,Y:2}, Type: "Rectangle", Color: 0x0000ff},
                {POS: {X:3,Y:3}, Type: "Rectangle", Color: 0xffff00},
                {POS: {X:5,Y:0}, Type: "Rectangle", Color: 0xff0000},
                {POS: {X:5,Y:5}, Type: "Rectangle", Color: 0x00ff00}
            ]
        }
    ]
}
