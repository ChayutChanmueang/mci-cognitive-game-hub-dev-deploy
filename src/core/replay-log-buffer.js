import db from "./database.js";
import { GlobalReplayEvent } from "./replay-event.js";

const REPLAY_LOG_TABLE = "replay_log";
const DEFAULT_REPLAY_ID = GlobalReplayEvent.REPLAY_BATCH_PUSHED;
const GAME_STORAGE = Object.freeze({
    gid: "selected_game_gid",
    stage: "selected_game_stage",
    historyMap: "pending_game_history_by_gid",
});

function createEventId() {
    if (typeof globalThis.crypto?.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }

    return `replay-event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeJsonValue(value) {
    if (value == null) {
        return null;
    }

    const serializedValue = JSON.stringify(value);
    if (serializedValue === undefined) {
        throw new Error("Replay value is not JSON serializable");
    }

    return JSON.parse(serializedValue);
}

/**
 * @typedef {Object} ReplayEventValue
 * @property {boolean} data - Whether this event answer is correct.
 * @property {*} [answer] - Answer text or additional answer data for this event.
 */

function normalizeReplayEventValue(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Replay event value must be an object with answer and data");
    }

    if (typeof value.data !== "boolean") {
        throw new Error("Replay event value.data must be a boolean");
    }

    const replayValue = {
        data: value.data,
    };

    if (Object.prototype.hasOwnProperty.call(value, "answer")) {
        replayValue.answer = normalizeJsonValue(value.answer);
    }

    return replayValue;
}

function parseStorageJson(key, fallbackValue = null) {
    if (typeof sessionStorage === "undefined") {
        return fallbackValue;
    }

    try {
        const rawValue = sessionStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (error) {
        console.warn(`Unable to parse sessionStorage value for ${key}:`, error);
        return fallbackValue;
    }
}

function parseStorageValue(key, fallbackValue = null) {
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

function normalizeNullableInteger(value) {
    if (value == null || value === "") {
        return null;
    }

    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function normalizeUserGameHistory(history = null) {
    if (!history || typeof history !== "object" || Array.isArray(history)) {
        return null;
    }

    const historyId = normalizeNullableInteger(history.historyId ?? history.historyid ?? history.id);
    if (!historyId) {
        return null;
    }

    return {
        historyId,
        id: historyId,
        hn: String(history.hn || "").trim(),
        gid: String(history.gid || "").trim() || null,
        stage: history.stage ?? null,
        nodeKey: String(history.nodeKey || "").trim(),
        startAt: String(history.startAt || history.start_at || "").trim(),
        endAt: history.endAt || history.end_at || null,
        userGameDataId: normalizeNullableInteger(
            history.userGameDataId ?? history.user_game_data_id,
        ),
        checkIn: history.checkIn ?? history.check_in ?? history["check-in"] ?? null,
    };
}

function readSelectedGameKeyFromStorage() {
    if (typeof sessionStorage === "undefined") {
        return { gid: "", stage: "", historyKey: "" };
    }

    const gid = String(parseStorageValue(GAME_STORAGE.gid, "") || "").trim();
    const stage = String(parseStorageValue(GAME_STORAGE.stage, "") || "").trim();
    const historyKey = stage ? `${gid}:stage-${stage}` : gid;

    return { gid, stage, historyKey };
}

function readUserGameHistoryFromStorage() {
    const historyMap = parseStorageJson(GAME_STORAGE.historyMap, {});
    if (!historyMap || typeof historyMap !== "object" || Array.isArray(historyMap)) {
        return null;
    }

    const { gid, stage, historyKey } = readSelectedGameKeyFromStorage();
    const directHistory = normalizeUserGameHistory(historyMap[historyKey] || historyMap[gid]);
    if (directHistory) {
        return directHistory;
    }

    const histories = Object.values(historyMap)
        .map((history) => normalizeUserGameHistory(history))
        .filter(Boolean);

    if (!histories.length) {
        return null;
    }

    return histories.find((history) => (
        (!gid || history.gid === gid)
        && (!stage || String(history.stage ?? "") === stage)
    )) || histories[0];
}

export class ReplayLogBuffer {
    constructor({
        hn = "",
        gid = null,
        replayId = DEFAULT_REPLAY_ID,
        userGameHistory = null,
        history = null,
        historyContext = null,
        metadata = null,
        clearAfterPush = true,
    } = {}) {
        const storedHistory = normalizeUserGameHistory(
            userGameHistory || history || historyContext,
        ) || readUserGameHistoryFromStorage();

        this.database = db;
        this.userGameHistory = storedHistory;
        this.hn = String(storedHistory?.hn || hn || "").trim();
        this.gid = storedHistory?.gid || (gid == null ? null : String(gid).trim() || null);
        this.replayId = String(replayId || DEFAULT_REPLAY_ID).trim();
        this.metadata = normalizeJsonValue(metadata) || {};
        this.clearAfterPush = Boolean(clearAfterPush);
        this.replaySessionId = createEventId();
        this.events = [];
        this.startedAt = new Date().toISOString();
        this.lastPushedRecord = null;

        console.log(`history: ${JSON.stringify(storedHistory)}`)
    }

    get size() {
        return this.events.length;
    }

    get historyId() {
        return this.userGameHistory?.historyId || null;
    }

    setContext({
        hn = this.hn,
        gid = this.gid,
        replayId = this.replayId,
        userGameHistory = this.userGameHistory,
        history = null,
        historyContext = null,
        metadata = this.metadata,
    } = {}) {
        const nextHistory = normalizeUserGameHistory(
            history || historyContext || userGameHistory,
        );

        if (nextHistory) {
            this.setUserGameHistory(nextHistory);
        } else {
            this.hn = String(hn || "").trim();
            this.gid = gid == null ? null : String(gid).trim() || null;
        }

        this.replayId = String(replayId || DEFAULT_REPLAY_ID).trim();
        this.metadata = normalizeJsonValue(metadata) || {};
        return this;
    }

    setUserGameHistory(history) {
        const nextHistory = normalizeUserGameHistory({
            ...(this.userGameHistory || {}),
            ...(history || {}),
        });

        if (!nextHistory) {
            throw new Error("Invalid user game history");
        }

        this.userGameHistory = nextHistory;
        this.hn = nextHistory.hn || this.hn;
        this.gid = nextHistory.gid || this.gid;
        return this.userGameHistory;
    }

    updateUserGameHistory(history) {
        return this.setUserGameHistory(history);
    }

    refreshUserGameHistoryFromStorage() {
        const storedHistory = readUserGameHistoryFromStorage();
        if (storedHistory) {
            this.setUserGameHistory(storedHistory);
        }

        return this.userGameHistory;
    }

    getUserGameHistory() {
        return this.userGameHistory ? { ...this.userGameHistory } : null;
    }

    getEvents() {
        return this.events.map((event) => ({ ...event }));
    }

    /**
     * @param {string} replayId
     * @param {ReplayEventValue} value
     * @param {{ id?: string, createdAt?: string }} options
     */
    addEvent(replayId, value, options = {}) {
        const parsedReplayId = String(replayId || "").trim();
        if (!parsedReplayId) {
            throw new Error("Invalid replayId");
        }

        const event = {
            id: options.id || createEventId(),
            replayId: parsedReplayId,
            sequence: this.events.length + 1,
            createdAt: options.createdAt || new Date().toISOString(),
            elapsedMs: Date.now() - new Date(this.startedAt).getTime(),
            value: normalizeReplayEventValue(value),
        };

        this.events.push(event);
        return event;
    }

    /**
     * @param {string} replayId
     * @param {*} answer
     * @param {boolean} data
     * @param {{ id?: string, createdAt?: string }} options
     */
    addAnswerEvent(replayId, answer, data, options = {}) {
        if (typeof data !== "boolean") {
            throw new Error("Replay answer event data must be a boolean");
        }

        return this.addEvent(replayId, {
            data,
            answer,
        }, options);
    }

    /**
     * @param {string} replayId
     * @param {boolean} data
     * @param {{ id?: string, createdAt?: string }} options
     */
    addCorrectEvent(replayId, data, options = {}) {
        if (typeof data !== "boolean") {
            throw new Error("Replay answer event data must be a boolean");
        }

        return this.addEvent(replayId, {
            data,
        }, options);
    }

    clearEvents() {
        this.events = [];
    }

    toReplayLogRows({
        hn = this.hn,
        gid = this.gid,
        historyId = this.historyId,
    } = {}) {
        const parsedHistoryId = normalizeNullableInteger(historyId);

        return this.events.map((event) => ({
            hn,
            replayid: event.replayId,
            gid,
            historyid: parsedHistoryId,
            value: event.value,
        }));
    }

    async pushToDatabase({
        batchSize = 100,
        clearAfterPush = this.clearAfterPush,
        allowEmpty = false,
    } = {}) {
        const hn = this.hn;
        const gid = this.gid;
        const replayId = this.replayId;
        const historyId = this.historyId;
        this.refreshUserGameHistoryFromStorage();

        const parsedHn = String(this.userGameHistory?.hn || hn || "").trim();
        const parsedGid = this.userGameHistory?.gid || (gid == null ? null : String(gid).trim() || null);
        const parsedReplayId = String(replayId || "").trim();
        const parsedHistoryId = normalizeNullableInteger(this.userGameHistory?.historyId || historyId);
        const parsedBatchSize = Number(batchSize);

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!parsedGid) {
            throw new Error("Invalid gid");
        }

        if (!parsedReplayId) {
            throw new Error("Invalid replayId");
        }

        if (!parsedHistoryId) {
            throw new Error("Invalid historyId");
        }

        if (!Number.isInteger(parsedBatchSize) || parsedBatchSize <= 0) {
            throw new Error("Invalid batchSize");
        }

        if (!allowEmpty && this.events.length === 0) {
            throw new Error("No replay events to push");
        }

        const rows = this.events.length > 0
            ? this.toReplayLogRows({
                hn: parsedHn,
                gid: parsedGid,
                historyId: parsedHistoryId
            })
            : [{
                hn: parsedHn,
                gid: parsedGid,
                replayid: parsedReplayId
            }];
        const records = await this.pushRowsToDatabase(rows, parsedBatchSize);

        this.lastPushedRecord = records;

        if (clearAfterPush) {
            this.clearEvents();
        }

        return records;
    }

    async pushRowsToDatabase(rows, batchSize) {
        await this.database.initAuth();

        const insertedRows = [];
        for (let index = 0; index < rows.length; index += batchSize) {
            const batch = rows.slice(index, index + batchSize);
            const batchRows = await this.withRetry(async () => {
                const client = this.database.getClient();
                const { data, error } = await client
                    .from(REPLAY_LOG_TABLE)
                    .insert(batch)
                    .select("id, created_at, hn, replayid, gid, value, historyid");

                if (error) {
                    throw error;
                }

                return data || [];
            });

            insertedRows.push(...batchRows);
        }

        return insertedRows;
    }

    async withRetry(operation, { attempts = 3, delayMs = 500 } = {}) {
        let lastError = null;

        for (let attempt = 1; attempt <= attempts; attempt += 1) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (attempt >= attempts) {
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
            }
        }

        throw lastError;
    }
}

export default ReplayLogBuffer;
