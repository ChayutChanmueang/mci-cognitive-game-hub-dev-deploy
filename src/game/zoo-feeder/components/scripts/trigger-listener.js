import Component from "../component";

export default class TriggerListener extends Component{
    constructor(entity,targetGroup,onTriggerAction){
        super(entity);
        this.targetGroup = targetGroup;
        this.onTriggerAction = onTriggerAction;
    }

    awake(){
        console.log("Trigger attached! Action registered: ", !!this.onTriggerAction);
        this.scene.physics.add.overlap(
            this.entity,
            this.targetGroup,
            this.handleTrigger,
            null,
            this
        );
    }

    handleTrigger(myEntity, otherObject){
        if(this.onTriggerAction){
            this.onTriggerAction(otherObject);
        }
    }
}