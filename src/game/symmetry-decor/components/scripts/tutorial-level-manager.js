import Phaser from "phaser";
import TutorialHand from "./tutorial-hand";
import SocketComponent from "./socket";
import SolutionSocketComponent from "./solutionSocket";
import DraggableDataComponent from "./draggableData";
import { EventBus } from "../../../../core/EventBus";

export default class TutorialLevelManager {
    constructor(scene, grid, levelData, solution, symmetryType, config) {
        this.scene = scene;
        this.grid = grid;
        this.levelData = levelData;
        this.solution = solution;
        this.symmetryType = symmetryType;
        this.config = config;

        this.tutorialHand = null;
        this.isActive = false;
        this.currentGuidedItem = null;
        this.itemsCorrectlyPlaced = 0;
        this.totalItems = this.config.itemCount;

        this.textOverlay = null;

        // Bind listeners
        this._onSocketFilled = this._onSocketFilled.bind(this);
    }

    start() {
        this.isActive = true;

        if (!this.tutorialHand) {
            this.tutorialHand = new TutorialHand(
                this.scene,
                this.grid,
                this.levelData,
                this.solution,
                this.symmetryType,
                this.config
            );
        }

        this.scene.events.on('socketFilled', this._onSocketFilled);

        // Start guiding the first item
        this._guideNextItem();
    }

    _guideNextItem() {
        if (!this.isActive) return;

        // Find next unsolved item
        const pair = this.tutorialHand.findTutorialPair();
        if (!pair || !pair.sourceEntity || !pair.targetGridPos) {
            // No more unsolved items!
            this._onAllComplete();
            return;
        }

        this.currentGuidedItem = pair.sourceEntity;

        if (this.config.semiBlocking) {
            // Disable all draggables
            this._disableAllDraggables();
            
            // Show hand with callback to enable drag on this specific item after 1 loop
            this.tutorialHand.showWithCallback(
                pair.sourceEntity, 
                pair.targetGridPos, 
                pair.textureKey, 
                () => {
                    this._enableDraggable(pair.sourceEntity);
                }
            );
        } else {
            // Non-blocking: items are already draggable, just show hand
            this.tutorialHand.showForPair(pair.sourceEntity, pair.targetGridPos, pair.textureKey);
        }

        if (this.config.showTextOverlay) {
            this._showTextOverlay(pair.sourceEntity);
        }
    }

    _disableAllDraggables() {
        for (let i = 0; i < this.grid.cols; i++) {
            for (let j = 0; j < this.grid.rows; j++) {
                const cell = this.grid.getEntityAt(i, j);
                if (!cell) continue;

                const socket = cell.getComponent(SocketComponent);
                if (socket && socket.occupant) {
                    const occupant = socket.occupant;
                    if (occupant.getComponent(DraggableDataComponent)) {
                        occupant.disableInteractive();
                    }
                }
            }
        }
    }

    _enableDraggable(entity) {
        if (entity && entity.getComponent(DraggableDataComponent)) {
            entity.setInteractive();
            this.scene.input.setDraggable(entity);
        }
    }

    _onSocketFilled(socketComponent, entity) {
        if (!this.isActive) return;

        const draggableData = entity.getComponent(DraggableDataComponent);
        if (!draggableData) return;

        const solutionSocket = socketComponent.entity.getComponent(SolutionSocketComponent);
        
        if (solutionSocket && solutionSocket.checkEntity(draggableData)) {
            // Correct placement!
            this.itemsCorrectlyPlaced++;

            // Visual feedback
            EventBus.emit('audio:play', 'symmetry-decor:correct');
            
            // Update visual score (not logged to DB)
            const currentScore = this.itemsCorrectlyPlaced * 5;
            EventBus.emit('minigame:score', { score: currentScore });

            // Dismiss current hand and text
            this.tutorialHand.dismiss();
            this._hideTextOverlay();

            // Wait a bit, then guide the next one
            this.scene.time.delayedCall(this.config.handDelayMs, () => {
                this._guideNextItem();
            });
        }
        // If wrong, draggable component will snap it back naturally because the slot dropZone is false.
    }

    _onAllComplete() {
        this.isActive = false;
        
        // Mark tutorial as completed
        localStorage.setItem(this.config.localStorageKey, 'true');

        // Let the scene know it's done
        this.scene.events.emit('tutorial-level-complete');
    }

    _showTextOverlay(sourceEntity) {
        this._hideTextOverlay();

        const sourcePos = new Phaser.Math.Vector2();
        sourceEntity.getWorldTransformMatrix().transformPoint(0, 0, sourcePos);

        this.textOverlay = this.scene.add.text(
            this.grid.gridWidth / 2 + this.grid.x,
            sourcePos.y - 80, 
            this.config.textOverlayContent, 
            {
                fontFamily: 'Baloo 2, Noto Sans Thai',
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 16, y: 8 }
            }
        ).setOrigin(0.5);
        this.textOverlay.setDepth(2100);

        // Simple bounce animation
        this.scene.tweens.add({
            targets: this.textOverlay,
            y: this.textOverlay.y - 10,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut'
        });
    }

    _hideTextOverlay() {
        if (this.textOverlay) {
            this.textOverlay.destroy();
            this.textOverlay = null;
        }
    }

    destroy() {
        this.isActive = false;
        this.scene.events.off('socketFilled', this._onSocketFilled);
        
        if (this.tutorialHand) {
            this.tutorialHand.destroy();
            this.tutorialHand = null;
        }

        this._hideTextOverlay();
    }
}
