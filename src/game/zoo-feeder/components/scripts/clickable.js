import Component from "../component";
import Phaser from "phaser";

export default class Clickable extends Component {
    constructor(entity, settings) {
        super(entity);
        this.onClickAction = settings.onClickAction;
        // Allow a scale multiplier for the hitbox (defaults to 1.0 for an exact fit)
        this.hitboxScale = settings.hitboxScale || 1.0; 
    }

    awake() {
        // Calculate the new inflated/deflated dimensions
        const _hitWidth = this.entity.width * this.hitboxScale;
        const _hitHeight = this.entity.height * this.hitboxScale;
        
        // Center the custom geometry by calculating the difference between the actual width and hit width
        const _offsetX = (this.entity.width - _hitWidth) / 2;
        const _offsetY = (this.entity.height - _hitHeight) / 2;

        const _hitbox = new Phaser.Geom.Rectangle(
            _offsetX, 
            _offsetY, 
            _hitWidth, 
            _hitHeight
        );

        this.entity.setInteractive({
            hitArea: _hitbox,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        // Keep debug on so you can verify the green box alignment visually!
        //this.entity.scene.input.enableDebug(this.entity);

        this.entity.on('pointerdown', () => {
            if (this.onClickAction) {
                this.onClickAction(this.entity);
            } else {
                console.error("No onClickAction registered for this entity!");
            }
        });
    }

    destroy() {
        this.entity.off('pointerdown');
    }
}