import UIPanel from "../core/ui-panel";
import {FoodSpriteLibrary,AnimalSetting, FoodTypes} from "../../constants";

export default class TutorialPanel extends UIPanel{
    constructor(scene){
        super(scene,scene.scale.width/2,scene.scale.height/2,800,1750);

        //Relative to the main container

        this.titleText = scene.add.text(0,-750,"TUTORIAL",{
            fontSize: '48px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);
        this.titleText.setScale(1.5);

        this.homeBtn = this.createButton(0,750, "START", () => {
            //this.scene.spawnFruit();
            this.hide();
        });

        //Relative to the sub container 1

        this.subContainer1 = scene.add.container(0,-425);
        this.subContainer1Panel = scene.add.rectangle(0,0,600,450,0x222222,1);
        this.subContainer1Panel.setStrokeStyle(4,0xffffff);
        this.veggieTitleText = scene.add.text(0,-150,"PLANT EATER",{
            fontSize: '48px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.veggieEater = AnimalSetting.COW.Sprite;
        
        this.veggieEaterText = scene.add.text(0,-50,this.veggieEater,{
            fontSize: '64px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.eat1Text = scene.add.text(0,50,"EAT",{
            fontSize: '48px', color:'#ffffff',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.vegetables = "";

        for(const _vegetable in FoodSpriteLibrary[FoodTypes.VEGETABLE]){
            this.vegetables += FoodSpriteLibrary[FoodTypes.VEGETABLE][_vegetable];
        } 
        
        this.vegetableText = scene.add.text(0,150,this.vegetables,{
            fontSize: '64px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.subContainer1.add([this.subContainer1Panel,this.veggieTitleText,this.veggieEaterText,this.eat1Text,this.vegetableText]);

        //Relative to the sub container 2

        this.subContainer2 = scene.add.container(0,75);
        this.subContainer2Panel = scene.add.rectangle(0,0,600,450,0x222222,1);
        this.subContainer2Panel.setStrokeStyle(4,0xffffff);
        this.meatTitleText = scene.add.text(0,-150,"MEAT EATER",{
            fontSize: '48px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.meatEater = AnimalSetting.LION.Sprite;
        
        this.meatEaterText = scene.add.text(0,-50,this.meatEater,{
            fontSize: '64px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.eat2Text = scene.add.text(0,50,"EAT",{
            fontSize: '48px', color:'#ffffff',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.meats = "";

        for(const _meat in FoodSpriteLibrary[FoodTypes.MEAT]){
            this.meats += FoodSpriteLibrary[FoodTypes.MEAT][_meat];
        } 
        
        this.meatText = scene.add.text(0,150,this.meats,{
            fontSize: '64px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.subContainer2.add([this.subContainer2Panel,this.meatTitleText,this.meatEaterText,this.meatEaterText,this.eat2Text,this.meatText]);

        //Relative to the sub container 3

        this.subContainer3 = scene.add.container(0,500);
        this.subContainer3Panel = scene.add.rectangle(0,0,600,300,0x222222,1);
        this.subContainer3Panel.setStrokeStyle(4,0xffffff);
        this.trashTitleText = scene.add.text(0,-75,"DO NOT EAT",{
            fontSize: '48px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.trashs = "";

        for(const _trash in FoodSpriteLibrary[FoodTypes.JUNK]){
            this.trashs += FoodSpriteLibrary[FoodTypes.JUNK][_trash];
        } 
        
        this.trashText = scene.add.text(0,25,this.trashs,{
            fontSize: '64px', color:'#ff4444',fontStyle: 'bold'
        }).setOrigin(0.5);

        this.subContainer3.add([this.subContainer3Panel,this.trashTitleText,this.trashText]);

        this.addElements([this.titleText,...this.homeBtn,this.subContainer1,this.subContainer2,this.subContainer3]);
    }
    onHide(){
        this.scene.spawnFruit();
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