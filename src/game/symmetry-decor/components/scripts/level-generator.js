import { Difficulty } from "../../constants";

export default class LevelGenerator {
    constructor(difficulty = Difficulty.EASY) {
        this.difficulty = difficulty;
        this.availableAssets = [
            'icon_bear',
            'icon_cow',
            'icon_elephant',
            'icon_fox',
            'icon_lion',
            'icon_panda',
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

        // 1. Build cell pools for fixed and draggable positions
        const fixedPool = this.buildCellPool(symmetryType, 'fixed', columns, rows, halfCols, halfRows);
        const dragPool = this.buildCellPool(symmetryType, 'drag', columns, rows, halfCols, halfRows);

        this.shuffle(fixedPool);
        this.shuffle(dragPool);

        // 2. Cap items to available pool size
        //    FOUR_WAY needs 3 drag cells per fixed item; all others need 1
        const mirrorsPerItem = symmetryType === 'FOUR_WAY' ? 3 : 1;
        numItems = Math.min(
            numItems,
            fixedPool.length,
            Math.floor(dragPool.length / mirrorsPerItem),
        );

        // 3. Place items using pools (no collisions possible)
        let dragIdx = 0;

        for (let i = 0; i < numItems; i++) {
            const { x: fixedX, y: fixedY } = fixedPool[i];

            const animal = this.availableAssets[Math.floor(Math.random() * this.availableAssets.length)];
            levelData.push({
                POS: { X: fixedX, Y: fixedY },
                Type: "Rectangle",
                Animal: animal,
                DRAGGABLE: false
            });

            // Calculate mirror targets (solutions)
            const mirrorTargets = this.computeMirrors(symmetryType, fixedX, fixedY, columns, rows);

            for (let target of mirrorTargets) {
                solutionData.push({
                    POS: { X: target.X, Y: target.Y },
                    Type: "Rectangle",
                    Animal: animal
                });
            }

            // Spawn draggable items from the drag pool
            for (let target of mirrorTargets) {
                const { x: dragX, y: dragY } = dragPool[dragIdx++];
                levelData.push({
                    POS: { X: dragX, Y: dragY },
                    Type: "Rectangle",
                    Animal: animal,
                    DRAGGABLE: true
                });
            }
        }

        levelData.sort((a, b) => (a.POS.X === b.POS.X) ? a.POS.Y - b.POS.Y : a.POS.X - b.POS.X);
        solutionData.sort((a, b) => (a.POS.X === b.POS.X) ? a.POS.Y - b.POS.Y : a.POS.X - b.POS.X);

        return { GRIDCONFIG: config, LEVEL: levelData, SOLUTION: solutionData };
    }

    /**
     * Compute the mirror positions for a fixed item based on symmetry type.
     * Returns an array of { X, Y } target positions.
     */
    computeMirrors(symmetryType, fixedX, fixedY, columns, rows) {
        const mirrors = [];

        if (symmetryType === 'T-B' || symmetryType === 'B-T') {
            mirrors.push({ X: fixedX, Y: (rows - 1) - fixedY });
        } else if (symmetryType === 'QUADRANT') {
            mirrors.push({ X: (columns - 1) - fixedX, Y: (rows - 1) - fixedY });
        } else if (symmetryType === 'DIAGONAL') {
            mirrors.push({ X: fixedY, Y: fixedX });
        } else if (symmetryType === 'FOUR_WAY') {
            mirrors.push({ X: (columns - 1) - fixedX, Y: fixedY });
            mirrors.push({ X: fixedX, Y: (rows - 1) - fixedY });
            mirrors.push({ X: (columns - 1) - fixedX, Y: (rows - 1) - fixedY });
        } else { // L-R, R-L
            mirrors.push({ X: (columns - 1) - fixedX, Y: fixedY });
        }

        return mirrors;
    }

    /**
     * Build a pool of valid grid cells for a given symmetry type and role.
     * @param {string} symmetryType - The symmetry mode
     * @param {string} role - 'fixed' (non-draggable source) or 'drag' (draggable spawn)
     * @returns {Array<{x: number, y: number}>} array of valid cell positions
     */
    buildCellPool(symmetryType, role, columns, rows, halfCols, halfRows) {
        const pool = [];

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                if (this.isCellInRegion(symmetryType, role, x, y, halfCols, halfRows)) {
                    pool.push({ x, y });
                }
            }
        }

        return pool;
    }

    /**
     * Check if a cell (x, y) belongs to the valid region for the given
     * symmetry type and role.
     */
    isCellInRegion(symmetryType, role, x, y, halfCols, halfRows) {
        const isFixed = role === 'fixed';

        switch (symmetryType) {
            case 'L-R':
                return isFixed ? x < halfCols : x >= halfCols;
            case 'R-L':
                return isFixed ? x >= halfCols : x < halfCols;
            case 'T-B':
                return isFixed ? y < halfRows : y >= halfRows;
            case 'B-T':
                return isFixed ? y >= halfRows : y < halfRows;
            case 'QUADRANT':
                return isFixed
                    ? (x < halfCols && y < halfRows)
                    : (x >= halfCols && y >= halfRows);
            case 'FOUR_WAY':
                if (isFixed) {
                    return x < halfCols && y < halfRows;
                }
                // Draggables can go in any of the 3 non-fixed quadrants
                return !(x < halfCols && y < halfRows);
            case 'DIAGONAL':
                // Strictly below diagonal (x < y) for fixed,
                // strictly above diagonal (x > y) for drag.
                // Cells ON the diagonal (x == y) are excluded from both.
                return isFixed ? x < y : x > y;
            default:
                return isFixed ? x < halfCols : x >= halfCols;
        }
    }

    /**
     * Fisher-Yates in-place shuffle.
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
