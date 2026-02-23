import Entity from "../entity";
import EmojiRenderer from "../../components/scripts/emoji-renderer";
import { AnimalSetting } from "../../constants";

export default class Animal extends Entity{
    constructor(scene,x,y){
        super(scene,x,y,null);

        this.randomAnimal()
        this.Sprite = this.addComponent(EmojiRenderer,{
            emojiSprite: this.currentAnimal.Sprite,
            size: 128
        });

        this.setCollideWorldBounds(true);
    }
    onEat(incomingFoodType){
        if(this.currentAnimal.AcceptableFoodType == incomingFoodType){
            //console.log("This is Eatable");
            this.scene.onGetEatableFood();
        }
        else{
            //console.log("I can't eat this");
            this.scene.onGetUneatableFood();
        }
    }
    randomAnimal(){
        const _typeValues = Object.values(AnimalSetting);
        this.currentAnimal = Phaser.Math.RND.pick(_typeValues);
        console.log(this.currentAnimal);
    }
    changeAnimal(){
        this.randomAnimal();
        this.Sprite.changeSprite(this.currentAnimal.Sprite);
    }
}