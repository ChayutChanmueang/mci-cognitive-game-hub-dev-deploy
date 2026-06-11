const VALID_ACTION_IDS = Object.freeze([
    "user.login",
    "user.logout",
    "game.opened",
    "game.closed",
]);

class EdgeFunction {
    constructor() {
        const env = import.meta.env || {};
        this.supabaseUrl = env.VITE_SUPABASE_URL || "";
        this.supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "";
    }

    _post(path, body, options = {}) {
        if (!this.supabaseUrl || !this.supabaseAnonKey) {
            if (options.keepalive) return;
            throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
        }

        const url = `${this.supabaseUrl}/functions/v1/mci_functions/${path}`;
        const init = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.supabaseAnonKey}`,
            },
            body: JSON.stringify(body),
            ...options,
        };

        if (options.keepalive) {
            fetch(url, init).catch(() => {});
            return;
        }

        return fetch(url, init);
    }

    logUserEventKeepalive(hn, actionId, value = {}) {
        const parsedHn = String(hn || "").trim();
        const parsedActionId = String(actionId || "").trim();

        if (!parsedHn || !parsedActionId || !VALID_ACTION_IDS.includes(parsedActionId)) {
            return;
        }

        this._post("write-database/logUserEvent", { hn: parsedHn, actionId: parsedActionId, value }, { keepalive: true });
    }

    async logUserEvent(hn, actionId, value = {}) {
        const parsedHn = String(hn || "").trim();
        const parsedActionId = String(actionId || "").trim();

        if (!parsedHn) throw new Error("Invalid hn");
        if (!parsedActionId || !VALID_ACTION_IDS.includes(parsedActionId)) {
            throw new Error(`Invalid or unsupported actionId: ${parsedActionId}`);
        }

        const response = await this._post("write-database/logUserEvent", { hn: parsedHn, actionId: parsedActionId, value });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `Edge function error: ${response.status}`);
        }
        return response.json();
    }

    async getUserRank(hn) {
        const response = await this._post("read-database/getUserRank", { hn });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `Edge function error: ${response.status}`);
        }
        return response.json();
    }

    async getLeaderboard({ offset = 0, limit = 20 } = {}) {
        const response = await this._post("read-database/getLeaderboard", { offset, limit });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `Edge function error: ${response.status}`);
        }
        return response.json();
    }
}

export default new EdgeFunction();
