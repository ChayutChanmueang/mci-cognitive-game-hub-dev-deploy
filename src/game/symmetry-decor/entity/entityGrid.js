import Phaser from "phaser";

export default class EntityGrid extends Phaser.GameObjects.Container{
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        this.scene = scene;
        
        // 1. Define the total bounds and grid dimensions
        this.gridWidth = config.width || 1000;
        this.gridHeight = config.height || 1000;
        this.cols = config.columns || 10;
        this.rows = config.rows || 10;
        this.padding = config.padding || 0;

        // 2. Calculate the exact cell size to fit the bounds
        this._calculateCellDimensions();

        // Internal tracker for the grid
        this.gridEntities = [];

        scene.add.existing(this);
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
}