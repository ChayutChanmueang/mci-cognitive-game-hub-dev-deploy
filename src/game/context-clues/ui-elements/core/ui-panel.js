import Phaser from "phaser";

export default class UIPanel{
    constructor(scene,x,y,sizeX,sizeY, depth = 1000){
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.container = scene.add.container(x,y);
        this.container.setDepth(depth);

        this.overlay = scene.add.rectangle(
            0,0,
            scene.scale.width,scene.scale.height,
            0x000000, 0.7
        );

        this.overlay.setInteractive();
        
        this.panelBg = scene.add.rectangle(0,0,sizeX,sizeY,0x222222,1);
        this.panelBg.setStrokeStyle(4,0xffffff);

        this.container.add([this.overlay, this.panelBg]);

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
    forceHide(){
        this.container.setVisible(false);
    }
    destroy(){
        this.container.destroy();
    }
}