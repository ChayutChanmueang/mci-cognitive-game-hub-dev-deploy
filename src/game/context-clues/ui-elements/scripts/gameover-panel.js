import UIPanel from "../core/ui-panel.js";
import game_db from "/src/util/minigame-db-util.js";

export default class GameOverPanel extends UIPanel{
    constructor(scene){
        super(scene,scene.scale.width/2,scene.scale.height/2,400,450);

        this.panelBg.setScale(1.5);

        this.finalScore = 0;

        this.titleText = scene.add.text(0,-200,"Complete!",{
            fontSize: '48px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);
        this.titleText.setScale(1.5);

        this.scoreText = scene.add.text(0,-70,"Score: 0", {
            fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);
        this.scoreText.setScale(1.5);

        this.highscoreText = scene.add.text(0,0,"Highscore: 0", {
            fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);
        this.highscoreText.setScale(1.5);

        this.homeBtn = this.createButton(0,225, "RETURN", () => {
            this.scene.scene.start('main-menu-scene')

            //Save game data to database
            game_db.pushGameData(this.finalScore, this.scene.level, this.scene.gameStartedAt, this.scene.gameEndedAt).then(() => {
                console.log("Game data saved to database.");
            }).catch((error) => {
                console.error("Failed to save game data:", error);
            });
        });

        this.addElements([this.titleText, this.scoreText, this.highscoreText,...this.homeBtn]);
    }

    setFinalScore(score){
        this.scoreText.setText("Score: " + score);
        this.finalScore = score;
    }
    setHighscore(score){
        this.highscoreText.setText("Highscore: " + score);
    }
    reset(){
        this.setFinalScore(0);
        this.setHighscore(0);
        this.forceHide();
    }

    createButton(x,y,text,onClick){
        const bg = this.scene.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = this.scene.add.text(x,y,text,{
            fontSize: '28px', fontStyle: 'bold'
        }).setOrigin(0.5);
        label.setScale(1.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}
