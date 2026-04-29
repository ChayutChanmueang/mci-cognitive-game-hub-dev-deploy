import Entity from "../entity";
import EmojiRenderer from "../../components/scripts/emoji-renderer";
import { AnimalSetting } from "../../constants";
import SpriteRenderer from "../../components/scripts/sprite-renderer";
import ShadowComponent from "../../components/scripts/shadow";

export default class Animal extends Entity {
  constructor(scene, x, y, sizeScale = 1) {
    super(scene, x, y, null);
    //this.setOrigin(0.5,1);

    this.randomAnimal();
    // this.Sprite = this.addComponent(EmojiRenderer,{
    //     emojiSprite: this.currentAnimal.Sprite,
    //     size: 128,
    //     sizeScale:sizeScale
    // });

    if (this.currentAnimal.Sprite == "lion_sprite") {
      this.Sprite = this.addComponent(SpriteRenderer, {
        textureKey: this.currentAnimal.Sprite,
        sizeScale: sizeScale,
        offsetY: 30,
      });

      this.setDisplaySize(288, 336);

      this.addComponent(ShadowComponent, {
        radius: 125,
        alpha: 0.2,
        offset: -35,
      });
    } else {
      this.Sprite = this.addComponent(SpriteRenderer, {
        textureKey: this.currentAnimal.Sprite,
        sizeScale: sizeScale,
      });

      this.setDisplaySize(288, 336);

      this.addComponent(ShadowComponent, {
        radius: 125,
        alpha: 0.2,
        offset: -60,
      });
    }

    this.setCollideWorldBounds(true);
  }
  onEat(incomingFoodType) {
    if (this.currentAnimal.AcceptableFoodType == incomingFoodType) {
      //console.log("This is Eatable");
      this.scene.onGetEatableFood();
    } else {
      //console.log("I can't eat this");
      this.scene.onGetUneatableFood();
    }
  }
  randomAnimal() {
    const _typeValues = Object.values(AnimalSetting);
    this.currentAnimal = Phaser.Math.RND.pick(_typeValues);
    console.log(this.currentAnimal);
  }
  changeAnimal() {
    this.randomAnimal();
    this.Sprite.changeSprite(this.currentAnimal.Sprite);
  }
}
