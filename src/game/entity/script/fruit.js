import Entity from "../entity";
import EmojiRenderer from "../../components/scripts/emoji-renderer";
import Clickable from "../../components/scripts/clickable";
import TriggerListener from "../../components/scripts/trigger-listener";
import { FoodTypes, FoodSpriteLibrary } from "../../constants";

export default class Fruit extends Entity{
    constructor(scene,x,y,converyerBelt = null,sizeScale = 1){
        super(scene,x,y,null);

        this.setScale(1.5);
        //this.refreshBody();

        this.converyerBelt = converyerBelt;

        //Random Food Type
        const _typeValues = Object.values(FoodTypes);
        this.currentFoodType = Phaser.Math.RND.pick(_typeValues);
        //console.log(this.currentFoodType);

        //Random Food Sprite
        const _spriteOptions = FoodSpriteLibrary[this.currentFoodType];
        this.foodSprite = Phaser.Math.RND.pick(_spriteOptions);

        this.addComponent(EmojiRenderer,{
            emojiSprite: this.foodSprite,
            sizeScale:sizeScale
        });
        this.addComponent(Clickable,{
            onClickAction: (entity) => {
            //console.log("You clicked the food!");
            entity.emit('itemSorted');
            entity.disableInteractive();

            const _direction = Phaser.Math.RND.pick([-1,1]);
            const _speed = 300;

            entity.setVelocityY(0);
            entity.setVelocityX(_speed * _direction);
            this.killTimer = this.scene.time.addEvent({
                    delay: 1000, //ms
                    callback: this.destroy,
                    callbackScope: this,
                    loop: false
                })
            this.converyerBelt.onRemoveFood(this.currentFoodType);
            }
        })
        // this.addComponent(TriggerListener,this.scene.lava,(other) => {
        //     console.log("Touched the lava! Destroying food...");
        //     this.destroy();
        // })

        this.addComponent(TriggerListener,converyerBelt.animal,(other) => {
            if(other.onEat){
                other.onEat(this.currentFoodType);
            }
            this.destroy();
        })

        this.setCollideWorldBounds(true);
    }
    destroy(){
        super.destroy();
        if(this.onDestroy){
            this.onDestroy();
        }
    }
}