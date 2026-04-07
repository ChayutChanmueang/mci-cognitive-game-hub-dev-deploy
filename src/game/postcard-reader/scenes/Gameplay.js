import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import { GameLevels } from "../constants";
import UIPanel from "../ui-elements/core/ui-panel";
import Button from "../ui-elements/core/button";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
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

  create(data) {
    this.gameplayUI = null;
    // this.easyBtn = this.createButton(this.scale.width/2 ,(this.scale.height/2) - 100, "RETURN", () => {
    //         this.scene.start('main-menu-scene',{ conveyerNums: 1 })
    //     });
    // this.titleText = this.add.text(this.scale.width/2,this.scale.height/2 - 250,"GAMEPLAY",{
    //         fontSize: '96px', fontStyle: 'bold'
    //     }).setOrigin(0.5);
    // this.titleText.setDepth(100);

    this.level = data.level || 1;

    console.log(this.level);

    this.buttonPool = {
      Pool: [],
      CorrectPool: [],
      WrongPool: []
    }

    if(this.lastChosenIndex == null){
      this.lastChosenIndex = -1;
    }

    this.choosePostcard();
    this.chooseQuestion();

    this.intializeGamePage();

    this.gameplayUI = new GameplayUI(this,0,0);
  }
  update(time,delta){
    this.gameplayUI.update(time,delta);
  }
  choosePostcard(){
    if(this.level == 1){
      const _totalOptions = GameLevels.Easy.length;
      var _newIndex;

      do{
        _newIndex = Math.trunc(Math.random() * _totalOptions)
      } while (_newIndex === this.lastChosenIndex && _totalOptions > 1)

      this.lastChosenIndex = _newIndex;
      this.choosenTextIndex = _newIndex;

      this.currentPostcard = GameLevels.Easy[this.choosenTextIndex];
      this.postcardText = this.currentPostcard.Postcard;
      this.currentQuestionList = [...this.currentPostcard.Questions];
    }
  }
  chooseQuestion(){
    if(this.currentPostcard != null){
      console.log(this.currentQuestionList);
      this.choosenQuestionIndex = Math.trunc(Math.random() * this.currentQuestionList.length);
      console.log(this.choosenQuestionIndex);
      console.log(this.currentQuestionList[this.choosenQuestionIndex]);
      this.currentQuestion = this.currentQuestionList[this.choosenQuestionIndex];
      console.log(this.currentQuestion);
      console.log(this.currentQuestion.Question);
      this.currentQuestionText = this.currentQuestion.Question;
    }
  }
  intializeGamePage(){
    if(this.questionPanel == null){
        this.questionPanel = new UIPanel(this,this.scale.width/2 ,this.scale.height/5,{
        size: {x:800, y:300},
        strokeEnable: true
      })
    }

    if(this.questionText == null){
      this.questionText = this.add.text(0,0,this.currentQuestionText,{
        fontSize: '48px', color:'#ffffff',fontStyle: 'bold'
      }).setOrigin(0.5);

      this.questionPanel.addElements(this.questionText);
    }
    else{
      this.questionText.setText(this.currentQuestionText);
    }

    if(this.gameplayUI == null){
      this.questionPanel.forceHide();
    }


    this.initialzeAnswers();
  }
  initialzeAnswers(){

    const _shuffledAnswers = this.shuffleArray(this.currentQuestion.Choice);

    const _answerAmount = _shuffledAnswers.length;
    console.log(_answerAmount);

    this.currentAnswer = 0;

    while(_answerAmount > this.currentAnswer){
      console.log(this.currentAnswer);
      if(_shuffledAnswers[this.currentAnswer].isCorrect){
        const _button = new Button(this,
          this.scale.width/2,
          (this.scale.height/3) + 150 + (235*this.currentAnswer),
          {
            width: 800,
            height: 200,
            labelText: _shuffledAnswers[this.currentAnswer].ChoiceText,
            onClick: () => {
              this.onCorrectAnswer();
            }
          }
        );

        this.buttonPool.CorrectPool.push(_button);
        this.buttonPool.Pool.push(_button);

        if(this.gameplayUI == null){
          _button.forceHide();
        }
      }
      else{
        const _button = new Button(this,
          this.scale.width/2,
          (this.scale.height/3) + 150 + (235*this.currentAnswer),
          {
            width: 800,
            height: 200,
            labelText: _shuffledAnswers[this.currentAnswer].ChoiceText,
            clickColor: 0x550000,
            onClick: () => {
              this.onWrongAnswer();
            }
          }
        );
        this.buttonPool.WrongPool.push(_button);
        this.buttonPool.Pool.push(_button);

        if(this.gameplayUI == null){
          _button.forceHide();
        }
      }
      this.currentAnswer++;
    }
  }
  showGame(){
    this.questionPanel.forceShow();
    for(const _button of this.buttonPool.Pool){
      _button.forceShow();
    }
  }
  onCorrectAnswer(){
    console.log("correct");
    this.displayNextQuestion();
  }
  onWrongAnswer(){
    console.log("incorrect");
    this.displayNextQuestion();
  }
  displayNextQuestion(){
    const index = this.currentQuestionList.indexOf(this.currentQuestion);

    if(index > -1){
      this.currentQuestionList.splice(index,1);
    }

    if(this.currentQuestionList.length == 0){
      // this.questionPanel = null;
      // this.questionText = null;
      // this.scene.restart();
      this.reinitializeGame();
      return;
    }

    this.chooseQuestion();

    for(const _button of this.buttonPool.Pool){
      _button.destroy();
    }

    this.intializeGamePage();
  }
  reinitializeGame(){
    for(const _button of this.buttonPool.Pool){
      _button.destroy();
    }

    this.buttonPool = {
      Pool: [],
      CorrectPool: [],
      WrongPool: []
    }

    this.choosePostcard();
    this.chooseQuestion();

    this.intializeGamePage();

    this.questionPanel.forceHide();
    
    this.gameplayUI.postcard.reinitializedPanel();
  }
  shuffleArray(array){
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));
    
      // Swap elements array[i] and array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  createButton(x,y,sizeX,sizeY,text,onClick){
        const bg = this.add.rectangle(x,y,sizeX,sizeY,0x00aa00,1).setInteractive({useHandCursor: true});
        bg.setScale(1.5);
        const label = this.add.text(x,y,text,{
            fontSize: '28px', fontStyle: 'bold'
        }).setOrigin(0.5);
        label.setScale(1.5);

        bg.on('pointerdown',onClick);

        bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
        bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

        return [bg,label];
    }
}