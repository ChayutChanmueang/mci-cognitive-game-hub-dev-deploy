import Phaser from "phaser";
import DraggableDataComponent from "./draggableData";
import SpriteRenderer from "./sprite-renderer";
import SocketComponent from "./socket";
import SolutionSocketComponent from "./solutionSocket";

export default class TutorialHand {
    constructor(scene, grid, levelData, solution, symmetryType, config) {
        this.scene = scene;
        this.grid = grid;
        this.levelData = levelData;
        this.solution = solution;
        this.symmetryType = symmetryType;
        this.config = config;

        this.hand = null;
        this.ghost = null;
        this.highlightRing = null;
        this.tweens = [];
        this.visible = false;
    }

    findTutorialPair() {
        let sourceEntity = null;
        let targetGridPos = null;
        let textureKey = '__DEFAULT';

        for (let i = 0; i < this.grid.cols; i++) {
            for (let j = 0; j < this.grid.rows; j++) {
                const cell = this.grid.getEntityAt(i, j);
                if (!cell) continue;

                const socket = cell.getComponent(SocketComponent);
                if (socket && socket.occupant) {
                    const occupant = socket.occupant;
                    const draggableData = occupant.getComponent(DraggableDataComponent);

                    if (draggableData) {
                        // Check if it is already correctly placed
                        const solution = cell.getComponent(SolutionSocketComponent);
                        if (solution && solution.checkEntity(draggableData)) {
                            continue; // Already correct, ignore
                        }

                        // We found a misplaced draggable item!
                        sourceEntity = occupant;
                        textureKey = draggableData.animal || draggableData.type;

                        // Now find an empty correct slot for it
                        for (let tx = 0; tx < this.grid.cols; tx++) {
                            for (let ty = 0; ty < this.grid.rows; ty++) {
                                const targetCell = this.grid.getEntityAt(tx, ty);
                                if (!targetCell) continue;

                                const targetSocket = targetCell.getComponent(SocketComponent);
                                const targetSolution = targetCell.getComponent(SolutionSocketComponent);

                                if (targetSocket && targetSolution && targetSolution.checkEntity(draggableData)) {
                                    // Make sure it doesn't already have a correct occupant
                                    let isOccupiedCorrectly = false;
                                    if (targetSocket.occupant) {
                                        const occData = targetSocket.occupant.getComponent(DraggableDataComponent);
                                        if (occData && targetSolution.checkEntity(occData)) {
                                            isOccupiedCorrectly = true;
                                        }
                                    }

                                    if (!isOccupiedCorrectly) {
                                        targetGridPos = { x: tx, y: ty };
                                        break;
                                    }
                                }
                            }
                            if (targetGridPos) break;
                        }

                        if (sourceEntity && targetGridPos) {
                            return { sourceEntity, targetGridPos, textureKey };
                        }
                    }
                }
            }
        }
        
        return { sourceEntity, targetGridPos, textureKey };
    }

    show() {
        const { sourceEntity, targetGridPos, textureKey } = this.findTutorialPair();
        this.showForPair(sourceEntity, targetGridPos, textureKey);
    }

    showForPair(sourceEntity, targetGridPos, textureKey, onLoopComplete = null) {
        if (this.visible) return;
        if (!sourceEntity || !targetGridPos) {
            console.warn("TutorialHand: Missing source or target for demonstration");
            return;
        }

        this.visible = true;

        // Calculate positions relative to scene
        const sourcePos = new Phaser.Math.Vector2();
        sourceEntity.getWorldTransformMatrix().transformPoint(0, 0, sourcePos);

        const targetCell = this.grid.getEntityAt(targetGridPos.x, targetGridPos.y);
        const targetPos = new Phaser.Math.Vector2();
        targetCell.getWorldTransformMatrix().transformPoint(0, 0, targetPos);

        // Hand
        this.hand = this.scene.add.image(sourcePos.x, sourcePos.y, 'tutorial_hand');
        this.hand.setDepth(2000);
        this.hand.setAngle(-45); // Pointing down-left
        this.hand.setAlpha(0);
        this.hand.setOrigin(0, 0); // Origin at top-left (finger tip)

        if (this.config.animationStyle === 'ghost-preview') {
            // Ghost
            this.ghost = this.scene.add.image(sourcePos.x, sourcePos.y, textureKey);
            this.ghost.setDepth(1999);
            this.ghost.setAlpha(0);
            
            // Try to match the scale of the original item
            const spriteRenderer = sourceEntity.getComponent(SpriteRenderer);
            if (spriteRenderer) {
                this.ghost.setScale(spriteRenderer.sizeScale);
            }

            this._animateGhostPreview(sourcePos, targetPos, onLoopComplete);
        } else {
            this._animateHandOnly(sourcePos, targetPos, onLoopComplete);
        }
        
        this._showHighlightRing(targetPos);
    }

