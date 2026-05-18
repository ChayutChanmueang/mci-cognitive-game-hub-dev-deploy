import StorageManager from "/src/core/storage-manager.js";
import TutorialPanel from "../../../ui-elements/scripts/tutorial-panel.js";
import Entity from "../../entity";
import { createThaiText, getThaiFontFamily, ThaiTextPresets } from "../../../../../util/thai-text.js";
import GameOverPanel from "../../../ui-elements/scripts/gameover-panel.js";
import NextQuizPanel from "../../../ui-elements/scripts/next-quiz-panel.js";

export default class GameplayUI extends Entity{
    constructor(scene,x,y){
        super(scene,x,y);
        this.uiDepth = 990;
        this.maxRound = 10;
        this.currentRound = 1;
        this.currentScoreValue = 0;
        this.levelMap = "easy";
        this.levelNumber = scene.level ?? 1;

        this.TutorialPanel = new TutorialPanel(scene);
        this.TutorialPanel.show();

        this.NextQuizPanel = new NextQuizPanel(scene);

        this.gameoverPanel = new GameOverPanel(scene);

        this.levelText = this.createTextBox(230, 130, 250, 75, "ด่าน 1/10", ThaiTextPresets.hud, this.uiDepth);
        this.timerText = this.createTextBox(scene.scale.width - 230, 130, 250, 75, this.formatSeconds(180), ThaiTextPresets.hud, this.uiDepth);
    }

    showNextQuizPanel(onNext){
        this.NextQuizPanel.setNextAction(onNext);
        this.NextQuizPanel.show();
    }

    setScore(newScore){
        this.currentScoreValue = Math.max(0, Number(newScore) || 0);
    }

    setLevel(levelMap = "easy", levelNumber = 1, currentRound = 1, maxRound = 10) {
        this.levelMap = levelMap;
        this.levelNumber = levelNumber;
        this.maxRound = Math.max(1, Number(maxRound) || 10);
        this.currentRound = Phaser.Math.Clamp(Number(currentRound) || 1, 1, this.maxRound);

        this.refreshLevelText();
    }

    refreshLevelText() {
        this.levelText[0].setText(`ด่าน ${this.currentRound}/${this.maxRound}`);
    }

    setLives(newLives){
        this.currentRound = Phaser.Math.Clamp(Number(newLives) || 1, 1, this.maxRound);
        this.refreshLevelText();
    }

    setTimeLeft(timeLeftS = 0) {
        this.timerText[0].setText(this.formatSeconds(timeLeftS));
    }

    formatSeconds(value = 0) {
        const totalSeconds = Math.max(0, Math.ceil(Number(value) || 0));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
        finalScore = finalScore <= 0 ? 0 : finalScore;

        this.gameoverPanel.setFinalScore(finalScore);
        this.setGameOverHighscore(finalScore);
        this.setScore(finalScore);
        this.gameoverPanel.setHighscore(StorageManager.get('LANG001-highscore'));
        this.gameoverPanel.show();
    }

    createTextBox(x, y, width, height, label, hudFontFamily, depth = 0, scale = 1.5){
        const stagePanel = this.scene.drawRoundedPanel(x, y, width, height, {
            fillColor: 0x56AC2E,
            strokeColor: 0xffffff,
            strokeWidth: 4,
            radius: 24,
            origin: [0.5, 0.5],
            depth: depth
        });
        stagePanel.setScale(scale);

        const labelText = createThaiText(
            this.scene,
            x - (width / 2),
            y,
            label,
            {
                fontFamily: this.resolveFontFamily(hudFontFamily),
                fontSize: "48px",
                fontStyle: "bold",
                color: "#ffffff"
            },
            { origin: [0, 0.5] }
        );
        labelText.setText(label);
        labelText.setDepth(depth + 1);

        return [labelText, stagePanel];
    }

    resolveFontFamily(hudFontFamily) {
        if (typeof hudFontFamily === "string" && hudFontFamily.trim()) {
            return hudFontFamily;
        }

        return getThaiFontFamily();
    }
}
