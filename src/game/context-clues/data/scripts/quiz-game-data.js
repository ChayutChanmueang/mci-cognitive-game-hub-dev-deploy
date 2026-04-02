import Struct from "../struct.js";

export default class QuizGameData extends Struct{
    constructor(){
        super();
        this.score = 0;
        this.answers = [];
        this.isCorrect = false;
    }
}