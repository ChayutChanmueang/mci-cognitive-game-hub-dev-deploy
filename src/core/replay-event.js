export const GlobalReplayEvent = Object.freeze({
    SESSION_STARTED: "global.session_started",
    SESSION_ENDED: "global.session_ended",
    GAME_STARTED: "global.game_started",
    GAME_ENDED: "global.game_ended",
    GAME_RETRIED: "global.game_retried",
    GAME_EXITED: "global.game_exited",
    REPLAY_BATCH_PUSHED: "global.replay_batch_pushed",
    TUTORIAL_OPENED: "global.tutorial_opened",
    TUTORIAL_CLOSED: "global.tutorial_closed",
    SCORE_CHANGED: "global.score_changed",
    ROUND_START: "global.round_start",
    ROUND_COMPLETED: "global.round_completed",
    ANSWER_SUBMITTED: "global.answer_submitted"
});

export const ContextCluesReplayEvent = Object.freeze({
    QUESTION_SHOWN: "context_clues.question_shown",
    BLANK_SELECTED: "context_clues.blank_selected",
    OPTION_SELECTED: "context_clues.option_selected",
});

export const PostcardReaderReplayEvent = Object.freeze({
    POSTCARD_SHOWN: "postcard_reader.postcard_shown",
    MEMORY_TIMER_STARTED: "postcard_reader.memory_timer_started",
    QUESTION_SHOWN: "postcard_reader.question_shown",
    CHOICE_SELECTED: "postcard_reader.choice_selected"
});

export const SymmetryDecorReplayEvent = Object.freeze({
    PIECE_PICKED_UP: "symmetry_decor.piece_picked_up",
    PIECE_DROPPED: "symmetry_decor.piece_dropped",
    PIECE_PLACED: "symmetry_decor.piece_placed"
});

export const ZooDetectiveReplayEvent = Object.freeze({
    PUZZLE_SHOWN: "zoo_detective.puzzle_shown",
    HINT_SHOWN: "zoo_detective.hint_shown",
    ANIMAL_PICKED_UP: "zoo_detective.animal_picked_up",
    ANIMAL_DROPPED: "zoo_detective.animal_dropped",
    ANIMAL_PLACED: "zoo_detective.animal_placed"
});

export const ZooFeederReplayEvent = Object.freeze({
    FOOD_DROPPED: "zoo_feeder.food_dropped",
    FOOD_DELIVERED: "zoo_feeder.food_delivered",
});

export const FryFoodReplayEvent = Object.freeze({
    FINAL_SCORE: "fry_food.final_score",
    FLIP_DURATION: "fry_food.flip_duration"
});

export const ReplayEvent = Object.freeze({
    Global: GlobalReplayEvent,
    ContextClues: ContextCluesReplayEvent,
    PostcardReader: PostcardReaderReplayEvent,
    SymmetryDecor: SymmetryDecorReplayEvent,
    ZooDetective: ZooDetectiveReplayEvent,
    ZooFeeder: ZooFeederReplayEvent,
    FryFood: FryFoodReplayEvent,
});
