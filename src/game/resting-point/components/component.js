export default class Component{
    constructor(entity){
        this.entity = entity;
        this.scene = entity.scene;
    }
    //Run once attached to entity
    awake(){}
    //Run every frame
    update(time,delta){}
    //Run when object is deleted
    destroy(){}
}