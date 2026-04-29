import Entity from "../entity";
import { createThaiText } from "../../../../util/thai-text.js";
export default class TextPopup extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.text = createThaiText(
      scene,
      x,
      y,
      "ทิ้งทำไม",
      {
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ff0000",
      },
      { origin: 0.5, wrapWidth: 750 },
    );
    this.setVelocityY(-25);
    this.killTimer = this.scene.time.addEvent({
      delay: 1000, //ms
      callback: this.destroy,
      callbackScope: this,
      loop: false,
    });
  }
  update(time, delta){
    this.text.x = this.x;
    this.text.y = this.y;
  }
}
