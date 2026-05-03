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
        if(settings.sizeScale){
            this.fontSize*= settings.sizeScale;
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
        // Ensure the text object stays in the same container as the entity to sync coordinates
        if (this.textObj.parentContainer !== this.entity.parentContainer) {
            if (this.entity.parentContainer) {
                this.entity.parentContainer.add(this.textObj);
            } else {
                this.scene.add.existing(this.textObj);
            }
        }

        // Sync local position and depth
        this.syncPos();
        this.textObj.setDepth(this.entity.depth + 1);

        // Eliminate drag lag by syncing immediately on drag events
        this.entity.off('drag', this.syncPos, this);
        this.entity.on('drag', this.syncPos, this);
    }
    syncPos() {
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