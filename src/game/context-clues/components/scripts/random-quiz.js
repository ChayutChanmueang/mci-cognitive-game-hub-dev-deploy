import {PresetQuiz} from "../../constants.js";

export default class RandomQuiz{
    static getQuiz(level){
        console.log(level);
        const preset = PresetQuiz[level];
        if (!preset) {
            console.log(`Invalid level: ${level}`);
        }

        const shuffled = this.shuffle(preset);
        return shuffled[Math.floor(Math.random() * shuffled.length)];
    }

    static shuffle(array) {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    static buildAnswer(textParts, answers) {
        return textParts.map((part, i) => part + (answers[i] ?? "")).join("");
    }

    static checkAnswer(correct, userAnswer) {
        if (correct.length !== userAnswer.length) return false;

        return correct.every((ans, i) => ans === userAnswer[i]);
    }
}