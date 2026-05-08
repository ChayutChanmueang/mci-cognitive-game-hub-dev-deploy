import Component from "../component";

export default class CircleHitbox extends Component{
    constructor(entity, settings){
        super(entity,settings);
        if(settings.radius != null || settings.radius != undefined){
            this.radius = settings.radius;
        }
        else{
            this.radius = 50;
        }
        this.hitArea = new Phaser.Geom.Circle(this.entity.x,this.entity.y,this.radius);
    }
}