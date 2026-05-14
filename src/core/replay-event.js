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
    ROUND_COMPLETED: "round_completed"
});

export const ContextCluesReplayEvent = Object.freeze({
    QUESTION_SHOWN: "context_clues.question_shown",
    BLANK_SELECTED: "context_clues.blank_selected",
    OPTION_SELECTED: "context_clues.option_selected",
    ANSWER_SUBMITTED: "context_clues.answer_submitted"
});

export const PostcardReaderReplayEvent = Object.freeze({
    POSTCARD_SHOWN: "postcard_reader.postcard_shown",
    MEMORY_TIMER_STARTED: "postcard_reader.memory_timer_started",
    QUESTION_SHOWN: "postcard_reader.question_shown",
    CHOICE_SELECTED: "postcard_reader.choice_selected",
    ANSWER_SUBMITTED: "postcard_reader.answer_submitted",
    ROUND_COMPLETED: "postcard_reader.round_completed",
});

export const SymmetryDecorReplayEvent = Object.freeze({
    LEVEL_SHOWN: "symmetry_decor.level_shown",
    PIECE_PICKED_UP: "symmetry_decor.piece_picked_up",
    PIECE_DROPPED: "symmetry_decor.piece_dropped",
    PIECE_PLACED: "symmetry_decor.piece_placed",
    ANSWER_SUBMITTED: "symmetry_decor.answer_submitted",
    ROUND_COMPLETED: "symmetry_decor.round_completed",
});

export const ZooDetectiveReplayEvent = Object.freeze({
    PUZZLE_SHOWN: "zoo_detective.puzzle_shown",
    HINT_SHOWN: "zoo_detective.hint_shown",
    ANIMAL_PICKED_UP: "zoo_detective.animal_picked_up",
    ANIMAL_DROPPED: "zoo_detective.animal_dropped",
    ANIMAL_PLACED: "zoo_detective.animal_placed",
    ANSWER_SUBMITTED: "zoo_detective.answer_submitted",
    ROUND_COMPLETED: "zoo_detective.round_completed",
});

export const ZooFeederReplayEvent = Object.freeze({
    FOOD_SPAWNED: "zoo_feeder.food_spawned",
    FOOD_PICKED_UP: "zoo_feeder.food_picked_up",
    FOOD_DROPPED: "zoo_feeder.food_dropped",
    FOOD_DELIVERED: "zoo_feeder.food_delivered",
    ANIMAL_REACTED: "zoo_feeder.animal_reacted",
    ROUND_COMPLETED: "zoo_feeder.round_completed",
});

export const ReplayEvent = Object.freeze({
    Global: GlobalReplayEvent,
    ContextClues: ContextCluesReplayEvent,
    PostcardReader: PostcardReaderReplayEvent,
    SymmetryDecor: SymmetryDecorReplayEvent,
    ZooDetective: ZooDetectiveReplayEvent,
    ZooFeeder: ZooFeederReplayEvent,
});
