import UIPanel from "../core/ui-panel";
import {POPUP} from "../../constants";
import { createThaiText, ThaiTextPresets } from "../../../../util/thai-text.js";
export default class TutorialPanel extends UIPanel{
    constructor(scene){
        super(scene,scene.scale.width/2,scene.scale.height/2,800,1000);

        //Relative to the main container

        this.titleText = createThaiText(scene, 0, -350, POPUP.POPUPTITLE, {
            ...ThaiTextPresets.panelTitle,
            color:'#ff4444'
        }, { origin: 0.5 });
        this.titleText.setScale(1.5);

        this.homeBtn = this.createButton(0,350, "START", () => {
            //this.scene.spawnFruit();
            this.hide();
        });

        //Relative to the sub container 1

        this.subContainer1 = scene.add.container(0,0);
        this.subContainer1Panel = scene.add.rectangle(0,0,600,450,0x222222,1);
        this.subContainer1Panel.setStrokeStyle(4,0xffffff);
        this.subText = createThaiText(scene, 0, 100, POPUP.POPUPTEXT, {
            ...ThaiTextPresets.panelBody,
            color:'#ffffff',
            align: 'center'
        }, {
            origin: 0.5,
            wrapWidth: 520
        });
        this.emoji = createThaiText(scene, 0, -110, "🕵️‍♂️🦁", {
            fontSize: "148px",
            fontStyle: "bold",
            color:'#ffffff',
            align: 'center'
        }, {
            origin: 0.5,
            wrapWidth: 680
        });
        this.emoji.setScale(1);
        this.subContainer1.add([this.subContainer1Panel,this.subText,this.emoji]);

        this.addElements([this.titleText,...this.homeBtn,this.subContainer1]);
    }

    createButton(x,y,text,onClick){
        const bg = this.scene.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = createThaiText(this.scene, x, y, text, ThaiTextPresets.buttonLabel, { origin: 0.5 });
        label.setScale(1.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}
