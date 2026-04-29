import Component from "../component";

export default class ShadowComponent extends Component {
    constructor(entity, { radius = 40, alpha = 0.3, color = 0x000000, offset = 0 } = {}) {
        super(entity);
        this.radius = radius;
        this.alpha = alpha;
        this.color = color;
        this.offset = offset;
    }

    awake() {
        // Create the graphics object and add to the scene
        this.graphics = this.scene.add.graphics();
        this.graphics.setDepth(this.entity.depth - 1);
        this.drawShadow();
        // Ensure the shadow is rendered behind the animal sprite
        //this.entity.sendToBack(this.graphics);
    }

    drawShadow() {
        this.graphics.clear();
        this.graphics.fillStyle(this.color, this.alpha);
        // Draw an ellipse to simulate depth/perspective
        this.graphics.fillEllipse(0, 0, this.radius * 2, this.radius);
    }

    update() {
        // Sync position with the entity's feet/bottom
        this.graphics.x = this.entity.x;
        this.graphics.y = this.entity.y + (this.entity.displayHeight / 2) - 10 + this.offset;
    }

    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}