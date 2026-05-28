import {PresetQuiz} from "../../constants.js";

export default class RandomQuiz{
    constructor(level){
        console.log(level);
        const preset = PresetQuiz[level];
        if (!preset) {
            console.log(`Invalid level: ${level}`);
        }

        this.story = this.pickRandomStory(preset);
        this.currentIndex = 0;
    }

    pickRandomStory(preset) {
        if (!preset) {
            return [];
        }

        const storyKeys = Object.keys(preset);
        const selectedKey = storyKeys[Math.floor(Math.random() * storyKeys.length)];
        console.log(`Selected story: ${selectedKey}`);
        return [...preset[selectedKey]];
    }

    getQuiz(){
        if (this.currentIndex >= this.story.length) {
            return null;
        }

        return this.story[this.currentIndex++];
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
