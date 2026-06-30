import Entity from "../entity";
import EmojiRenderer from "../../components/scripts/emoji-renderer";
import Clickable from "../../components/scripts/clickable";
import TriggerListener from "../../components/scripts/trigger-listener";
import { ItemCategory, ItemSpriteLibrary, GameplayMessages } from "../../constants";
import SpriteRenderer from "../../components/scripts/sprite-renderer";
import ShadowComponent from "../../components/scripts/shadow";
import TextPopup from "./popup-text";

export default class FallingItem extends Entity {
    constructor(scene, x, y, converyerBelt = null, sizeScale = 1) {
        super(scene, x, y, null);

        this.converyerBelt = converyerBelt;

        //Random Item Type
        const _typeValues = Object.values(ItemCategory);
        this.currentItemCategory = Phaser.Math.RND.pick(_typeValues);

        //Random Item Sprite
        const _spriteOptions = ItemSpriteLibrary[this.currentItemCategory];
        this.itemSprite = Phaser.Math.RND.pick(_spriteOptions);

        this.addComponent(SpriteRenderer, {
            textureKey: this.itemSprite,
            sizeScale: sizeScale
        })
        this.addComponent(Clickable, {
            onClickAction: (entity) => {
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
                if (!this.converyerBelt.onRemoveItem(this.currentItemCategory)) {
                    new TextPopup(this.scene, this.x, this.y, GameplayMessages.itemDropped, "#ff0000");
                }
            }
        })

        this.addComponent(TriggerListener, converyerBelt.receiver, (other) => {
            if (other.onReceive) {
                other.onReceive(this.currentItemCategory);
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