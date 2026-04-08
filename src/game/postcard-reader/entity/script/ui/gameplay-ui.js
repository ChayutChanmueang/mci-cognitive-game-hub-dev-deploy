import StorageManager from "../../../../../core/storage-manager";
import GameOverPanel from "../../../ui-elements/scripts/gameover-panel";
import PostcardPanel from "../../../ui-elements/scripts/postcard-panel";
import TemplatePanel from "../../../ui-elements/scripts/template-panel";
import Entity from "../../entity";

export default class GameplayUI extends Entity{
    constructor(scene,x,y){
        super(scene,x,y);
        const _LeftScreenAnchor = 0;
        const _RightScreenAnchor = scene.scale.width;
        const _TopScreenAnchor = 0;
        const _ButtomScreenAnchor = scene.scale.height;

        // 1. SETTINGS FOR THE UI BAR
        const uiBarHeight = 100; // Adjust based on your 64px font
        const padding = 20;      // Space from the edges

        // 2. DRAW THE BACKGROUND BAR
        // Arguments: x, y, width, height, color, alpha
        // this.uiBackground = scene.add.rectangle(
        //     0, 0, 
        //     scene.scale.width, uiBarHeight, 
        //     0x000000, 0.75
        // ).setOrigin(0, 0);

        // this.scorePreText = "Score : ";
        // this.currentScore = scene.add.text(
        //     _LeftScreenAnchor + padding,
        //     _TopScreenAnchor + padding,
        //     this.scorePreText + "0",
        //     {fontSize: "64px"}
        // )
        // this.livesPreText = "Level : ";                         
        // this.currentLives = scene.add.text(
        //     _RightScreenAnchor - padding,
        //     _TopScreenAnchor + padding,
        //     this.livesPreText + scene.level,
        //     {fontSize: "64px"}
        // ).setOrigin(1,0);

        //this.TemplatePanel = new TemplatePanel(scene);
        //this.TemplatePanel.show();

        this.gameoverPanel = new GameOverPanel(scene);
        this.gameoverPanel.forceHide();

        this.postcard = new PostcardPanel(scene);
        this.postcard.forceShow();
    }
    update(time,delta){
        this.postcard.update();
        //console.log("test");
    }
    setScore(newScore){
        this.currentScore.text = this.scorePreText + newScore;
    }
    setLives(newLives){
        this.currentLives.text = this.livesPreText + newLives;
    }
    setGameOverHighscore(score){
        this.gameoverPanel.setHighscore(score);
    }
    resetGameOverPanel(){
        this.gameoverPanel.reset();
    }
    showGameOverPanel(finalScore){
        this.gameoverPanel.setFinalScore(finalScore);
        this.gameoverPanel.setHighscore(StorageManager.get('highscore'));
        this.gameoverPanel.show();
    }
}
