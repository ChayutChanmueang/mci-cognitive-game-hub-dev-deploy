import UIPanel from "../../../common/ui/core/ui-panel-base";
import game_db from "/src/util/minigame-db-util.js";
import Theme from "../../../../util/game-theme.js";

export default class GameOverPanel extends UIPanel {
    constructor(scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2, 450, 600);

        this.finalScore = 0;

        const textStyle = {
            fontFamily: Theme.fonts.main,
            color: '#' + Theme.colors.onSurface.toString(16).padStart(6, '0'),
            align: 'center'
        };

        this.titleText = scene.add.text(0, -220, "จบภารกิจ!", {
            ...textStyle,
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#' + Theme.colors.primary.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.scoreLabel = scene.add.text(0, -120, "คะแนนที่คุณทำได้", {
            ...textStyle,
            fontSize: '24px',
            color: '#' + Theme.colors.onSurfaceVariant.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.scoreText = scene.add.text(0, -60, "0", {
            ...textStyle,
            fontSize: '84px',
            fontStyle: 'bold',
            color: '#' + Theme.colors.onSurface.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.highscoreText = scene.add.text(0, 40, "คะแนนสูงสุด: 0", {
            ...textStyle,
            fontSize: '28px',
            color: '#' + Theme.colors.onSurfaceVariant.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.restartBtn = this.createButton(0, 160, "เล่นอีกครั้ง", Theme.colors.primary, Theme.colors.onPrimary, () => {
            if (this.scene.restartGame) {
                this.scene.restartGame();
                return;
            }
            this.scene.scene.restart();
        });

        this.homeBtn = this.createButton(0, 250, "กลับหน้าหลัก", Theme.colors.outline, Theme.colors.onSurface, () => {
            this.scene.scene.start('main-menu-scene');
            game_db.pushGameData(this.finalScore, this.scene.level, this.scene.gameStartedAt, this.scene.gameEndedAt)
                .then(() => console.log("Game data saved"))
                .catch((error) => console.error("Failed to save game data:", error));
        });

        this.addElements([
            this.titleText, 
            this.scoreLabel, 
            this.scoreText, 
            this.highscoreText, 
            ...this.restartBtn, 
            ...this.homeBtn
        ]);
    }

    setFinalScore(score) {
        this.scoreText.setText(score.toString());
        this.finalScore = score;
    }

    setHighscore(score) {
        this.highscoreText.setText("คะแนนสูงสุด: " + score);
    }

    reset() {
        this.setFinalScore(0);
        this.setHighscore(0);
        this.forceHide();
    }
}

