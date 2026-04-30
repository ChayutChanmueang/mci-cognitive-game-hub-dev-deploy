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
