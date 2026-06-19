import Entity from "../entity";
import EmojiRenderer from "../../components/scripts/emoji-renderer";
import Clickable from "../../components/scripts/clickable";
import TriggerListener from "../../components/scripts/trigger-listener";
import { FoodTypes, FoodSpriteLibrary } from "../../constants";
import SpriteRenderer from "../../components/scripts/sprite-renderer";
import ShadowComponent from "../../components/scripts/shadow";
import TextPopup from "./popup-text";

export default class Fruit extends Entity {
    constructor(scene, x, y, converyerBelt = null, sizeScale = 1) {
        super(scene, x, y, null);

        //this.setScale(1.5);
        //this.refreshBody();

        this.converyerBelt = converyerBelt;

        //Random Food Type
        const _typeValues = Object.values(FoodTypes);
        this.currentFoodType = Phaser.Math.RND.pick(_typeValues);
        //console.log(this.currentFoodType);

        //Random Food Sprite
        const _spriteOptions = FoodSpriteLibrary[this.currentFoodType];
        this.foodSprite = Phaser.Math.RND.pick(_spriteOptions);

        // this.addComponent(EmojiRenderer,{
        //     emojiSprite: this.foodSprite,
        //     sizeScale:sizeScale
        // });
        this.addComponent(SpriteRenderer, {
            textureKey: this.foodSprite,
            sizeScale: sizeScale
        })
        this.addComponent(Clickable, {
            onClickAction: (entity) => {
                //console.log("You clicked the food!");
                entity.emit('itemSorted');
                entity.disableInteractive();
                entity.setCollideWorldBounds(false);

                const _direction = Phaser.Math.RND.pick([-1, 1]);
                const _speed = 300;

                entity.setVelocityY(0);
                entity.setVelocityX(_speed * _direction);
                this.killTimer = this.scene.time.addEvent({
                    delay: 1000, //ms
                    callback: this.destroy,
                    callbackScope: this,
                    loop: false
                })
                if (!this.converyerBelt.onRemoveFood(this.currentFoodType)) {
                    new TextPopup(this.scene, this.x, this.y, "ทิ้งทำไม", "#ff0000");
                }
            }
        })

        this.addComponent(TriggerListener, converyerBelt.animal, (other) => {
            if (other.onEat) {
                other.onEat(this.currentFoodType);
            }
            this.destroy();
        })

        this.addComponent(ShadowComponent, { radius: 100, alpha: 0.2, offset: - 25 });

        this.setCollideWorldBounds(true);
    }
    destroy() {
        super.destroy();
        if (this.onDestroy) {
            this.onDestroy();
        }
    }
}