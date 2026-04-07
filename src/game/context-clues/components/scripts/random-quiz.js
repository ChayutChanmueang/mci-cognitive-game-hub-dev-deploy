import {PresetQuiz} from "../../constants.js";
import "../../utils/array-helper.js"
import {removeFirstMatchingValueInPlace} from "../../utils/array-helper.js";

Array.prototype.remove = function(value) {
    const index = this.indexOf(value);
    if (index !== -1) {
        this.splice(index, 1);
    }
    return this;
};

export default class RandomQuiz{
    constructor(level){
        console.log(level);
        const preset = PresetQuiz[level];
        if (!preset) {
            console.log(`Invalid level: ${level}`);
        }

        this.shuffled = this.shuffle(preset)
    }

    getQuiz(){
        if (this.shuffled.length <= 0) {
            return null;
        }

        const quizData = this.shuffled[Math.floor(Math.random() * this.shuffled.length)];
        removeFirstMatchingValueInPlace(this.shuffled, quizData);
        return quizData;
    }

    shuffle(array) {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    buildAnswer(textParts, answers) {
        return textParts.map((part, i) => part + (answers[i] ?? "")).join("");
    }

    checkAnswer(correct, userAnswer) {
        if (correct.length !== userAnswer.length) return false;

        return correct.every((ans, i) => ans === userAnswer[i]);
    }
}