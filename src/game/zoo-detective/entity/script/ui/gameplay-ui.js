import Phaser from "phaser";
import StorageManager from "../../../../../core/storage-manager.js";
import TutorialPanel from "../../../ui-elements/scripts/tutorial-panel.js";
import Entity from "../../entity";
import {createThaiText, getThaiFontFamily, ThaiTextPresets} from "../../../../../util/thai-text.js";
import NextQuizPanel from "../../../ui-elements/scripts/next-quiz-panel.js";
import GameOverPanel from "../../../ui-elements/scripts/gameover-panel.js";
import { EventBus } from "../../../../../core/EventBus.js";

export default class GameplayUI extends Entity{
    constructor(scene,x,y){
        super(scene,x,y);

        this.maxRound = 10;
        this.levelNumber = scene.level ?? 1;
        this.levelName = "EASY";
        this.currentRound = 1;
        this.currentScoreValue = 0;
        this.uiDepth = 990;

        const barX = 14;
        const barY = 12;
        const barWidth = scene.scale.width - (barX * 2);
        const barHeight = 188;
        const infoRight = barX + barWidth - 22;
        const infoStartY = barY + 34;
        const hudFontFamily = `"Noto Color Emoji", ${getThaiFontFamily()}`;

        this.uiBackground = scene.add.graphics();
        this.uiBackground
            .fillStyle(0xbcecff, 1)
            .lineStyle(8, 0x42586b, 1)
            .fillRoundedRect(barX, barY, barWidth, barHeight, 38)
            .strokeRoundedRect(barX, barY, barWidth, barHeight, 38)
            .setDepth(this.uiDepth - 1);

        this.levelText = this.createTextBox(230, 130, 250, 75, "ด่าน 1/10", ThaiTextPresets.hud, this.uiDepth);
        this.timerText = this.createTextBox(scene.scale.width - 230, 130, 250, 75, this.formatSeconds(0), ThaiTextPresets.hud, this.uiDepth);

        this.currentScore = createThaiText(
            scene,
            infoRight,
            infoStartY + 108,
            "",
            {
                fontFamily: hudFontFamily,
                fontSize: "40px",
                fontStyle: "bold",
                color: "#f4a900"
            },
            { origin: [1, 0] }
        ).setDepth(this.uiDepth);

        this.TutorialPanel = new TutorialPanel(scene, this.depth + 10);
        this.TutorialPanel.show();

        this.gameoverPanel = new GameOverPanel(scene);
        this.NextQuizPanel = new NextQuizPanel(scene);

        /*this.returnBtn = scene.createButton(scene.scale.width / 2 - 325, 105, "◀️ RETURN", () => {
            EventBus.emit("minigame:level-select-request", { source: "zoo-detective-gameplay" });
        });

        this.returnBtn[0].setDepth(this.uiDepth);*/

        this.refreshLevelText();
        this.setTimeLeft(0);
        this.setScore(0);
    }
    refreshLevelText() {
        this.levelText[0].setText(`ด่าน ${this.currentRound}/${this.maxRound}`);
    }

    setLevel(levelMap = "easy", levelNumber = 1, currentRound = 1, maxRound = 10) {
        this.levelName = String(levelMap || "easy").toUpperCase();
        this.levelNumber = levelNumber;
        this.maxRound = Math.max(1, Number(maxRound) || 10);
        this.currentRound = Phaser.Math.Clamp(Number(currentRound) || 1, 1, this.maxRound);

        this.refreshLevelText();
    }

    setScore(newScore){
        this.currentScoreValue = Math.max(0, Number(newScore) || 0);
        this.currentScore.setText(`⭐ ${this.currentScoreValue}`);
    }

    setLives(newLives){
        this.currentRound = Phaser.Math.Clamp(Number(newLives) || 1, 1, this.maxRound);
        this.refreshLevelText();
    }

    setElapsedTime(elapsedMs = 0) {
        const totalSeconds = Math.max(0, Math.floor((Number(elapsedMs) || 0) / 1000));
        this.timerText[0].setText(this.formatSeconds(totalSeconds));
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
        const currentScore = StorageManager.get('EXEC001-highscore');
        console.log(`Current score: ${currentScore} | Set score: ${score}`);

        if (score > currentScore)
        {
            StorageManager.save('EXEC001-highscore', score);
            this.gameoverPanel.setHighscore(score);
        }
    }
    resetGameOverPanel(){
        this.gameoverPanel.reset();
    }

    showNextQuizPanel(onNext){
        this.NextQuizPanel.setNextAction(onNext);
        this.NextQuizPanel.show();
    }

    showGameOverPanel(finalScore, resultStatus = "success"){
        finalScore = finalScore <= 0 ? 0 : finalScore;

        this.gameoverPanel.setResultStatus(resultStatus);
        this.gameoverPanel.setFinalScore(finalScore);
        this.setGameOverHighscore(finalScore);
        this.setScore(finalScore);
        this.gameoverPanel.setHighscore(StorageManager.get('EXEC001-highscore'));
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
                fontFamily: hudFontFamily,
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
}
