const DEFAULT_LEVEL_CONFIG = Object.freeze({
    1: Object.freeze({ rows: 1, columns: 3, name: "Easy" }),
    2: Object.freeze({ rows: 2, columns: 2, name: "Medium" }),
    3: Object.freeze({ rows: 2, columns: 3, name: "Hard" })
});

const DEFAULT_ANIMALS = Object.freeze([
    "🦁", "🐘", "🦒", "🐒", "🦓",
    "🐯", "🦛", "🐼", "🦊", "🐨",
    "🐮", "🐷", "🐸", "🐔", "🐧"
]);

export default class RandomPuzzle{
    constructor(level, options = {}){
        this.level = level;
        this.levelConfig = options.levelConfig ?? DEFAULT_LEVEL_CONFIG;
        this.animals = options.animals ?? DEFAULT_ANIMALS;
        this.random = options.random ?? Math.random;

        const config = this.levelConfig[level];

        if(!config){
            throw new Error(`Invalid zoo-detective level: ${level}`);
        }

        this.config = {
            rows: config.rows,
            columns: config.columns,
            name: config.name ?? `Level ${level}`
        };
    }

    getPuzzle(){
        const totalSlots = this.config.rows * this.config.columns;

        if(this.animals.length < totalSlots){
            throw new Error(`Not enough animals to generate puzzle. Need ${totalSlots}, got ${this.animals.length}.`);
        }

        const availableAnimals = this.shuffle(this.animals).slice(0, totalSlots);
        const solution = this.shuffle(availableAnimals);
        const hints = this.generateHints(solution);

        return {
            level: this.level,
            levelName: this.config.name,
            rows: this.config.rows,
            columns: this.config.columns,
            totalSlots,
            availableAnimals,
            solution,
            hints,
            hintTexts: hints.map((hint) => hint.text)
        };
    }

    generateHints(solution){
        const totalSlots = solution.length;
        const visited = new Set();
        const hints = [];
        const rootIndex = this.randomInt(0, totalSlots - 1);

        visited.add(rootIndex);
        hints.push({
            type: "anchor",
            targetIndex: rootIndex,
            animal: solution[rootIndex],
            position: this.getPositionName(rootIndex),
            text: `${solution[rootIndex]} อยู่ที่ ${this.getPositionName(rootIndex)}`
        });

        while(visited.size < totalSlots - 1){
            const candidates = [];

            for(const sourceIndex of visited){
                candidates.push(...this.getNeighborCandidates(sourceIndex, totalSlots, visited));
            }

            if(candidates.length === 0){
                break;
            }

            const pick = candidates[this.randomInt(0, candidates.length - 1)];

            hints.push({
                type: "relation",
                direction: pick.direction,
                sourceIndex: pick.sourceIndex,
                targetIndex: pick.targetIndex,
                animal: solution[pick.targetIndex],
                referenceAnimal: solution[pick.sourceIndex],
                text: this.getRelationPhrase(
                    pick.direction,
                    solution[pick.targetIndex],
                    solution[pick.sourceIndex]
                )
            });

            visited.add(pick.targetIndex);
        }

        hints.push({
            type: "remaining",
            text: "ตัวที่เหลือให้วางในช่องว่าง"
        });

        return hints;
    }

    getNeighborCandidates(sourceIndex, totalSlots, visited){
        const row = Math.floor(sourceIndex / this.config.columns);
        const column = sourceIndex % this.config.columns;
        const neighbors = [
            {
                targetIndex: sourceIndex - this.config.columns,
                direction: "up",
                isValid: row > 0
            },
            {
                targetIndex: sourceIndex + this.config.columns,
                direction: "down",
                isValid: row < this.config.rows - 1
            },
            {
                targetIndex: sourceIndex - 1,
                direction: "left",
                isValid: column > 0
            },
            {
                targetIndex: sourceIndex + 1,
                direction: "right",
                isValid: column < this.config.columns - 1
            }
        ];

        return neighbors
            .filter((neighbor) => {
                return neighbor.isValid
                    && neighbor.targetIndex >= 0
                    && neighbor.targetIndex < totalSlots
                    && !visited.has(neighbor.targetIndex);
            })
            .map((neighbor) => ({
                sourceIndex,
                targetIndex: neighbor.targetIndex,
                direction: neighbor.direction
            }));
    }

    getPositionName(index){
        const row = Math.floor(index / this.config.columns);
        const column = index % this.config.columns;

        if(this.config.rows === 1){
            const columnNames = ["ซ้าย", "กลาง", "ขวา"];
            return columnNames[column] ?? `คอลัมน์ ${column + 1}`;
        }

        if(this.config.rows === 2 && this.config.columns === 2){
            const rowName = row === 0 ? "บน" : "ล่าง";
            const columnName = column === 0 ? "ซ้าย" : "ขวา";

            return `${columnName}${rowName}`;
        }

        if(this.config.rows === 2 && this.config.columns === 3){
            const rowNames = ["บน", "ล่าง"];
            const columnNames = ["ซ้าย", "กลาง", "ขวา"];

            return `${rowNames[row]}${columnNames[column]}`;
        }

        const rowNames = ["บน", "กลาง", "ล่าง"];
        const columnNames = ["ซ้าย", "กลาง", "ขวา"];
        const rowLabel = rowNames[row] ?? `แถว ${row + 1}`;
        const columnLabel = columnNames[column] ?? `คอลัมน์ ${column + 1}`;

        return `${rowLabel}${columnLabel}`;
    }

    getRelationPhrase(direction, animal, referenceAnimal){
        const phrases = {
            up: `${animal} อยู่บน ${referenceAnimal}`,
            down: `${animal} อยู่ล่าง ${referenceAnimal}`,
            left: `${animal} อยู่ซ้ายของ ${referenceAnimal}`,
            right: `${animal} อยู่ขวาของ ${referenceAnimal}`
        };

        return phrases[direction] ?? `${animal} อยู่ใกล้ ${referenceAnimal}`;
    }

    shuffle(items){
        const result = [...items];

        for(let i = result.length - 1; i > 0; i--){
            const swapIndex = this.randomInt(0, i);
            [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
        }

        return result;
    }

    randomInt(min, max){
        return Math.floor(this.random() * ((max - min) + 1)) + min;
    }
}
