export default class UIPanel{
    constructor(scene,x,y,setting = {}){
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.container = scene.add.container(x,y);
        this.container.setDepth(1000);

        const _size = setting.size || {x:500, y:500};
        const _color = setting.primaryColor || 0x222222;
        this.panelBg = scene.add.rectangle(0,0,_size.x,_size.y,_color,1);
        const _strokeEnable = setting.strokeEnable || false;
        if(_strokeEnable){
            const _strokeColor = setting.strokeColor || 0xffffff;
            const _strokeSize = setting.strokeSize || 4;

            this.panelBg.setStrokeStyle(_strokeSize,_strokeColor);
        }

        this.container.add([this.panelBg]);

    }
    addElements(elements){
        this.container.add(elements);
    }
    forceShow(){
        this.container.setVisible(true);
    }
    forceHide(){
        this.container.setVisible(false);
    }
    destroy(){
        this.container.destroy();
    }
}