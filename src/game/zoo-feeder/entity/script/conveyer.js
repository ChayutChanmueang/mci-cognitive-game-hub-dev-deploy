import Entity from "../entity";
import Animal from "./animal";
import Fruit from "./fruit";

export default class Conveyer extends Entity {
    constructor(scene, x, y, speed = 150, scale = 1) {
        super(scene, x, y, null);

        this.setVisible(false);
        this.isMoving = true;
        this.speed = speed;
        this.scale = scale;

        const _beltWidth = 250;
        const _beltHeight = 1700;
        const _cornerRadius = 70;

        // 1. Draw the Static Background (Image 2)
        this.beltBackground = scene.add.graphics();
        // Thick light-grey border (Stroke)
        this.beltBackground.lineStyle(12, 0xe0e0e0, 1);
        // Dark grey interior (Fill)
        this.beltBackground.fillStyle(0x383838, 1);

        // Draw the rounded rectangle centered at X, starting at Y
        this.beltBackground.fillRoundedRect(x - _beltWidth / 2, y, _beltWidth, _beltHeight, _cornerRadius);
        this.beltBackground.strokeRoundedRect(x - _beltWidth / 2, y, _beltWidth, _beltHeight, _cornerRadius);
        this.beltBackground.setDepth(-2);

        // 2. Generate the Arrow Texture (Image 3) dynamically
        const _arrowTextureName = 'downArrowGraphic';
        if (!scene.textures.exists(_arrowTextureName)) {
            const arrowGraphics = scene.add.graphics();
            arrowGraphics.fillStyle(0x4a4a4a, 1);

            // Draw a downward-pointing triangle
            // Coordinates: (top-left, top-right, bottom-center)
            arrowGraphics.fillTriangle(20, 10, 80, 10, 50, 40);

            // Save graphics to texture memory (width: 100, height: 100 to give spacing)
            arrowGraphics.generateTexture(_arrowTextureName, 100, 100);
            arrowGraphics.destroy(); // Clean up graphics object
        }

        // 3. Create Scrolling TileSprite for Arrows
        this.conveyerArrows = scene.add.tileSprite(
            x,
            y + (_beltHeight / 2),
            _beltWidth - 150, // Slightly thinner than belt interior
            _beltHeight - 20,
            _arrowTextureName
        );
        this.conveyerArrows.setDepth(-1);

        // Position the animal near the bottom
        this.animal = new Animal(scene, x, y + _beltHeight + 200, 0.9);
        this.foods = [];
    }

    update(time, delta) {
        if (!this.isMoving) return;

        const _deltaInSeconds = delta / 1000;
        const _moveDistance = Math.abs(this.speed) * _deltaInSeconds;

        // Scroll the dynamically generated arrow texture downwards
        this.conveyerArrows.tilePositionY -= _moveDistance;
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
        for (const _food of this.foods) {
            // In Phaser, positive Y velocity moves the physics body DOWN the screen
            _food.setVelocityY(Math.abs(this.speed));
        }
    }

    spawnFoods() {
        // Spawns fruit at the top (this.y)
        const _fruit = new Fruit(this.scene, this.x, this.y + 200, this, 0.75);

        // Ensure initial velocity is pointing downwards
        _fruit.setVelocityY(Math.abs(this.speed));

        this.foods.push(_fruit);
        this.spawnCooldown = 0;

        if (this.spawnTimer != null) {
            this.spawnTimer.delay = this.randomSpawnTime(9, 15) * 100;
        }

        _fruit.once('destroy', () => {
            this.removeFoodFromList(_fruit);
        });
        _fruit.once('itemSorted', () => {
            this.removeFoodFromList(_fruit);
        });
    }

    randomSpawnTime(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    removeFoodFromList(fruit) {
        const index = this.foods.indexOf(fruit);
        if (index > -1) {
            this.foods.splice(index, 1);
        }
    }

    onRemoveFood(foodType) {
        if (foodType == this.animal.currentAnimal.AcceptableFoodType) {
            this.scene.onRemoveEatableFood();
            return false;
        } else {
            this.scene.onRemoveUneatableFood();
            return true;
        }
    }

    addSpeed(addedSpeed) {
        this.setSpeed(this.speed + addedSpeed);
    }

    disableFoodsInput() {
        this.foods.forEach(food => {
            if (food.active) {
                food.disableInteractive();
            }
        });
    }

    stop() {
        this.isMoving = false;
        this.disableFoodsInput();
        if (this.spawnTimer) this.spawnTimer.paused = true;
    }
}