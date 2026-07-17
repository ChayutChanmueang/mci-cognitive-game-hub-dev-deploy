import Phaser from "phaser";

export default class Entity extends Phaser.GameObjects.Sprite{
    constructor(scene,x,y,texture = '__DEFAULT'){
        super(scene,x,y,texture);

        scene.add.existing(this);

        this.components = [];

        this.setDataEnabled();
    }
    addComponent(ComponentClass, ...args){
        const _component = new ComponentClass(this, ...args);
        this.components.push(_component);

        if(_component.awake) _component.awake();

        return _component;
    }
    getComponent(ComponentClass){
        return this.components.find(c => c instanceof ComponentClass);
    }
    destroy(fromScene){
        for(const _component of this.components){
            if(_component.destroy){
                _component.destroy();
            }
        }
        this.components = [];
        super.destroy(fromScene);
    }
}