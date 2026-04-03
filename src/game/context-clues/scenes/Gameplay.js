import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import RandomQuiz from "../components/scripts/random-quiz.js";
import {LevelMap, Config} from "../constants.js";
import { createThaiText, ThaiTextPresets } from "../utils/thai-text";
import Quiz from "../entity/script/quiz.js";
import ProgressBar from "../utils/progress-bar.js";
import QuizGameData from "../data/scripts/quiz-game-data.js";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
    this.levelMap = "";
    this.quizData = [];
    this.progressBarRefs = [];
    this.round = 0;
    this.allScore = 0;
  }

  preload() {
    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI",
    );

    this.load.image('button-idle','assets/button_rectangle_depth_flat.png')
    this.load.image('button-press','assets/button_rectangle_flat.png')
  }

  init(data) {
    this.level = data.level;
    this.levelMap = LevelMap[this.level];
    this.randomQuiz = new RandomQuiz(this.levelMap);
    this.allScore = 0;
    this.round = 0;
    this.quizData = [];
    this.progressBarRefs = [];
  }

  create(data) {
    this.gameplayUI = new GameplayUI(this, 0, 0);
    // Create First Quiz
    this.getNewQuiz();

    this.easyBtn = this.createButton(this.scale.width / 2 - 175, (this.scale.height) - 350, "Return", () => {
      this.scene.start('main-menu-scene',{ conveyerNums: 1 })
    });
      let dotProgressBars = [];
      for (let i = 0; i < Config.MaxRound[this.levelMap]; i++) {
          const bar = new ProgressBar(this, 0, 0, {
              width: 50,
              height: 10
          });

          bar.setValue(0);

          this.progressBarRefs.push(bar);
          dotProgressBars.push(bar.getContainer());
      }

      Phaser.Actions.GridAlign(dotProgressBars, {
          width: 10,
          cellWidth: 60,
          cellHeight: 5,
          x: this.scale.width / 2 - 275,
          y: 200,
          position: Phaser.Display.Align.TOP_LEFT
      });

    this.gameplayUI.setDepth(100);
  }

  getNewQuiz(){
      const quizData = this.randomQuiz.getQuiz();

      if (quizData == null) {
          return null;
      }

      const id = quizData.id;
      const textParts = quizData.textParts;
      const options = this.randomQuiz.shuffle(quizData.options);
      const answers = quizData.correctAnswers;
      const qData = new QuizGameData();
      this.quizData.push(qData)

      if (this.quizGame != null){
          this.quizGame.destroy();
      }

      this.quizGame = new Quiz(this, 0, 0, id, textParts, answers, options, qData, 1);
      this.quizGame.onAnswerCorrect = () => {
          this.progressBarRefs[this.round].animateTo(1, 500)
          this.round++;
          this.increaseScore(Config.IncreaseScore[this.levelMap]);

          if (this.round < Config.MaxRound[this.levelMap]) {
              console.log(`All Score: (${this.allScore})`);
              // Create New Quiz
              this.getNewQuiz();
          }else{
              this.gameplayUI.setScore(this.allScore);
              this.gameplayUI.showGameOverPanel(this.allScore);
          }
      }
      this.quizGame.onAnswerIncorrect = () => {
          this.decreaseScore(Config.DecreaseScore[this.levelMap]);
      }
      this.gameplayUI.setScore(this.allScore);
      this.quizGame.onCreateQuiz();

      return this.quizGame;
  }

    increaseScore(score){
        this.allScore += score;
    }

    decreaseScore(score){
        this.allScore -= score;

        const scorePenaltyText = createThaiText(
            this,
            this.scale.width / 2,
            this.scale.height / 2 - 250,
            `-${score}`,
            {
                fontSize: "48px",
                fontStyle: "bold",
                color: "#ff4d4d"
            },
            { origin: 0.5 }
        );
        scorePenaltyText.setDepth(200);

        this.tweens.add({
            targets: scorePenaltyText,
            y: scorePenaltyText.y - 40,
            alpha: 0,
            duration: 700,
            ease: "Sine.easeOut",
            onComplete: () => {
                scorePenaltyText.destroy();
            }
        });
    }

  createButton(x,y,text,onClick){
        const bg = this.add.rectangle(x,y,200,60,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = createThaiText(this, x, y, text, ThaiTextPresets.buttonLabel, { origin: 0.5 });
        label.setScale(1.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}
