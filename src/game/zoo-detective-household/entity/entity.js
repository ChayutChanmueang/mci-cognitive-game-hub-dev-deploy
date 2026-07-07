import Phaser from "phaser";

export default class Entity extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,texture = '__DEFAULT'){
        super(scene,x,y,texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

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
    preUpdate(time,delta){
        super.preUpdate(time,delta);

        for(const _component of this.components){
            if(_component.update){
                _component.update(time,delta);
            }
        }
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