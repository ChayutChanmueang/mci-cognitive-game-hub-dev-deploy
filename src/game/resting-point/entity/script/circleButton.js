import CircleHitbox from "../../components/scripts/circleHitbox";
import Entity from "../entity";

export default class CircleButton extends Entity{
    constructor(scene,x,y,radius = "50", callback = () => {
        console.log('PRESSED!')
    }){
        super(scene,x,y);

        this.radius = radius;
        const _buttonBorder = scene.add.graphics()
        _buttonBorder.fillStyle(0xffffff,1);
        _buttonBorder.fillCircle(this.x,this.y,this.radius + 15);
        const _button = scene.add.graphics()
        _button.fillStyle(0xff0000,1);
        _button.fillCircle(this.x,this.y,this.radius);

        this.hitbox = new CircleHitbox(this,{radius: this.radius});

        _button.setInteractive(this.hitbox.hitArea, Phaser.Geom.Circle.Contains);

        _button.on('pointerdown', callback);
    }
}