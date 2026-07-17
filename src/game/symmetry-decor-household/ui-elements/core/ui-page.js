export default class UIPage{
    constructor(scene,x,y,setting){
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.container = scene.add.container(x,y);
        this.container.setDepth(1000);

        if(setting.overlayEnable != null && setting.overlayEnable == true){
            this.overlay = scene.add.rectangle(
                0,0,
                scene.scale.width,scene.scale.height,
                0x000000, 0.7
            );
            this.overlay.setInteractive();
            this.container.add([this.overlay]);
        }

        const _panelPosition = setting.panelPosition || {x:0,y:0};
        const _size = setting.size || {x:500, y:500};
        const _color = setting.primaryColor || 0x222222;
        this.panelBg = scene.add.rectangle(_panelPosition.x,_panelPosition.y,_size.x,_size.y,_color,1);
        const _strokeEnable = setting.strokeEnable || false;
        if(_strokeEnable){
            const _strokeColor = setting.strokeColor || 0xffffff;
            const _strokeSize = setting.strokeSize || 4;

            this.panelBg.setStrokeStyle(_strokeSize,_strokeColor);
        }

        this.container.add([this.panelBg]);

        this.forceHide();
    }
    addElements(elements){
        this.container.add(elements);
    }
    show(){
        this.container.setVisible(true);
        this.scene.tweens.add({
            targets: this.container,
            scaleX: {from: 0, to: 1},
            scaleY: {from: 0, to: 1},
            duration: 200,
            ease: 'Back.out'
        });
    }
    hide(){
        this.scene.tweens.add({
            targets: this.container,
            scaleX: {from: 1, to: 0},
            scaleY: {from: 1, to: 0},
            duration: 200,
            ease: 'Back.out',
            onComplete: () =>{
                //console.log("test");
                if(this.onHide){
                    this.onHide();
                }
            }
        });
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