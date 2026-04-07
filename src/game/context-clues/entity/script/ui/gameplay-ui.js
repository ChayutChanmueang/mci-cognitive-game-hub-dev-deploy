import StorageManager from "/src/core/storage-manager.js";
import TutorialPanel from "../../../ui-elements/scripts/tutorial-panel.js";
import Entity from "../../entity";
import { createThaiText, ThaiTextPresets } from "../../../../../util/thai-text.js";
import GameOverPanel from "../../../ui-elements/scripts/gameover-panel.js";
import NextQuizPanel from "../../../ui-elements/scripts/next-quiz-panel.js";

export default class GameplayUI extends Entity{
    constructor(scene,x,y){
        super(scene,x,y);
        const _LeftScreenAnchor = 0;
        const _RightScreenAnchor = scene.scale.width;
        const _TopScreenAnchor = 0;
        const _ButtomScreenAnchor = scene.scale.height;

        // 1. SETTINGS FOR THE UI BAR
        const uiBarHeight = 100; // Adjust based on your 64px font
        const padding = 0;      // Space from the edges

        // 2. DRAW THE BACKGROUND BAR
        // Arguments: x, y, width, height, color, alpha
        this.uiBackground = scene.add.rectangle(
            0, 0, 
            scene.scale.width, uiBarHeight, 
            0x000000, 0.75
        ).setOrigin(0, 0);

        this.scorePreText = "Score : ";
        this.currentScore = createThaiText(
            scene,
            _LeftScreenAnchor + padding,
            _TopScreenAnchor + padding,
            this.scorePreText + scene.allScore,
            ThaiTextPresets.hud
        )
        this.livesPreText = "Level : ";                         
        this.currentLives = createThaiText(
            scene,
            _RightScreenAnchor - padding,
            _TopScreenAnchor + padding,
            this.livesPreText + scene.level,
            ThaiTextPresets.hud
        ).setOrigin(1,0);

        this.TutorialPanel = new TutorialPanel(scene);
        this.TutorialPanel.show();

        this.NextQuizPanel = new NextQuizPanel(scene);

        this.gameoverPanel = new GameOverPanel(scene);
    }

    showNextQuizPanel(onNext){
        this.NextQuizPanel.setNextAction(onNext);
        this.NextQuizPanel.show();
    }

    setScore(newScore){
        this.currentScore.text = this.scorePreText + newScore;
    }
    setLives(newLives){
        this.currentLives.text = this.livesPreText + newLives;
    }
    setGameOverHighscore(score){
        const currentScore = StorageManager.get('LANG001-highscore');
        console.log(`Current score: ${currentScore} | Set score: ${score}`);

        if (score > currentScore)
        {
            StorageManager.save('LANG001-highscore', score);
            this.gameoverPanel.setHighscore(score);
        }
    }
    resetGameOverPanel(){
        this.gameoverPanel.reset();
    }
    showGameOverPanel(finalScore){
        this.gameoverPanel.setFinalScore(finalScore);
        this.setGameOverHighscore(finalScore);
        this.currentScore.text = this.scorePreText + finalScore;
        this.gameoverPanel.setHighscore(StorageManager.get('LANG001-highscore'));
        this.gameoverPanel.show();
    }
}
