import Phaser from "phaser";

export default class ProgressBar{
    constructor(scene,x,y,settings = {}){
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = settings.width || 500;
        this.height = settings.height || 200;
        this.innerColor = settings.innerColor || 0x00ff00;
        this.backgroundColor = settings.backgroundColor || 0xffffff;
        this.borderColor = settings.borderColor || 0x000000;
        this.value = settings.value || 0.5;
        this.enableProgressText = settings.enableProgressText || false;
        
        this.container = scene.add.container(x,y);

        this.bgPanel = scene.add.rectangle(0,0,this.width,this.height,this.backgroundColor,1);
        this.bgPanel.setStrokeStyle(4,this.borderColor);

        this.fillPanel = scene.add.rectangle(-this.width/2,0,this.width,this.height,this.innerColor,1);
        this.fillPanel.setOrigin(0,0.5);

        if(this.enableProgressText){
            this.progressText = scene.add.text(0,0,"0%",{
                fontSize:'32px', color: '0xffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            this.container.add([this.progressText]);
        }

        this.container.add([this.bgPanel,this.fillPanel]);

        this.maxWidth = this.width;

        this.setValue(this.value);
    }

    setValue(value){
        this.value = Math.max(0,Math.min(1,value));

        this.fillPanel.width = this.maxWidth * this.value;

        if(this.enableProgressText){
            this.progressText.setText(`${Math.floor(this.value * 100)}%`)
        }
    }

    getContainer(){
        return this.container;
    }
}