import UIPage from "../core/ui-page";
import {SampleConstants} from "../../constants";
import ProgressBar from "../core/progress-bar";
import { createThaiText } from "../../../../util/thai-text.js";
export default class PostcardPanel extends UIPage{
    constructor(scene){
        super(scene,scene.scale.width/2,scene.scale.height/2,{
            panelPosition: {x:0,y:100},
            overlayEnable: true,
            size: {x:800, y:1400},
            strokeEnable: true
        });

        //Relative to the main container

        this.titleText = createThaiText(
                    scene,
                    0,
                    0,
                    scene.postcardText,
                    {
                        fontSize: "48px",
                        fontStyle: "bold",
                        color: "#ffffff"
                    },
                    { origin: 0.5, wrapWidth: 750 });
        // scene.add.text(0,0,scene.postcardText,{
        //     fontSize: '48px', color:'#ffffff',fontStyle: 'bold'
        // }).setOrigin(0.5);

        this.timerBar = new ProgressBar(scene,0,-725,{width:800,height:50})

        this.countdownString = "จำให้ได้ภายใน ";

        this.countdownText = createThaiText(
                    scene,
                    -400,
                    -875,
                    this.countdownString,
                    {
                        fontSize: "48px",
                        fontStyle: "bold",
                        color: "#ffffff"
                    },
                    { origin: 0, wrapWidth: 750 });
        // scene.add.text(-400,-875,this.countdownString,{
        //     fontSize: '48px', color:'#ffffff',fontStyle: 'bold'
        // }).setOrigin(0,0);

        this.addElements([this.titleText,this.timerBar.getContainer(),this.countdownText]);

        this.countdownTimer = scene.time.addEvent({
            delay: 10000,
            callback: () => {
                this.forceHide();
                this.scene.showGame();
                console.log("hide");
            }
        })
    }

    reinitializedPanel(){
        this.forceShow();
        this.titleText.setText(this.scene.postcardText);
        this.countdownTimer = this.scene.time.addEvent({
            delay: 10000,
            callback: () => {
                this.forceHide();
                this.scene.showGame();
                console.log("hide");
            }
        })
    }

    update(){
        this.countdownText.setText(this.countdownString + Math.trunc(this.countdownTimer.getRemainingSeconds() + 1));
        this.timerBar.setValue(this.countdownTimer.getRemaining() / 10000);
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