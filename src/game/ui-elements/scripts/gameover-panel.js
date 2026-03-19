import UIPanel from "../core/ui-panel";

export default class GameOverPanel extends UIPanel{
    constructor(scene){
        super(scene,scene.scale.width/2,scene.scale.height/2);

        this.titleText = scene.add.text(0,-100,"GAME OVER",{
            fontSize: '48px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scoreText = scene.add.text(0,-30,"Score: 0", {
            fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        this.highscoreText = scene.add.text(0,30,"Highscore: 0", {
            fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);

        this.restartBtn = this.createButton(0,100, "RESTART", () => {
            console.log("Restarting...");
            if (this.scene.restartGame) {
                this.scene.restartGame();
                return;
            }

            this.scene.scene.restart();
        });

        this.addElements([this.titleText, this.scoreText, this.highscoreText, ...this.restartBtn]);
    }

    setFinalScore(score){
        this.scoreText.setText("Score: " + score);
    }
    setHighscore(score){
        this.highscoreText.setText("Highscore: " + score);
    }
    reset(){
        this.setFinalScore(0);
        this.setHighscore(0);
        this.hide();
    }

    createButton(x,y,text,onClick){
        const bg = this.scene.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        const label = this.scene.add.text(x,y,text,{
            fontSize: '28px', fontStyle: 'bold'
        }).setOrigin(0.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}
