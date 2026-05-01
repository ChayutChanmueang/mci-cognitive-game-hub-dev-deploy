import SpriteRenderer from "../../components/scripts/sprite-renderer";
import Entity from "../entity";

export default class EmotePopup extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.popup = this.addComponent(SpriteRenderer, {
            textureKey: 'popup_emote',
            sizeScale: 1
        });
        //this.container = scene.add.container(x, y);
        
        this.happySprite = 'emote_happy';
        this.sadSprite = 'emote_sad';
        
        this.icon = new Entity(scene, x, y);
        this.iconSprite = this.icon.addComponent(SpriteRenderer, {
            textureKey: this.happySprite,
            sizeScale: 1
        });
        
        //this.container.add([this.icon]);

        // Start with scales at 0 so the popup is hidden by default
        this.setScale(0);
        this.icon.setScale(0);

        // State trackers for our tweens and timers
        this.hideTimer = null;
        this.showTween = null;

        //this.showPopup();
    }
    // preUpdate(time, delta) {
    //     // Call the parent Entity preUpdate to ensure components process
    //     super.preUpdate(time, delta);
        
    //     // Continuously sync the container's transform to the main Sprite
    //     if (this.container) {
    //         this.container.x = this.x;
    //         this.container.y = this.y;
    //         this.container.depth = this.depth + 1; // Guarantee icon renders above the bubble
    //     }
    // }

    setHappy() {
        this.iconSprite.changeSprite(this.happySprite);
        this.showPopup();
    }

    setSad() {
        this.iconSprite.changeSprite(this.sadSprite);
        this.showPopup();
    }

    showPopup() {
        if (this.hideTimer) {
            this.hideTimer.remove();
            this.hideTimer = null;
        }

        // Check if fully shown or currently animating using scaleX as the source of truth
        if (this.scaleX > 0 || (this.showTween && this.showTween.isPlaying())) {
            this.scheduleHide();
            return;
        }

        // Explicitly target scaleX and scaleY to ensure both Sprite and Container update
        this.showTween = this.scene.tweens.add({
            targets: [this, this.icon],
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut', 
            onComplete: () => {
                this.scheduleHide();
            }
        });
    }

    scheduleHide() {
        this.hideTimer = this.scene.time.delayedCall(1500, () => {
            // Explicitly scale down the X and Y axes together
            this.scene.tweens.add({
                targets: [this, this.icon],
                scaleX: 0,
                scaleY: 0,
                duration: 250,
                ease: 'Power2.easeIn'
            });
        });
    }
}