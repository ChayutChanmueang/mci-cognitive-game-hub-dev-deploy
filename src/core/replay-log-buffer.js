import db from "./database.js";
import { GlobalReplayEvent } from "./replay-event.js";

const DEFAULT_REPLAY_ID = GlobalReplayEvent.REPLAY_BATCH_PUSHED;

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

export class ReplayLogBuffer {
    constructor({
        hn = "",
        gid = null,
        replayId = DEFAULT_REPLAY_ID,
        userGameDataId = null,
        metadata = null,
        database = db,
        clearAfterPush = true,
    } = {}) {
        this.database = database;
        this.hn = String(hn || "").trim();
        this.gid = gid == null ? null : String(gid).trim() || null;
        this.replayId = String(replayId || DEFAULT_REPLAY_ID).trim();
        this.userGameDataId = userGameDataId == null || userGameDataId === ""
            ? null
            : Number(userGameDataId);
        this.metadata = normalizeJsonValue(metadata) || {};
        this.clearAfterPush = Boolean(clearAfterPush);
        this.replaySessionId = createEventId();
        this.events = [];
        this.startedAt = new Date().toISOString();
        this.lastPushedRecord = null;
    }

    get size() {
        return this.events.length;
    }

    setContext({
        hn = this.hn,
        gid = this.gid,
        replayId = this.replayId,
        userGameDataId = this.userGameDataId,
        metadata = this.metadata,
    } = {}) {
        this.hn = String(hn || "").trim();
        this.gid = gid == null ? null : String(gid).trim() || null;
        this.replayId = String(replayId || DEFAULT_REPLAY_ID).trim();
        this.userGameDataId = userGameDataId == null || userGameDataId === ""
            ? null
            : Number(userGameDataId);
        this.metadata = normalizeJsonValue(metadata) || {};
        return this;
    }

    getEvents() {
        return this.events.map((event) => ({ ...event }));
    }

    addEvent(replayId, value = null, options = {}) {
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
            value: normalizeJsonValue(value),
        };

        this.events.push(event);
        return event;
    }

    clearEvents() {
        this.events = [];
    }

    toReplayValue(extraValue = null) {
        return {
            replaySessionId: this.replaySessionId,
            startedAt: this.startedAt,
            endedAt: new Date().toISOString(),
            metadata: this.metadata,
            eventCount: this.events.length,
            events: this.getEvents(),
            extra: normalizeJsonValue(extraValue),
        };
    }

    toReplayLogRows({
        hn = this.hn,
        gid = this.gid,
        userGameDataId = this.userGameDataId,
        value = null,
    } = {}) {
        const endedAt = new Date().toISOString();
        const extra = normalizeJsonValue(value);

        return this.events.map((event) => ({
            hn,
            gid,
            replayId: event.replayId,
            userGameDataId,
            value: {
                replaySessionId: this.replaySessionId,
                startedAt: this.startedAt,
                endedAt,
                metadata: this.metadata,
                eventCount: this.events.length,
                eventId: event.id,
                sequence: event.sequence,
                createdAt: event.createdAt,
                elapsedMs: event.elapsedMs,
                data: event.value,
                extra,
            },
        }));
    }

    async pushToDatabase({
        hn = this.hn,
        gid = this.gid,
        replayId = this.replayId,
        userGameDataId = this.userGameDataId,
        value = null,
        batchSize = 100,
        clearAfterPush = this.clearAfterPush,
        allowEmpty = false,
    } = {}) {
        const parsedHn = String(hn || "").trim();
        const parsedReplayId = String(replayId || "").trim();

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!parsedReplayId) {
            throw new Error("Invalid replayId");
        }

        if (!allowEmpty && this.events.length === 0) {
            throw new Error("No replay events to push");
        }

        const rows = this.events.length > 0
            ? this.toReplayLogRows({
                hn: parsedHn,
                gid,
                userGameDataId,
                value,
            })
            : [{
                hn: parsedHn,
                gid,
                replayId: parsedReplayId,
                userGameDataId,
                value: this.toReplayValue(value),
            }];
        const record = await this.database.writeReplayLogs(rows, { batchSize });

        this.lastPushedRecord = record;

        if (clearAfterPush) {
            this.clearEvents();
        }

        return record;
    }
}

export default ReplayLogBuffer;
