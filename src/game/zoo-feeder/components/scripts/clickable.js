import Component from "../component";
import Phaser from "phaser";

export default class Clickable extends Component{
    constructor(entity, settings){
        super(entity);
        if(settings.onClickAction){
            this.onClickAction = settings.onClickAction;
        }
        if(settings.size){
            this.size = settings.size;
        }
        else{
            this.size = {x:64,y:64};
        }
    }
    awake(){
        //console.log("Clickable attached! Action registered: ", !!this.onClickAction);

        const _hitbox = new Phaser.Geom.Rectangle(-(this.size.x/4),-(this.size.y/4),this.size.x,this.size.y);

        this.entity.setSize(this.size.x,this.size.y);

        this.entity.setInteractive({
            hitArea: _hitbox,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        this.entity.scene.input.enableDebug(this.entity);

        this.entity.on('pointerdown', () => {
            //console.log("Pointer down detected");

            if(this.onClickAction){
                //console.log("Executing action...");
                this.onClickAction(this.entity);
            }
            else{
                console.error("No onClickAction")
            }
        });
    }
    destroy(){
        this.entity.off('pointerdown');
    }
}