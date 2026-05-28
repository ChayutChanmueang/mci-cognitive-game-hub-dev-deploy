import db from "./database.js";
import { isUserEvent } from "./user-event.js";

const USER_LOG_TABLE = "game_user_log";

function normalizeJsonValue(value) {
    if (value == null) {
        return {};
    }

    try {
        const serializedValue = JSON.stringify(value);
        if (serializedValue === undefined) {
            throw new Error("Value is not JSON serializable");
        }

        return JSON.parse(serializedValue);
    } catch (error) {
        throw new Error(`Invalid user log value: ${error?.message || "not JSON serializable"}`);
    }
}

export class UserLog {
    constructor({ database = db } = {}) {
        this.database = database;
    }

    buildPayload({
        hn,
        actionId = null,
        actionid = null,
        value = {},
    } = {}) {
        const parsedHn = String(hn || "").trim();
        const parsedActionId = String(actionId || actionid || "").trim();

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!parsedActionId) {
            throw new Error("Invalid actionId");
        }

        if (!isUserEvent(parsedActionId)) {
            throw new Error(`Unsupported actionId: ${parsedActionId}`);
        }

        return {
            hn: parsedHn,
            actionid: parsedActionId,
            value: normalizeJsonValue(value),
        };
    }

    async write(params) {
        const payload = this.buildPayload(params);

        await this.database.initAuth();

        const client = this.database.getClient();
        const { error } = await client
            .from(USER_LOG_TABLE)
            .insert([payload]);

        if (error) {
            throw error;
        }

        return payload;
    }

    async logEvent(actionId, { hn, value = {} } = {}) {
        return this.write({
            hn,
            actionId,
            value,
        });
    }
}

export default new UserLog();
