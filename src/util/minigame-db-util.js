import db from "/src/core/database.js";

export default class MiniGameDBUtil {
    constructor() {
    }

    static GAME_STORAGE = Object.freeze({
        gid: "selected_game_gid",
        stage: "selected_game_stage",
        historyId: "pending_game_history_by_gid",
    });

    static async pushGameData(score, level, startGameTime, endGameTime) {
        const gid = (sessionStorage.getItem(this.GAME_STORAGE.gid) || "");
        const stage = (sessionStorage.getItem(this.GAME_STORAGE.stage) || "");
        const historyKey = stage ? `${gid}:stage-${stage}` : gid;
        const pendingHistoryMap = JSON.parse(sessionStorage.getItem(this.GAME_STORAGE.historyId) || "{}");
        const pendingHistory = pendingHistoryMap[historyKey] || pendingHistoryMap[gid];

        if (!pendingHistory?.id) {
            throw new Error(`Missing pending user_game_history for ${historyKey}`);
        }


        const gameSessionData = await db.submitGameData({
            gid,
            score,
            level,
            startedAt: startGameTime,
            endedAt: endGameTime,
        });

        const endedAt = new Date().toISOString();
        await db.completeUserGameHistory({
            historyId: pendingHistory.id,
            endAt: endedAt,
            userGameDataId: gameSessionData.id,
        });

        delete pendingHistoryMap[historyKey];
        delete pendingHistoryMap[gid];
        if (Object.keys(pendingHistoryMap).length > 0) {
            sessionStorage.setItem(this.GAME_STORAGE.historyId, JSON.stringify(pendingHistoryMap));
        } else {
            sessionStorage.removeItem(this.GAME_STORAGE.historyId);
        }
    }
}
