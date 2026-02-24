import StorageManager from "../../../../core/storage-manager";
import GameOverPanel from "../../../ui-elements/scripts/gameover-panel";
import Entity from "../../entity";

export default class GameplayUI extends Entity{
    constructor(scene,x,y){
        super(scene,x,y);
        const _LeftScreenAnchor = 0;
        const _RightScreenAnchor = scene.scale.width;
        const _TopScreenAnchor = 0;
        const _ButtomScreenAnchor = scene.scale.height;

        this.scorePreText = "Score : ";
        this.currentScore = scene.add.text(
            _LeftScreenAnchor,
            _TopScreenAnchor,
            this.scorePreText + scene.score,
            {fontSize: "64px"}
        );
        this.livesPreText = "Lives : ";                         
        this.currentLives = scene.add.text(
            _RightScreenAnchor,
            _TopScreenAnchor,
            this.livesPreText + scene.lives,
            {fontSize: "64px"}
        ).setOrigin(1,0);

        this.gameoverPanel = new GameOverPanel(scene);
    }
    setScore(newScore){
        this.currentScore.text = this.scorePreText + newScore;
    }
    setLives(newLives){
        this.currentLives.text = this.livesPreText + newLives;
    }
    showGameOverPanel(finalScore){
        this.gameoverPanel.setFinalScore(finalScore);
        this.gameoverPanel.setHighscore(StorageManager.get('highscore'));
        this.gameoverPanel.show();
    }
}