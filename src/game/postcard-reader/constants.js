export const SampleConstants = Object.freeze({
    VARIABLE1: "Testing..."
})
export const Difficulty = Object.freeze({
    EASY: 'Easy',
    NORMAL: 'Normal',
    HARD: 'Hard'
})
export const GameLevels = {
    [Difficulty.EASY]: [
        {
            Postcard: "Sample Text 1",
            Questions: [
                {
                    Question: "Q1",
                    Choice:[
                        {
                            ChoiceText:"C1",
                            isCorrect:true
                        },
                        {
                            ChoiceText:"C2",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C3",
                            isCorrect:false
                        }
                    ]
                },
                {
                    Question: "Q2",
                    Choice:[
                        {
                            ChoiceText:"C1",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C2",
                            isCorrect:true
                        },
                        {
                            ChoiceText:"C3",
                            isCorrect:false
                        }
                    ]
                }
            ]
        },
        {
            Postcard: "Sample Text 2",
            Questions: [
                {
                    Question: "Q3",
                    Choice:[
                        {
                            ChoiceText:"C1",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C2",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C3",
                            isCorrect:true
                        }
                    ]
                },
                {
                    Question: "Q4",
                    Choice:[
                        {
                            ChoiceText:"C1",
                            isCorrect:true
                        },
                        {
                            ChoiceText:"C2",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C3",
                            isCorrect:false
                        }
                    ]
                }
            ]
        },
        {
            Postcard: "Sample Text 3",
            Questions: [
                {
                    Question: "Q5",
                    Choice:[
                        {
                            ChoiceText:"C1",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C2",
                            isCorrect:true
                        },
                        {
                            ChoiceText:"C3",
                            isCorrect:false
                        }
                    ]
                },
                {
                    Question: "Q6",
                    Choice:[
                        {
                            ChoiceText:"C1",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C2",
                            isCorrect:false
                        },
                        {
                            ChoiceText:"C3",
                            isCorrect:true
                        }
                    ]
                }
            ]
        }
    ]
}