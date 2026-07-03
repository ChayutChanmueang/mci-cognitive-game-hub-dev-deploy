import Entity from "../entity";
import EmojiRenderer from "../../components/scripts/emoji-renderer";
import { ReceiverSetting, GameplayMessages } from "../../constants";
import SpriteRenderer from "../../components/scripts/sprite-renderer";
import ShadowComponent from "../../components/scripts/shadow";
import TextPopup from "./popup-text";
import EmotePopup from "./emote-popup";

export default class Receiver extends Entity {
  constructor(scene, x, y, sizeScale = 1) {
    super(scene, x, y, null);

    this.sizeScale = sizeScale;

    this.randomizeReceiver();

    const scaleMulti = this.currentReceiver.ScaleMulti || 1;
    const offsetY = this.currentReceiver.OffsetY || 0;
    const shadowOffset = this.currentReceiver.ShadowOffset || -60;

    this.Sprite = this.addComponent(SpriteRenderer, {
      textureKey: this.currentReceiver.Sprite,
      sizeScale: sizeScale * scaleMulti,
      offsetY: offsetY,
    });

    this.Shadow = this.addComponent(ShadowComponent, {
      radius: 125,
      alpha: 0.2,
      offset: shadowOffset,
    });

    this.setCollideWorldBounds(true);

    this.emotePopup = new EmotePopup(scene, x, y - 200);

    console.log("POS : " + this.x + " " + this.y + " " + this.currentReceiver.Sprite);
    this.initialY = this.y;
  }
  
  onReceive(incomingItemCategory) {
    if (this.currentReceiver.AcceptableCategory == incomingItemCategory) {
      this.scene.onGetEatableFood();
      this.emotePopup.setHappy();
    } else {
      new TextPopup(this.scene, this.x, this.y, GameplayMessages.wrongCategory, "#ff0000");
      this.emotePopup.setSad();
      this.scene.onGetUneatableFood();
    }
  }
  
  randomizeReceiver() {
    const _typeValues = Object.values(ReceiverSetting);
    this.currentReceiver = Phaser.Math.RND.pick(_typeValues);
    console.log(this.currentReceiver);
  }
  
  changeReceiver() {
    this.randomizeReceiver();
    this.Sprite.changeSprite(this.currentReceiver.Sprite);

    const scaleMulti = this.currentReceiver.ScaleMulti || 1;
    const offsetY = this.currentReceiver.OffsetY || 0;
    const shadowOffset = this.currentReceiver.ShadowOffset || -60;

    this.setScale(this.sizeScale * scaleMulti);
    this.Sprite.offsetY = offsetY;
    this.Shadow.offset = shadowOffset;

    console.log("POS : " + this.x + " " + this.y + " " + this.currentReceiver.Sprite);

    // Re-sync physics body to match new scale and offset
    this.Sprite.syncPhysicsBody();
  }
}
