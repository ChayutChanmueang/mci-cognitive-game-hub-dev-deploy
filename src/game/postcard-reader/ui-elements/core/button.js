export default class Button{
    constructor(scene,x,y,settings = {}){
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = settings.width || 500;
        this.height = settings.height || 200;
        this.defaultColor = settings.color || 0x00aa00;
        this.hoverColor = settings.hoverColor || 0x00ff00;
        this.clickColor = settings.clickColor || 0x005500;
        this.labelText = settings.labelText || '';
        this.labelOffset = settings.labelOffset || {x:0,y:0};

        this.isActive = true;

        this.container = scene.add.container(x,y);

        this.uiBackground = scene.add.rectangle(
            0, 0, 
            this.width, this.height, 
            this.defaultColor, 1
        ).setOrigin(0.5).setInteractive({useHandCursor: true});

        this.label = scene.add.text(0+this.labelOffset.x,0+this.labelOffset.y,this.labelText,{
            fontSize: '28px', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add([this.uiBackground,this.label]);

        if(settings.onClick != null){
            this.uiBackground.on('pointerdown',() => {
                settings.onClick();
                this.uiBackground.setFillStyle(this.clickColor);
            });
        }
        else{
            this.uiBackground.on('pointerdown', () => this.uiBackground.setFillStyle(this.clickColor));
        }

        this.uiBackground.on('pointerover', () => this.uiBackground.setFillStyle(this.hoverColor));
        this.uiBackground.on('pointerout', () => this.uiBackground.setFillStyle(this.defaultColor));
        this.uiBackground.on('pointerup', () => this.uiBackground.setFillStyle(this.defaultColor));
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