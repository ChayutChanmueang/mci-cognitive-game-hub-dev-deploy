import Component from "../component";
import DraggableDataComponent from "./draggableData";
import SocketComponent from "./socket";
import {ReplayEvent} from "../../../../core/replay-event.js";

export default class DraggableComponent extends Component {
    constructor(entity) {
        super(entity);

        // State tracking
        this.currentSocket = null;
        this.startX = this.entity.x;
        this.startY = this.entity.y;

        this.baseDepth = 10;
    }
    awake() {
        // Enable interaction and dragging on the parent entity
        this.entity.setInteractive();
        this.scene.input.setDraggable(this.entity);

        this.entity.setDepth(this.baseDepth);

        this.setupDragEvents();
    }
    setupDragEvents() {
        this.entity.on('dragstart', () => {
            // Save starting coordinates in case of rejection
            this.startX = this.entity.x;
            this.startY = this.entity.y;
            this.entity.setDepth(1000); // Bring to front

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
            const targetSocket = dropZoneEntity.getComponent(SocketComponent);

            // If it's not a socket at all, bounce back
            if (!targetSocket) {
                this.snapBack();
                return;
            }

            if (targetSocket.isEmpty() || targetSocket.occupant === this.entity) {
                // SCENARIO 1: The socket is empty (Normal Drop)
                if (this.currentSocket) {
                    this.currentSocket.detach();
                }
                targetSocket.attach(this.entity);
                this.currentSocket = targetSocket;

            } else {
                // SCENARIO 2: The socket is occupied. Let's attempt a swap!
                const targetOccupant = targetSocket.occupant;

                // Check if the occupant is movable by looking for a DraggableComponent
                const occupantDragComponent = targetOccupant.getComponent(DraggableComponent);

                // We can only swap if the occupant is draggable (NOT locked) 
                // AND our current dragging entity actually has an original socket to send them to.
                if (occupantDragComponent && this.currentSocket) {
                    const originalSocket = this.currentSocket;

                    // 1. Detach both entities from their sockets
                    originalSocket.detach();
                    targetSocket.detach();

                    // 2. Put the dragged entity into the target socket
                    targetSocket.attach(this.entity);
                    this.currentSocket = targetSocket;

                    // 3. Send the displaced occupant to our original socket
                    originalSocket.attach(targetOccupant);
                    occupantDragComponent.currentSocket = originalSocket;

                    // 4. Update the displaced occupant's start coordinates so it tweens properly if dragged later
                    occupantDragComponent.startX = originalSocket.entity.x;
                    occupantDragComponent.startY = originalSocket.entity.y;

                } else {
                    // SCENARIO 3: The occupant is Locked, or the swap is invalid. Bounce back!
                    this.snapBack();
                }
                if (this.scene.replayLogger) {
                    this.scene.replayLogger.addAnswerEvent(
                        ReplayEvent.SymmetryDecor.PIECE_DROPPED,
                        this.entity.getComponent(DraggableDataComponent).animal,
                        true,
                    );
                }
            }
        });

        this.entity.on('dragend', (pointer, dragX, dragY, dropped) => {
            this.entity.setDepth(this.baseDepth);

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
