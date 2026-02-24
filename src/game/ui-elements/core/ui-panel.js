import Phaser from "phaser";

export default class UIPanel{
    constructor(scene,x,y){
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.container = scene.add.container(x,y);
        this.container.setDepth(1000);

        this.overlay = scene.add.rectangle(
            0,0,
            scene.scale.width,scene.scale.height,
            0x000000, 0.7
        );

        this.overlay.setInteractive();
        
        this.panelBg = scene.add.rectangle(0,0,400,350,0x222222,1);
        this.panelBg.setStrokeStyle(4,0xffffff);

        this.container.add([this.overlay, this.panelBg]);

        this.hide();
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
        this.container.setVisible(false);
    }
    destroy(){
        this.container.destroy();
    }
}