    showWithCallback(sourceEntity, targetGridPos, textureKey, onLoopComplete) {
        this.showForPair(sourceEntity, targetGridPos, textureKey, onLoopComplete);
    }

    _showHighlightRing(targetPos) {
        this.highlightRing = this.scene.add.graphics();
        this.highlightRing.lineStyle(6, 0xffff00, 0.8);
        this.highlightRing.strokeCircle(0, 0, 40); // 40px radius
        this.highlightRing.setPosition(targetPos.x, targetPos.y);
        this.highlightRing.setDepth(1998);

        const ringTween = this.scene.tweens.add({
            targets: this.highlightRing,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            duration: 600,
            ease: 'Sine.easeInOut'
        });
        this.tweens.push(ringTween);
    }

    _animateHandOnly(sourcePos, targetPos, onLoopComplete) {
        // Continuous subtle pulse
        const pulseTween = this.scene.tweens.add({
            targets: this.hand,
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            duration: 400,
            ease: 'Sine.easeInOut'
        });
        this.tweens.push(pulseTween);

        // Movement sequence using chain
        const chain = this.scene.tweens.chain({
            targets: this.hand,
            loop: -1,
            tweens: [
                {
                    duration: 10,
                    x: sourcePos.x,
                    y: sourcePos.y
                },
                {
                    alpha: 1,
                    duration: 300
                },
                {
                    alpha: 1,
                    duration: 200 // Pause
                },
                {
                    x: targetPos.x,
                    y: targetPos.y,
                    duration: 1000,
                    ease: 'Sine.easeInOut'
                },
                {
                    alpha: 1,
                    duration: 200 // Pause at target
                },
                {
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        if (onLoopComplete && !hasCalledBack) {
                            hasCalledBack = true;
                            onLoopComplete();
                        }
                    }
                }
            ]
        });

        this.tweens.push(chain);
    }

    _animateGhostPreview(sourcePos, targetPos, onLoopComplete) {
        // Continuous subtle pulse for hand
        const pulseTween = this.scene.tweens.add({
            targets: this.hand,
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            duration: 400,
            ease: 'Sine.easeInOut'
        });
        this.tweens.push(pulseTween);

        let hasCalledBack = false;

        // Movement sequence using chain
        const chain = this.scene.tweens.chain({
            targets: [this.hand, this.ghost],
            loop: -1,
            tweens: [
                {
                    duration: 10,
                    x: sourcePos.x,
                    y: sourcePos.y
                },
                {
                    alpha: (target) => target === this.hand ? 1 : 0.5,
                    duration: 300
                },
                {
                    alpha: (target) => target === this.hand ? 1 : 0.5,
                    duration: 200 // Pause
                },
                {
                    x: targetPos.x,
                    y: targetPos.y,
                    duration: 1000,
                    ease: 'Sine.easeInOut'
                },
                {
                    // Flash ghost
                    alpha: (target) => target === this.hand ? 1 : 0.8,
                    duration: 100,
                    yoyo: true,
                    hold: 100
                },
                {
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        if (onLoopComplete && !hasCalledBack) {
                            hasCalledBack = true;
                            onLoopComplete();
                        }
                    }
                }
            ]
        });

        this.tweens.push(chain);
    }

    dismiss() {
        if (!this.visible) return;
        this.visible = false;

        // Stop tweens
        for (const tween of this.tweens) {
            if (tween && typeof tween.stop === 'function') {
                tween.stop();
            } else if (tween && typeof tween.destroy === 'function') {
                tween.destroy();
            }
        }
        this.tweens = [];

        // Fade out and destroy
        const targets = [];
        if (this.hand) targets.push(this.hand);
        if (this.ghost) targets.push(this.ghost);
        if (this.highlightRing) targets.push(this.highlightRing);

        if (targets.length > 0) {
            this.scene.tweens.add({
                targets: targets,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    this.destroy();
                }
            });
        }
    }

    isVisible() {
        return this.visible;
    }

    destroy() {
        if (this.hand) {
            this.hand.destroy();
            this.hand = null;
        }
        if (this.ghost) {
            this.ghost.destroy();
            this.ghost = null;
        }
        if (this.highlightRing) {
            this.highlightRing.destroy();
            this.highlightRing = null;
        }
        for (const tween of this.tweens) {
             if (tween && typeof tween.stop === 'function') {
                tween.stop();
            } else if (tween && typeof tween.destroy === 'function') {
                tween.destroy();
            }
        }
        this.tweens = [];
        this.visible = false;
    }
}
