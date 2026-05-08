import Entity from "../entity";
import { createThaiText } from "../../../../util/thai-text.js";
export default class TextPopup extends Entity {
  constructor(scene, x, y, text,color = "#ffffff") {
    super(scene, x, y);
    this.pushYSpeed = 5;
    this.body.enable = false;
    
    this.container = scene.add.container(x,y);
    this.text = createThaiText(
      scene,
      0,
      0,
      text,
      {
        fontSize: "48px",
        fontStyle: "bold",
        color: color,
        stroke: '#fff',
        strokeThickness: 10,
      },
      { origin: 0.5, wrapWidth: 750 },
    );
    //this.text.addStrokeColor('#ffffff', 13);
    this.killTimer = this.scene.time.addEvent({
      delay: 500, //ms
      callback: this.destroy,
      callbackScope: this,
      loop: false,
    });
    this.container.add([this.text]);
  }
  preUpdate(time, delta){
    super.preUpdate(time, delta);
    this.y -= this.pushYSpeed;
    this.container.x = this.x;
    this.container.y = this.y;
  }
  destroy(fromScene){
    if (this.container) {
      this.container.destroy();
    }
    super.destroy(fromScene);
  }
}
