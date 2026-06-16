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
        const gain = Math.max(0, Number(score) || 0);
        if (gain <= 0) {
            return;
        }

        this.score += gain;
    }

    decreaseScore(score){
        const penalty = Math.max(0, Number(score) || 0);
        if (penalty <= 0) {
            return;
        }

        this.score = Math.max(0, this.score - penalty);
    }
}
