import Component from "../component";

export default class SolutionSocketComponent extends Component{
    constructor(entity, settings){
        super(entity);
        if(settings.Type != null){
            this.type = settings.Type;
        }
        if(settings.Color != null){
            this.color = settings.Color;
        }
    }
    checkEntity(entity){
        if(entity == null) return;
        console.log("Socket Color : " + this.color);
        console.log("Entity Color : " + entity.color);
        console.log("Socket Type : " + this.type);
        console.log("Entity Type : " + entity.type);
        if(entity.type == this.type && entity.color == this.color){
            return true;
        }
        return false;
    }
}