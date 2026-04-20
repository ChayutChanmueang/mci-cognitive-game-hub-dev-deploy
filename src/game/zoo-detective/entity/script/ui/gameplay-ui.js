import StorageManager from "../../../../../core/storage-manager";
import TutorialPanel from "../../../ui-elements/scripts/tutorial-panel.js";
import Entity from "../../entity";
import { createThaiText, ThaiTextPresets } from "../../../../../util/thai-text.js";
import NextQuizPanel from "../../../ui-elements/scripts/next-quiz-panel.js";
import GameOverPanel from "../../../../context-clues/ui-elements/scripts/gameover-panel.js";

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
            this.scorePreText + "0",
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
        this.gameoverPanel = new GameOverPanel(scene);
        this.NextQuizPanel = new NextQuizPanel(scene);
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

    showNextQuizPanel(onNext){
        this.NextQuizPanel.setNextAction(onNext);
        this.NextQuizPanel.show();
    }

    showGameOverPanel(finalScore){
        this.gameoverPanel.setFinalScore(finalScore);
        this.gameoverPanel.setHighscore(StorageManager.get('highscore'));
        this.gameoverPanel.show();
    }
}
