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
    }
}