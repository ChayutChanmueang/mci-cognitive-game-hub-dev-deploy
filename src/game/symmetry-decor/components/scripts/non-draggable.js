import Component from "../component";

export default class NonDraggableComponent extends Component{
    constructor(entity, targetSocket) {
        super(entity);
        
        // We pass the socket we want to lock this entity into
        this.targetSocket = targetSocket;
    }

    awake() {
        if (this.targetSocket) {
            // Attach this entity to the socket immediately.
            // This sets targetSocket.occupant = this.entity,
            // which automatically makes targetSocket.isEmpty() return false!
            this.targetSocket.attach(this.entity);
        }

        // Gray out and set opacity to 85% as per user request
        // Making it 0.75 opaque and applying white tint (0xffffff)
        this.entity.setAlpha(0.75);
        this.entity.setTint(0xffffff);
        
        // Make it brighter/darker than original
        if (this.entity.preFX) {
            this.entity.preFX.addColorMatrix().brightness(0.8); // 80% of original brightness
        } else {
            this.entity.setBlendMode(Phaser.BlendModes.SCREEN);
        }
    }
}