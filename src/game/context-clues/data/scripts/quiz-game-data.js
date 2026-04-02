import Struct from "../struct.js";

export default class QuizGameData extends Struct{
    constructor(){
        super();
        this.id = "";
        this.score = 0;
        this.answers = [];
        this.answerLogs = [];
    }

    increaseScore(score){
        this.score += score;
    }

    decreaseScore(score){
        this.score -= score;
    }
}