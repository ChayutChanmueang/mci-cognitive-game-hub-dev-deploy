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

        // Gray out and dim the blocker using alpha + tint only (no WebGL
        // post-FX pass — see symmetry-decor-household's version of this file,
        // which already uses this cheaper approach in production).
        this.entity.setAlpha(0.85);
        this.entity.setTint(0x888888);
    }
}