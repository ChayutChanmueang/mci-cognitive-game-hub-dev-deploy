import Phaser from "phaser";

export default class SquareGridLayout extends Phaser.GameObjects.Container {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.cells = [];
        this.options = {
            rows: 2,
            columns: 2,
            width: 600,
            height: 600,
            gap: 24,
            padding: 0,
            cellRadius: 24,
            cellFillColor: 0xe3e9f2,
            cellFillAlpha: 1,
            cellStrokeColor: 0x5a697e,
            cellStrokeAlpha: 1,
            cellStrokeWidth: 4
        };

        scene.add.existing(this);
        this.setConfig(options);
    }

    setConfig(options = {}) {
        this.options = {
            ...this.options,
            ...options,
            padding: normalizePadding(options.padding ?? this.options.padding)
        };

        this.rebuild();

        return this;
    }

    setGridSize(rows, columns) {
        return this.setConfig({ rows, columns });
    }

    setBoundsSize(width, height) {
        return this.setConfig({ width, height });
    }

    rebuild() {
        this.removeAll(true);
        this.cells = [];

        const {
            rows,
            columns,
            width,
            height,
            gap,
            padding,
            cellRadius,
            cellFillColor,
            cellFillAlpha,
            cellStrokeColor,
            cellStrokeAlpha,
            cellStrokeWidth
        } = this.options;

        const safeRows = Math.max(1, rows);
        const safeColumns = Math.max(1, columns);
        const innerWidth = Math.max(1, width - padding.left - padding.right);
        const innerHeight = Math.max(1, height - padding.top - padding.bottom);
        const cellSize = Math.floor(Math.min(
            (innerWidth - (gap * (safeColumns - 1))) / safeColumns,
            (innerHeight - (gap * (safeRows - 1))) / safeRows
        ));
        const gridWidth = (cellSize * safeColumns) + (gap * (safeColumns - 1));
        const gridHeight = (cellSize * safeRows) + (gap * (safeRows - 1));
        const offsetX = padding.left + ((innerWidth - gridWidth) / 2);
        const offsetY = padding.top + ((innerHeight - gridHeight) / 2);

        this.setSize(width, height);

        for (let row = 0; row < safeRows; row++) {
            for (let column = 0; column < safeColumns; column++) {
                const index = (row * safeColumns) + column;
                const cellX = offsetX + (column * (cellSize + gap));
                const cellY = offsetY + (row * (cellSize + gap));
                const cellContainer = this.scene.add.container(cellX, cellY);
                const background = this.scene.add.graphics();
                const content = this.scene.add.container(cellSize / 2, cellSize / 2);

                background.fillStyle(cellFillColor, cellFillAlpha);
                background.lineStyle(cellStrokeWidth, cellStrokeColor, cellStrokeAlpha);
                background.fillRoundedRect(0, 0, cellSize, cellSize, cellRadius);
                background.strokeRoundedRect(0, 0, cellSize, cellSize, cellRadius);

                cellContainer.add([background, content]);
                this.add(cellContainer);

                this.cells.push({
                    index,
                    row,
                    column,
                    size: cellSize,
                    x: cellX,
                    y: cellY,
                    centerX: cellX + (cellSize / 2),
                    centerY: cellY + (cellSize / 2),
                    container: cellContainer,
                    background,
                    content
                });
            }
        }

        return this;
    }

    getCell(rowOrIndex, column) {
        if (typeof column === "number") {
            return this.cells.find((cell) => cell.row === rowOrIndex && cell.column === column) ?? null;
        }

        return this.cells[rowOrIndex] ?? null;
    }

    getCells() {
        return [...this.cells];
    }

    addToCell(rowOrIndex, columnOrGameObject, gameObject, destroyExisting = false) {
        let cell = null;
        let target = gameObject;

        if (typeof columnOrGameObject === "number") {
            cell = this.getCell(rowOrIndex, columnOrGameObject);
        }
        else {
            cell = this.getCell(rowOrIndex);
            target = columnOrGameObject;
        }

        if (!cell || !target) {
            return null;
        }

        if (destroyExisting) {
            cell.content.removeAll(true);
        }

        if (target.setPosition) {
            target.setPosition(0, 0);
        }

        cell.content.add(target);

        return cell;
    }

    clearCell(rowOrIndex, column, destroyChildren = true) {
        const cell = typeof column === "number"
            ? this.getCell(rowOrIndex, column)
            : this.getCell(rowOrIndex);

        if (!cell) {
            return this;
        }

        cell.content.removeAll(destroyChildren);

        return this;
    }

    clearAllCells(destroyChildren = true) {
        for (const cell of this.cells) {
            cell.content.removeAll(destroyChildren);
        }

        return this;
    }

    getMetrics() {
        return {
            rows: this.options.rows,
            columns: this.options.columns,
            width: this.options.width,
            height: this.options.height,
            cellCount: this.cells.length,
            cellSize: this.cells[0]?.size ?? 0
        };
    }
}

function normalizePadding(padding) {
    if (typeof padding === "number") {
        return {
            top: padding,
            right: padding,
            bottom: padding,
            left: padding
        };
    }

    return {
        top: padding?.top ?? 0,
        right: padding?.right ?? 0,
        bottom: padding?.bottom ?? 0,
        left: padding?.left ?? 0
    };
}
