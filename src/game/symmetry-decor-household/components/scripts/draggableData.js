import Component from "../component";

export default class DraggableDataComponent extends Component{
    constructor(entity, settings){
        super(entity);
        if(settings.Type != null){
            this.type = settings.Type;
        }
        if(settings.Animal != null){
            this.animal = settings.Animal;
        }
    }
}