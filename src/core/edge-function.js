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

    logUserEventKeepalive(hn, actionId, value = {}) {
        const parsedHn = String(hn || "").trim();
        const parsedActionId = String(actionId || "").trim();

        if (!parsedHn || !parsedActionId || !VALID_ACTION_IDS.includes(parsedActionId)) {
            return;
        }

        if (!this.supabaseUrl || !this.supabaseAnonKey) {
            return;
        }

        const url = `${this.supabaseUrl}/functions/v1/mci_functions_log/write-database/logUserEvent`;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.supabaseAnonKey}`,
            },
            body: JSON.stringify({ hn: parsedHn, actionId: parsedActionId, value }),
            keepalive: true,
        }).catch(() => {});
    }

    async getLeaderboard({ offset = 0, limit = 20 } = {}) {
        if (!this.supabaseUrl || !this.supabaseAnonKey) {
            throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
        }

        const url = `${this.supabaseUrl}/functions/v1/mci_functions_leaderboard/getLeaderboard`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.supabaseAnonKey}`,
            },
            body: JSON.stringify({ offset, limit }),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `Edge function error: ${response.status}`);
        }

        return response.json();
    }

    async logUserEvent(hn, actionId, value = {}) {
        const parsedHn = String(hn || "").trim();
        const parsedActionId = String(actionId || "").trim();

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!parsedActionId || !VALID_ACTION_IDS.includes(parsedActionId)) {
            throw new Error(`Invalid or unsupported actionId: ${parsedActionId}`);
        }

        if (!this.supabaseUrl || !this.supabaseAnonKey) {
            throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
        }

        const url = `${this.supabaseUrl}/functions/v1/mci_functions_log/write-database/logUserEvent`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.supabaseAnonKey}`,
            },
            body: JSON.stringify({ hn: parsedHn, actionId: parsedActionId, value }),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `Edge function error: ${response.status}`);
        }

        return response.json();
    }
}

export default new EdgeFunction();
