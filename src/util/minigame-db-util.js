import db from "/src/core/database.js";

function readSessionValue(key, fallbackValue = null) {
    if (typeof sessionStorage === "undefined") {
        return fallbackValue;
    }

    const rawValue = sessionStorage.getItem(key);
    if (rawValue == null) {
        return fallbackValue;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        return rawValue;
    }
}

function readSessionString(key) {
    return String(readSessionValue(key, "") ?? "").trim();
}

function readSessionObject(key) {
    const value = readSessionValue(key, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function createHistoryKey(gid, stage) {
    return stage ? `${gid}:stage-${stage}` : gid;
}

function normalizeHistoryStage(stage) {
    return stage == null || stage === "" ? "" : String(stage).trim();
}

function findPendingHistory(pendingHistoryMap, gid, stage) {
    const historyKey = createHistoryKey(gid, stage);
    const directKeys = [...new Set([historyKey, gid].filter(Boolean))];

    for (const key of directKeys) {
        const pendingHistory = pendingHistoryMap[key];
        if (pendingHistory?.id) {
            return { historyKey, matchedHistoryKey: key, pendingHistory };
        }
    }

    for (const [key, pendingHistory] of Object.entries(pendingHistoryMap)) {
        if (!pendingHistory?.id || typeof pendingHistory !== "object") {
            continue;
        }

        const pendingGid = String(pendingHistory.gid || "").trim();
        const pendingStage = normalizeHistoryStage(pendingHistory.stage);
        const pendingNodeKey = String(pendingHistory.nodeKey || "").trim();
        const matchesGid = !gid || pendingGid === gid;
        const matchesStage = !stage || pendingStage === stage || pendingNodeKey === historyKey;

        if (matchesGid && matchesStage) {
            return { historyKey, matchedHistoryKey: key, pendingHistory };
        }
    }

    return { historyKey, matchedHistoryKey: "", pendingHistory: null };
}

export default class MiniGameDBUtil {
    constructor() {
    }

    static GAME_STORAGE = Object.freeze({
        gid: "selected_game_gid",
        stage: "selected_game_stage",
        historyId: "pending_game_history_by_gid",
    });

    static async pushGameData(score, level, startGameTime, endGameTime) {
        const gid = readSessionString(this.GAME_STORAGE.gid);
        const stage = readSessionString(this.GAME_STORAGE.stage);
        const pendingHistoryMap = readSessionObject(this.GAME_STORAGE.historyId);
        const { historyKey, matchedHistoryKey, pendingHistory } = findPendingHistory(pendingHistoryMap, gid, stage);

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

        if (matchedHistoryKey) {
            delete pendingHistoryMap[matchedHistoryKey];
        }
        delete pendingHistoryMap[historyKey];
        delete pendingHistoryMap[gid];
        delete pendingHistoryMap[pendingHistory.nodeKey];
        if (Object.keys(pendingHistoryMap).length > 0) {
            sessionStorage.setItem(this.GAME_STORAGE.historyId, JSON.stringify(pendingHistoryMap));
        } else {
            sessionStorage.removeItem(this.GAME_STORAGE.historyId);
        }
    }
}
