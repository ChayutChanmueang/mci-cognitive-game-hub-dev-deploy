import Component from "../component";

export default class SolutionSocketComponent extends Component{
    constructor(entity, settings){
        super(entity);
        if(settings.Type != null){
            this.type = settings.Type;
        }
        if(settings.Animal != null){
            this.animal = settings.Animal;
        }
    }
    checkEntity(entity){
        if(entity == null) return;
        if(entity.type == this.type && entity.animal == this.animal){
            return true;
        }
        return false;
    }
}