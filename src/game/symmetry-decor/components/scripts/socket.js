import Component from "../component";

export default class SocketComponent extends Component{
    constructor(entity, name = "Unnamed Socket") {
        super(entity);
        this.name = name;
        this.occupant = null;
    }
    awake() {
        // Make the parent entity a valid drop zone
        this.entity.setInteractive();
        this.entity.input.dropZone = true;
    }
    isEmpty() {
        return this.occupant === null;
    }
    attach(targetEntity) {
        this.occupant = targetEntity;

        if (this.entity.parentContainer) {
            this.entity.parentContainer.add(targetEntity);
        }
        
        // Snap the target entity to the center of this socket's entity
        targetEntity.setPosition(this.entity.x, this.entity.y);
        
        // Fire event globally through the scene
        this.scene.events.emit('socketFilled', this, targetEntity);
    }
    detach() {
        this.occupant = null;
    }
    destroy() {
        this.occupant = null;
        // Clean up the drop zone if the component is removed
        if (this.entity.input) {
            this.entity.input.dropZone = false;
        }
    }
}