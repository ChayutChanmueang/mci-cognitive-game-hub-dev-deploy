import Component from "../component";
import SocketComponent from "./socket";

export default class DraggableComponent extends Component {
    constructor(entity) {
        super(entity);

        // State tracking
        this.currentSocket = null;
        this.startX = this.entity.x;
        this.startY = this.entity.y;
    }
    awake() {
        // Enable interaction and dragging on the parent entity
        this.entity.setInteractive();
        this.scene.input.setDraggable(this.entity);

        this.setupDragEvents();
    }
    setupDragEvents() {
        this.entity.on('dragstart', () => {
            // Save starting coordinates in case of rejection
            this.startX = this.entity.x;
            this.startY = this.entity.y;
            this.entity.setDepth(1); // Bring to front

            // Safely disable physics collisions while being dragged by the mouse
            if (this.entity.body) {
                this.entity.body.enable = false;
            }
        });

        this.entity.on('drag', (pointer, dragX, dragY) => {
            this.entity.setPosition(dragX, dragY);
        });

        this.entity.on('drop', (pointer, dropZoneEntity) => {
            // Fetch the SocketComponent from the Entity we dropped onto
            const socket = dropZoneEntity.getComponent(SocketComponent);

            // Ensure it actually HAS a SocketComponent, then check if it's valid
            if (socket && (socket.isEmpty() || socket.occupant === this.entity)) {

                // 1. Detach from old socket
                if (this.currentSocket) {
                    this.currentSocket.detach();
                }

                // 2. Attach to the new socket
                socket.attach(this.entity);
                this.currentSocket = socket;

            } else {
                // Target is not a socket, or socket is full!
                this.snapBack();
            }
        });

        this.entity.on('dragend', (pointer, dragX, dragY, dropped) => {
            this.entity.setDepth(0); // Reset depth

            // Re-enable physics collisions now that the drag is over
            if (this.entity.body) {
                this.entity.body.enable = true;
            }

            // If dropped in empty space (not on a dropZone)
            if (!dropped) {
                this.snapBack();
            }
        });
    }
    snapBack() {
        this.scene.tweens.add({
            targets: this.entity,
            x: this.startX,
            y: this.startY,
            duration: 150,
            ease: 'Power2'
        });
    }
    destroy() {
        // Clean up memory by removing listeners if the component is destroyed
        this.entity.off('dragstart');
        this.entity.off('drag');
        this.entity.off('drop');
        this.entity.off('dragend');
    }
}