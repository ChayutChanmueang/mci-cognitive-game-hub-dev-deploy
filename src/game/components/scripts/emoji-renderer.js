import Component from "../component";

export default class EmojiRenderer extends Component{
    constructor(entity, settings){
        super(entity);
        if(settings.emojiSprite){
            this.emojiString = settings.emojiSprite;
        }
        if(settings.size){
            this.fontSize = settings.size;
        }
        else{
            this.fontSize = 64
        }
    }
    awake(){
        this.entity.setAlpha(0.001);
        this.textObj = this.scene.add.text(
            this.entity.x,
            this.entity.y,
            this.emojiString,
            {fontSize: this.fontSize.toString() + 'px'}
        ).setOrigin(0.5);
    }
    update(){
        this.textObj.x = this.entity.x;
        this.textObj.y = this.entity.y;
    }
    destroy(){
        this.textObj.destroy();
    }
    changeSprite(newSprite){
        this.textObj.text = newSprite;
    }
}