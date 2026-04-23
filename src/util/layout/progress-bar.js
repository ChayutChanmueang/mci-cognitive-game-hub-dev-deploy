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
        this.borderWidth = settings.borderWidth ?? 4;
        this.borderRadius = settings.borderRadius ?? 0;
        this.value = settings.value || 0.5;
        this.enableProgressText = settings.enableProgressText || false;
        this.animationDuration = settings.animationDuration || 250;
        this.animationEase = settings.animationEase || "Sine.easeOut";
        this._activeTween = null;
        
        this.container = scene.add.container(x,y);

        this.bgPanel = scene.add.graphics();
        this.fillPanel = scene.add.graphics();

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

    redraw(){
        const radius = Math.max(0, Math.min(this.borderRadius, this.height / 2));
        const fillWidth = this.maxWidth * this.value;

        this.bgPanel.clear();
        this.bgPanel.fillStyle(this.backgroundColor, 1);

        if (radius > 0) {
            this.bgPanel.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, radius);
        } else {
            this.bgPanel.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        if (this.borderWidth > 0) {
            this.bgPanel.lineStyle(this.borderWidth, this.borderColor, 1);
            if (radius > 0) {
                this.bgPanel.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, radius);
            } else {
                this.bgPanel.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            }
        }

        this.fillPanel.clear();
        if (fillWidth <= 0) {
            return this;
        }

        this.fillPanel.fillStyle(this.innerColor, 1);
        const fillRadius = Math.min(radius, fillWidth / 2);
        if (fillRadius > 0) {
            this.fillPanel.fillRoundedRect(-this.width / 2, -this.height / 2, fillWidth, this.height, fillRadius);
        } else {
            this.fillPanel.fillRect(-this.width / 2, -this.height / 2, fillWidth, this.height);
        }

        return this;
    }

    setValue(value){
        this.value = Math.max(0,Math.min(1,value));

        this.redraw();

        if(this.enableProgressText){
            this.progressText.setText(`${Math.floor(this.value * 100)}%`)
        }

        return this;
    }

    animateTo(value, duration = this.animationDuration){
        const targetValue = Phaser.Math.Clamp(value, 0, 1);

        if (this._activeTween) {
            this._activeTween.stop();
        }

        this._activeTween = this.scene.tweens.addCounter({
            from: this.value,
            to: targetValue,
            duration,
            ease: this.animationEase,
            onUpdate: (tween) => {
                this.setValue(tween.getValue());
            },
            onComplete: () => {
                this._activeTween = null;
                this.setValue(targetValue);
            }
        });

        return this;
    }

    fill(duration = this.animationDuration){
        return this.animateTo(1, duration);
    }

    empty(duration = this.animationDuration){
        return this.animateTo(0, duration);
    }

    reset(value = 0){
        if (this._activeTween) {
            this._activeTween.stop();
            this._activeTween = null;
        }

        return this.setValue(value);
    }

    setColors({ innerColor, backgroundColor, borderColor } = {}){
        if (innerColor !== undefined) {
            this.innerColor = innerColor;
        }

        if (backgroundColor !== undefined) {
            this.backgroundColor = backgroundColor;
        }

        if (borderColor !== undefined) {
            this.borderColor = borderColor;
        }

        this.redraw();
        return this;
    }

    getContainer(){
        return this.container;
    }

    destroy(){
        if (this._activeTween) {
            this._activeTween.stop();
            this._activeTween = null;
        }

        this.container.destroy(true);
    }
}
