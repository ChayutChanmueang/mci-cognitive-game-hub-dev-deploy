import {PresetQuiz} from "../../constants.js";

export default class RandomQuiz {
    constructor(level) {
        console.log(level);
        const preset = PresetQuiz[level];
        if (!preset) {
            console.log(`Invalid level: ${level}`);
        }

        this.preset = preset || {};
        this.storyQueue = [];
        this.lastStoryKey = null;
        this.story = [];
        this.currentIndex = 0;

        this.nextStory();
    }

    buildShuffledQueue() {
        const keys = Object.keys(this.preset);
        if (keys.length === 0) return [];
        const shuffled = this.shuffle(keys);
        // Ensure the new queue doesn't start with the same key that ended the previous queue
        if (this.lastStoryKey && shuffled[0] === this.lastStoryKey && shuffled.length > 1) {
            const swapIdx = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
            [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
        }
        return shuffled;
    }

    nextStory() {
        if (this.storyQueue.length === 0) {
            this.storyQueue = this.buildShuffledQueue();
        }

        const key = this.storyQueue.shift();
        this.lastStoryKey = key;
        this.story = [...(this.preset[key] || [])];
        this.currentIndex = 0;
        console.log(`Selected story: ${key}`);
    }

    getQuiz() {
        if (this.currentIndex >= this.story.length) {
            return null;
        }

        return this.story[this.currentIndex++];
    }

    shuffle(array) {
        const result = [...array];
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
