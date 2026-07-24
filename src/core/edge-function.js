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

    /**
     * US-E10-02 — `hn` ใช้ให้ฝั่ง server หากลุ่มของผู้ดูเอง (ไม่ได้ส่ง GRPID มาเพราะปลอมได้)
     * `null` = ยังไม่รู้ว่าใครดู → server ปฏิบัติเหมือน UNTAGGED คือเห็นทุกกลุ่ม
     */
    async getLeaderboard({ offset = 0, limit = 20, hn = null } = {}) {
        const parsedHn = String(hn ?? "").trim();
        const response = await this._post("read-database/getLeaderboard", {
            offset,
            limit,
            hn: parsedHn || null,
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `Edge function error: ${response.status}`);
        }
        return response.json();
    }

    /**
     * เรียก export action แล้วคืนเฉพาะ rows
     *
     * `hn` ว่าง/null = ทุกคน — ฝั่ง edge function ตีความ `""` ว่า "ทุกคน" โดยตั้งใจ
     * (ต่างจาก getUserRank ที่ `""` → 400) จึงส่ง null ไปให้ชัดแทนที่จะพึ่งการตีความ
     *
     * paging กัน max_rows = 1000 เกิดฝั่ง server ทั้งหมด — ที่นี่ได้ก้อนเดียวครบแล้ว
     */
    async _postExport(action, hn) {
        const parsedHn = String(hn ?? "").trim();
        const response = await this._post(`read-database/${action}`, { hn: parsedHn || null });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `Edge function error: ${response.status}`);
        }

        const body = await response.json();
        return body?.rows || [];
    }

    /** ข้อมูลผู้เล่นสำหรับ PLAYER_CSV_COLUMNS — hn ว่าง = ทุกคน */
    async getPlayerExportRows(hn = null) {
        return this._postExport("getPlayerExportRows", hn);
    }

    /** ข้อมูลการเล่นรายครั้งสำหรับ GAME_CSV_COLUMNS — hn ว่าง = ทุกคน */
    async getGameExportRows(hn = null) {
        return this._postExport("getGameExportRows", hn);
    }

    /** ประวัติรายวัน (ผู้เล่น × วันโปรแกรม) สำหรับ GAME_HISTORY_CSV_COLUMNS — hn ว่าง = ทุกคน */
    async getGameHistoryExportRows(hn = null) {
        return this._postExport("getGameHistoryExportRows", hn);
    }
}

export default new EdgeFunction();
