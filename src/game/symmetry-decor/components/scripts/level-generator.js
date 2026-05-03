import { Difficulty } from "../../constants";

export default class LevelGenerator {
    constructor(difficulty = Difficulty.EASY) {
        this.difficulty = difficulty;
        this.availableAssets = [
            { color: 0xff0000, emoji: '🍎' },
            { color: 0x00ff00, emoji: '🍏' },
            { color: 0x0000ff, emoji: '💎' },
            { color: 0xffff00, emoji: '⭐' },
            { color: 0xff00ff, emoji: '🌸' },
            { color: 0x00ffff, emoji: '❄️' },
            { color: 0xff9900, emoji: '🎃' },
            { color: 0x9900ff, emoji: '🍇' }
        ];
    }

    generate(config, stage = 1) {
        const rows = config.rows || 6;
        const columns = config.columns || 6;
        const halfCols = Math.floor(columns / 2);
        const halfRows = Math.floor(rows / 2);
        const symmetryType = config.symmetryType || 'L-R';

        let levelData = [];
        let solutionData = [];
        let numItems = config.itemCount || 3;

        let usedPositions = new Set();

        for (let i = 0; i < numItems; i++) {
            let fixedX, fixedY;
            let safety = 0;
            
            // 1. Generate Fixed Target
            do {
                if (symmetryType === 'T-B') {
                    fixedX = Math.floor(Math.random() * columns);
                    fixedY = Math.floor(Math.random() * halfRows);
                } else if (symmetryType === 'B-T') {
                    fixedX = Math.floor(Math.random() * columns);
                    fixedY = halfRows + Math.floor(Math.random() * (rows - halfRows));
                } else if (symmetryType === 'R-L') {
                    fixedX = halfCols + Math.floor(Math.random() * (columns - halfCols));
                    fixedY = Math.floor(Math.random() * rows);
                } else if (symmetryType === 'QUADRANT' || symmetryType === 'FOUR_WAY') {
                    fixedX = Math.floor(Math.random() * halfCols);
                    fixedY = Math.floor(Math.random() * halfRows);
                } else if (symmetryType === 'DIAGONAL') {
                    fixedY = Math.floor(Math.random() * rows);
                    fixedX = Math.floor(Math.random() * fixedY);
                } else { // L-R
                    fixedX = Math.floor(Math.random() * halfCols);
                    fixedY = Math.floor(Math.random() * rows);
                }
                safety++;
            } while (usedPositions.has(`${fixedX},${fixedY}`) && safety < 100);
            
            usedPositions.add(`${fixedX},${fixedY}`);

            const asset = this.availableAssets[Math.floor(Math.random() * this.availableAssets.length)];
            levelData.push({ 
                POS: { X: fixedX, Y: fixedY }, 
                Type: "Rectangle", 
                Color: asset.color, 
                Emoji: asset.emoji,
                DRAGGABLE: false 
            });

            // 2. Calculate Mirror Targets (Solutions)
            let mirrorTargets = [];

            if (symmetryType === 'T-B' || symmetryType === 'B-T') {
                mirrorTargets.push({ X: fixedX, Y: (rows - 1) - fixedY });
            } else if (symmetryType === 'QUADRANT') {
                mirrorTargets.push({ X: (columns - 1) - fixedX, Y: (rows - 1) - fixedY });
            } else if (symmetryType === 'DIAGONAL') {
                mirrorTargets.push({ X: fixedY, Y: fixedX });
            } else if (symmetryType === 'FOUR_WAY') {
                mirrorTargets.push({ X: (columns - 1) - fixedX, Y: fixedY });
                mirrorTargets.push({ X: fixedX, Y: (rows - 1) - fixedY });
                mirrorTargets.push({ X: (columns - 1) - fixedX, Y: (rows - 1) - fixedY });
            } else { // L-R
                mirrorTargets.push({ X: (columns - 1) - fixedX, Y: fixedY });
            }

            for (let target of mirrorTargets) {
                solutionData.push({ 
                    POS: { X: target.X, Y: target.Y }, 
                    Type: "Rectangle", 
                    Color: asset.color,
                    Emoji: asset.emoji
                });
            }

            // 3. Spawn Draggable Items
            for (let target of mirrorTargets) {
                let dragX, dragY;
                safety = 0;
                do {
                    if (symmetryType === 'T-B') {
                        dragX = Math.floor(Math.random() * columns);
                        dragY = halfRows + Math.floor(Math.random() * (rows - halfRows));
                    } else if (symmetryType === 'B-T') {
                        dragX = Math.floor(Math.random() * columns);
                        dragY = Math.floor(Math.random() * halfRows);
                    } else if (symmetryType === 'R-L') {
                        dragX = Math.floor(Math.random() * halfCols);
                        dragY = Math.floor(Math.random() * rows);
                    } else if (symmetryType === 'QUADRANT') {
                        dragX = halfCols + Math.floor(Math.random() * (columns - halfCols));
                        dragY = halfRows + Math.floor(Math.random() * (rows - halfRows));
                    } else if (symmetryType === 'DIAGONAL') {
                        dragY = Math.floor(Math.random() * rows);
                        dragX = dragY + 1 + Math.floor(Math.random() * (columns - dragY - 1));
                        if (dragX >= columns) dragX = columns - 1;
                    } else if (symmetryType === 'FOUR_WAY') {
                        let quad = Math.floor(Math.random() * 3);
                        dragX = (quad === 0 || quad === 2) ? halfCols + Math.floor(Math.random() * (columns - halfCols)) : Math.floor(Math.random() * halfCols);
                        dragY = (quad === 1 || quad === 2) ? halfRows + Math.floor(Math.random() * (rows - halfRows)) : Math.floor(Math.random() * halfRows);
                    } else { // L-R
                        dragX = halfCols + Math.floor(Math.random() * (columns - halfCols));
                        dragY = Math.floor(Math.random() * rows);
                    }
                    safety++;
                } while (usedPositions.has(`${dragX},${dragY}`) && safety < 100);

                usedPositions.add(`${dragX},${dragY}`);
                levelData.push({ 
                    POS: { X: dragX, Y: dragY }, 
                    Type: "Rectangle", 
                    Color: asset.color, 
                    Emoji: asset.emoji,
                    DRAGGABLE: true 
                });
            }
        }

        levelData.sort((a, b) => (a.POS.X === b.POS.X) ? a.POS.Y - b.POS.Y : a.POS.X - b.POS.X);
        solutionData.sort((a, b) => (a.POS.X === b.POS.X) ? a.POS.Y - b.POS.Y : a.POS.X - b.POS.X);

        return { GRIDCONFIG: config, LEVEL: levelData, SOLUTION: solutionData };
    }
}
