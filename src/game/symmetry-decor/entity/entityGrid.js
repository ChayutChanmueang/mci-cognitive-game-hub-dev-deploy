import Phaser from "phaser";

export default class EntityGrid extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        this.scene = scene;

        // 1. Define the total bounds and grid dimensions
        this.gridWidth = config.width || 1000;
        this.gridHeight = config.height || 1000;
        this.cols = config.columns || 10;
        this.rows = config.rows || 10;
        this.padding = config.padding || 0;
        this.gridConfig = config;

        // 2. Calculate the exact cell size to fit the bounds
        this._calculateCellDimensions();

        // Internal tracker for the grid
        this.gridEntities = [];

        scene.add.existing(this);

        this.drawGridBackground();

        // 3. Draw the symmetry line if configured
        if (config.showSymmetryLine) {
            this.drawSymmetryLine(config.symmetryType || 'vertical');
        }
    }

    _calculateCellDimensions() {
        // Total padding space needed = padding * (number of gaps)
        const totalPaddingX = this.padding * (this.cols - 1);
        const totalPaddingY = this.padding * (this.rows - 1);

        // Cell size = (Total Available Space - Total Padding Space) / Number of Cells
        this.cellWidth = (this.gridWidth - totalPaddingX) / this.cols;
        this.cellHeight = (this.gridHeight - totalPaddingY) / this.rows;
    }

    addEntityAt(gridX, gridY, entity) {
        // Prevent adding outside the defined columns/rows bounds
        if (gridX >= this.cols || gridY >= this.rows || gridX < 0 || gridY < 0) {
            console.warn(`Cannot add entity at ${gridX},${gridY}. Out of grid bounds!`);
            return null;
        }

        if (!this.gridEntities[gridY]) {
            this.gridEntities[gridY] = [];
        }

        // Calculate local pixel coordinates
        const localX = (gridX * (this.cellWidth + this.padding)) + (this.cellWidth / 2);
        const localY = (gridY * (this.cellHeight + this.padding)) + (this.cellHeight / 2);

        // Update the entity's position and scale
        entity.setPosition(localX, localY);
        entity.setDisplaySize(this.cellWidth, this.cellHeight);

        entity.setData('gridX', gridX);
        entity.setData('gridY', gridY);

        this.add(entity);
        this.gridEntities[gridY][gridX] = entity;

        return entity;
    }

    getEntityAt(gridX, gridY) {
        if (this.gridEntities[gridY] && this.gridEntities[gridY][gridX]) {
            return this.gridEntities[gridY][gridX];
        }
        return null;
    }

    removeEntityAt(gridX, gridY) {
        const entity = this.getEntityAt(gridX, gridY);
        if (entity) {
            this.remove(entity);
            this.gridEntities[gridY][gridX] = null;
            entity.setData('gridX', null);
            entity.setData('gridY', null);
        }
        return entity;
    }

    //VISUAL STUFF

    drawSymmetryLine(orientation) {
        const graphics = this.scene.add.graphics();
        const lineColor = 0xe06666; // Coral Red
        const lineThickness = 8;
        const lineAlpha = 1.0;

        graphics.lineStyle(lineThickness, lineColor, lineAlpha);
        graphics.beginPath();

        const midX = this.gridWidth / 2;
        const midY = this.gridHeight / 2;
        const dashLength = 15;
        const gapLength = 10;

        // Vertical Line types
        if (['L-R', 'R-L', 'FOUR_WAY', 'QUADRANT', 'vertical'].includes(orientation)) {
            this._drawDashedLine(graphics, midX, -10, midX, this.gridHeight + 10, dashLength, gapLength);
        }

        // Horizontal Line types
        if (['T-B', 'B-T', 'FOUR_WAY', 'QUADRANT', 'horizontal'].includes(orientation)) {
            this._drawDashedLine(graphics, -10, midY, this.gridWidth + 10, midY, dashLength, gapLength);
        }

        // Diagonal Line
        if (orientation === 'DIAGONAL') {
            this._drawDashedLine(graphics, -10, -10, this.gridWidth + 10, this.gridHeight + 10, dashLength, gapLength);
        }

        graphics.strokePath();

        // Draw an intersection glow/dot for complex symmetries
        if (['FOUR_WAY', 'QUADRANT'].includes(orientation)) {
            graphics.fillStyle(0xffffff, 0.4);
            graphics.fillCircle(midX, midY, 12);
            graphics.fillStyle(lineColor, 1.0);
            graphics.fillCircle(midX, midY, 6);
        }

        graphics.setDepth(50);
        this.add(graphics);
    }

    // --- NEW HELPER METHOD ---
    _drawDashedLine(graphics, x1, y1, x2, y2, dashLength, gapLength) {
        // 1. Calculate the total distance between the two points
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 2. Calculate the normalized direction vector (length of 1)
        const dirX = dx / distance;
        const dirY = dy / distance;

        let currentDist = 0;
        let isDrawing = true;

        // Move to the starting point
        graphics.moveTo(x1, y1);

        // 3. Loop through the distance, alternating between drawing and skipping
        while (currentDist < distance) {
            const step = isDrawing ? dashLength : gapLength;
            currentDist += step;

            // Clamp the distance so we don't draw past the endpoint
            if (currentDist > distance) {
                currentDist = distance;
            }

            const currentX = x1 + (dirX * currentDist);
            const currentY = y1 + (dirY * currentDist);

            if (isDrawing) {
                graphics.lineTo(currentX, currentY); // Draw the dash
            } else {
                graphics.moveTo(currentX, currentY); // Skip the gap
            }

            // Toggle the state for the next loop iteration
            isDrawing = !isDrawing;
        }
    }

    _isReferenceCell(x, y, symmetryType) {
        if (!symmetryType) return false;
        const halfCols = Math.floor(this.cols / 2);
        const halfRows = Math.floor(this.rows / 2);
        switch (symmetryType) {
            case 'L-R': return x < halfCols;
            case 'R-L': return x >= halfCols;
            case 'T-B': return y < halfRows;
            case 'B-T': return y >= halfRows;
            case 'QUADRANT': return (x < halfCols && y < halfRows);
            case 'FOUR_WAY': return (x < halfCols && y < halfRows);
            case 'DIAGONAL': return x < y;
            default: return x < halfCols;
        }
    }

    drawGridBackground() {
        const graphicsBg = this.scene.add.graphics();
        const graphicsBorders = this.scene.add.graphics();

        // --- Styling (Tweak these to match your aesthetic) ---
        const bgColor = 0xffffff;       // White background
        const borderColor = 0xDB4670;   // Outer border color
        const innerBorderColor = 0xF2D0D9;
        const refBorderColor = 0x888888; // Dark grey for reference side
        const outerBorderThickness = 12;
        const innerBorderThickness = 6;
        const cornerRadius = 16;        // How round the outer corners are

        // 1. Draw the main outer rounded rectangle background
        graphicsBg.fillStyle(bgColor, 1.0);
        graphicsBg.fillRoundedRect(0, 0, this.gridWidth, this.gridHeight, cornerRadius);
        graphicsBg.setDepth(-10);
        this.add(graphicsBg);

        // 2. Collect the inner cell border segments grouped by color, so each
        // color needs only a single beginPath/strokePath draw call instead of
        // one per segment (segment count scales with grid size, up to ~60 on
        // a 6x6 grid — batching keeps this to 2 draw calls regardless of size).
        const symType = this.gridConfig ? this.gridConfig.symmetryType : null;
        const normalSegments = [];
        const refSegments = [];

        // Vertical inner lines
        for (let i = 1; i < this.cols; i++) {
            const x = i * (this.cellWidth + this.padding);
            for (let j = 0; j < this.rows; j++) {
                const y1 = j * (this.cellHeight + this.padding);
                const y2 = (j + 1) * (this.cellHeight + this.padding);

                const isRef = this._isReferenceCell(i - 1, j, symType) && this._isReferenceCell(i, j, symType);
                (isRef ? refSegments : normalSegments).push([x, y1, x, y2]);
            }
        }

        // Horizontal inner lines
        for (let j = 1; j < this.rows; j++) {
            const y = j * (this.cellHeight + this.padding);
            for (let i = 0; i < this.cols; i++) {
                const x1 = i * (this.cellWidth + this.padding);
                const x2 = (i + 1) * (this.cellWidth + this.padding);

                const isRef = this._isReferenceCell(i, j - 1, symType) && this._isReferenceCell(i, j, symType);
                (isRef ? refSegments : normalSegments).push([x1, y, x2, y]);
            }
        }

        if (normalSegments.length > 0) {
            graphicsBorders.lineStyle(innerBorderThickness, innerBorderColor, 1.0);
            graphicsBorders.beginPath();
            for (const [sx1, sy1, sx2, sy2] of normalSegments) {
                graphicsBorders.moveTo(sx1, sy1);
                graphicsBorders.lineTo(sx2, sy2);
            }
            graphicsBorders.strokePath();
        }

        if (refSegments.length > 0) {
            graphicsBorders.lineStyle(innerBorderThickness, refBorderColor, 1.0);
            graphicsBorders.beginPath();
            for (const [sx1, sy1, sx2, sy2] of refSegments) {
                graphicsBorders.moveTo(sx1, sy1);
                graphicsBorders.lineTo(sx2, sy2);
            }
            graphicsBorders.strokePath();
        }

        // 3. Draw the outer border on top of everything else
        graphicsBorders.lineStyle(outerBorderThickness, borderColor, 1.0);
        graphicsBorders.strokeRoundedRect(0, 0, this.gridWidth, this.gridHeight, cornerRadius);

        // Put borders at depth 10 so they are above the cell backgrounds (depth 0)
        graphicsBorders.setDepth(10);
        this.add(graphicsBorders);
    }

}