import { createThaiText } from "../../../../util/thai-text";
import UIPage from "../core/ui-page";


export default class GameOverPanel extends UIPage{
    constructor(scene){
        super(scene,scene.scale.width/2,scene.scale.height/2,{
            overlayEnable: true,
            size: {x:400, y:450},
            strokeEnable: true
        });

        this.panelBg.setScale(1.5);

        this.titleText = createThaiText(
                scene,
                0,
                -200,
                "หมดเวลา!",
                {
                  fontSize: "72px",
                  fontStyle: "bold",
                  color: "#ff4444",
                },
                { origin: 0.5},
              );
        
        // scene.add.text(0,-200,"หมดเวลา!",{
        //     fontSize: '72px', color:'#ff4444',fontStyle: 'bold'
        // }).setOrigin(0.5);

        this.scoreText = createThaiText(
                scene,
                0,
                -70,
                "คะแนน: 0",
                {
                  fontSize: "48px",
                  fontStyle: "bold",
                  color: "#ffffff",
                },
                { origin: 0.5},
              );
        
        // scene.add.text(0,-70,"คะแนน: 0", {
        //     fontSize: '48px', color: '#ffffff'
        // }).setOrigin(0.5);

        this.highscoreText = createThaiText(
                scene,
                0,
                0,
                "คะแนนสูงสุด: 0",
                {
                  fontSize: "48px",
                  fontStyle: "bold",
                  color: "#ffffff",
                },
                { origin: 0.5},
              );
        
        // scene.add.text(0,0,"คะแนนสูงสุด: 0", {
        //     fontSize: '48px', color: '#ffffff'
        // }).setOrigin(0.5);

        this.restartBtn = this.createButton(0,125, "เล่นอีกครั้ง", () => {
            console.log("Restarting...");
            if (this.scene.restartGame) {
                this.scene.restartGame();
                return;
            }

            this.scene.scene.restart();
        });

        this.homeBtn = this.createButton(0,225, "กลับหน้าหลัก", () => {
            this.scene.scene.start('main-menu-scene')
        });

        this.addElements([this.titleText, this.scoreText, this.highscoreText, ...this.restartBtn,...this.homeBtn]);
    }

    setFinalScore(score){
        this.scoreText.setText("คะแนน: " + score);
    }
    setHighscore(score){
        this.highscoreText.setText("คะแนนสูงสุด: " + score);
    }
    reset(){
        this.setFinalScore(0);
        this.setHighscore(0);
        this.forceHide();
    }

    createButton(x,y,text,onClick){
        const bg = this.scene.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = createThaiText(
                this.scene,
                x,
                y,
                text,
                {
                  fontSize: "42px",
                  fontStyle: "bold",
                  color: "#ffffff",
                },
                { origin: 0.5},
              );

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}
