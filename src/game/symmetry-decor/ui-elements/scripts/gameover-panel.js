import { createThaiText } from "../../../../util/thai-text";
import UIPage from "../core/ui-page";
import game_db from "/src/util/minigame-db-util.js";
import { getDifficultyLevelNumber } from "../../constants";

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
                "เย่! ทำได้แล้ว!",
                {
                  fontSize: "72px",
                  fontStyle: "bold",
                  color: "#00ff40",
                },
                { origin: 0.5},
              );
        
        // scene.add.text(0,-200,"หมดเวลา!",{
        //     fontSize: '72px', color:'#ff4444',fontStyle: 'bold'
        // }).setOrigin(0.5);

        this.timeText = createThaiText(
                scene,
                0,
                -50,
                "เวลาที่ใช้: 0 วินาที",
                {
                  fontSize: "48px",
                  fontStyle: "bold",
                  color: "#ffffff",
                },
                { origin: 0.5},
              );
        

        this.restartBtn = this.createButton(0,125, "ไปด่านต่อไป", () => {
            console.log("Restarting...");
            if (this.scene.restartGame) {
                this.scene.restartGame();
                return;
            }

            this.scene.scene.restart();
        });

        this.homeBtn = this.createButton(0,225, "กลับหน้าหลัก", () => {
            this.scene.scene.start('main-menu-scene')

            game_db.pushGameData(0, getDifficultyLevelNumber(scene.level), scene.gameStartedAt, scene.gameEndedAt).then(() => {
                console.log("Game data saved to database.");
            }).catch((error) => {
                console.error("Failed to save game data:", error);
            });
        });

        this.addElements([this.titleText, this.timeText, ...this.restartBtn,...this.homeBtn]);
    }

    setFinalTime(Time){
        this.timeText.setText("เวลาที่ใช้: " + Time + " วินาที");
    }
    reset(){
        this.setFinalTime(0);
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
