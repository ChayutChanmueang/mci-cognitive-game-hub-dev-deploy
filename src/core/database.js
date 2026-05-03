import { createClient } from "@supabase/supabase-js";
import {
    isCompleteThaiPhoneNumber,
    normalizeThaiPhoneNumber,
} from "../util/phone-number-util.js";

const GAME_LIST_TABLE = "game_list_data";
const USER_GAME_DATA_TABLE = "user_game_data";
const USER_GAME_HISTORY_TABLE = "user_game_history";
const USER_EVENT_LOG_TABLE = "user_event_log";
const USER_PATIENT_DATA_TABLE = "user_patient_data";
const USER_EDUCATION_LEVEL_TABLE = "user_education_level";
const DEFAULT_GAME_PAGE_SIZE = 10;
const EVENT_IDS = Object.freeze({
    OPEN_APP: "OPAPP",
    START_PLAY_GAME: "SPG",
});

class Database {
    constructor() {
        this.client = null;
        this.authReadyPromise = null;
        this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
        this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
    }

    getLocalDayRange(dateValue) {
        const start = new Date(dateValue);
        if (Number.isNaN(start.getTime())) {
            throw new Error("Invalid dateValue");
        }

        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        return {
            start,
            end,
        };
    }

    getClient() {
        if (this.client) {
            return this.client;
        }

        // Re-read from env to handle cases where they might be populated late or constructor missed them
        const url = import.meta.env.VITE_SUPABASE_URL || this.supabaseUrl;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY || this.supabaseAnonKey;

        if (!url || !key) {
            throw new Error(
                "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Please check your environment variables.",
            );
        }

        this.client = createClient(url, key, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        });

        return this.client;
    }

    async initAuth() {
        if (!this.authReadyPromise) {
            this.authReadyPromise = this.ensureSignedIn().catch((error) => {
                this.authReadyPromise = null;
                console.error("Auth initialization failed:", error);
                throw error;
            });
        }

        return this.authReadyPromise;
    }

    async ensureSignedIn() {
        let lastError = null;
        for (let i = 0; i < 3; i++) {
            try {
                const client = this.getClient();
                const { data, error } = await client.auth.getSession();

                if (error) throw error;
                if (data.session) return data.session;

                const anonymousResult = await this.signInAnonymously();
                if (anonymousResult.session) return anonymousResult.session;
            } catch (err) {
                lastError = err;
                console.warn(`Auth attempt ${i + 1} failed, retrying...`, err);
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        throw lastError || new Error("Failed to ensure sign-in after multiple attempts");
    }

    async signInAnonymously() {
        const client = this.getClient();
        const { data, error } = await client.auth.signInAnonymously();

        if (error) {
            throw error;
        }

        return data;
    }

    async login(email, password) {
        const client = this.getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        this.authReadyPromise = data.session ? Promise.resolve(data.session) : null;
        return data;
    }

    async signup(email, password, options = {}) {
        const client = this.getClient();
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options,
        });

        if (error) {
            throw error;
        }

        this.authReadyPromise = data.session ? Promise.resolve(data.session) : null;
        return data;
    }

    async signOut() {
        const client = this.getClient();
        const { error } = await client.auth.signOut();

        if (error) {
            throw error;
        }

        this.authReadyPromise = null;
        return true;
    }

    async getCurrentSession() {
        const client = this.getClient();
        const { data, error } = await client.auth.getSession();

        if (error) {
            throw error;
        }

        return data.session;
    }

    async getCurrentUser() {
        const session = await this.getCurrentSession();
        return session?.user || null;
    }

    async getPatientByHn(hn) {
        const parsedHn = String(hn || "").trim();
        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_PATIENT_DATA_TABLE)
            .select("id, uid, hn, firstname, lastname, phone, gender, education_level, started_program, date")
            .eq("hn", parsedHn)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

    async getPatientByUid(uid) {
        const parsedUid = String(uid || "").trim();
        if (!parsedUid) {
            throw new Error("Invalid uid");
        }

        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_PATIENT_DATA_TABLE)
            .select("id, uid, hn, firstname, lastname, phone, gender, education_level, started_program, date")
            .eq("uid", parsedUid)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

    async patientExists(hn) {
        const patient = await this.getPatientByHn(hn);
        return Boolean(patient);
    }

    async getEducationLevels() {
        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_EDUCATION_LEVEL_TABLE)
            .select("id, eduid, name, dropdown_index")
            .order("dropdown_index", { ascending: true, nullsFirst: false })
            .order("id", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }

    async createPatientProfile({
        hn,
        firstname,
        lastname,
        phone,
        birthDate,
        gender,
        educationLevel,
        startedProgram,
    }) {
        const session = await this.initAuth();
        const user = session?.user || (await this.getCurrentUser());
        const parsedHn = String(hn || "").trim();
        const parsedFirstname = String(firstname || "").trim();
        const parsedLastname = String(lastname || "").trim();
        const parsedPhone = normalizeThaiPhoneNumber(phone);
        const parsedGender = String(gender || "").trim();
        const parsedEducation = String(educationLevel || "").trim();
        const normalizedStartedProgram = new Date(startedProgram);
        const parsedBirthDate = String(birthDate || "").trim();
        const normalizedBirthDate = new Date(parsedBirthDate);

        if (!parsedHn) {
            throw new Error("Missing patient ID");
        }

        if (!parsedFirstname) {
            throw new Error("กรุณากรอกชื่อ");
        }

        if (!parsedLastname) {
            throw new Error("กรุณากรอกนามสกุล");
        }

        if (!parsedPhone) {
            throw new Error("กรุณากรอกเบอร์โทร");
        }

        if (!isCompleteThaiPhoneNumber(parsedPhone)) {
            throw new Error("กรุณากรอกเบอร์โทร 10 หลัก");
        }

        if (!parsedBirthDate || Number.isNaN(normalizedBirthDate.getTime())) {
            throw new Error("กรุณาเลือกวันเกิด");
        }

        if (normalizedBirthDate > new Date()) {
            throw new Error("วันเกิดต้องไม่เป็นวันในอนาคต");
        }

        if (!parsedGender) {
            throw new Error("กรุณาเลือกเพศ");
        }

        if (!parsedEducation) {
            throw new Error("กรุณาเลือกระดับการศึกษา");
        }

        if (Number.isNaN(normalizedStartedProgram.getTime())) {
            throw new Error("กรุณาเลือกวันที่เริ่มโปรแกรม");
        }

        if (!user?.id) {
            throw new Error("Missing authenticated user");
        }

        const payload = {
            uid: user.id,
            hn: parsedHn,
            firstname: parsedFirstname,
            lastname: parsedLastname,
            phone: parsedPhone,
            gender: parsedGender,
            education_level: parsedEducation,
            started_program: normalizedStartedProgram.toISOString(),
            date: parsedBirthDate,
        };

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_PATIENT_DATA_TABLE)
            .insert([payload])
            .select("id, uid, hn, firstname, lastname, phone, gender, education_level, started_program, date")
            .maybeSingle();

        if (error) {
            if (error.code === "23505") {
                const duplicateTarget = [
                    error.message,
                    error.details,
                    error.hint,
                    error.constraint,
                ].map((value) => String(value || "").toLowerCase()).join(" ");

                if (duplicateTarget.includes("phone")) {
                    throw new Error("เบอร์โทรนี้ถูกใช้งานแล้ว");
                }

                throw new Error("Patient ID นี้ถูกใช้งานแล้ว");
            }

            throw error;
        }

        return data || payload;
    }

    async getGameList() {
        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(GAME_LIST_TABLE)
            .select("id, gid, name, mci_group, created_at")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }

    async getGamesByMciGroup(mciGroup, options = {}) {
        const parsedGroup = String(mciGroup || "").trim();
        const pageSize = Math.max(1, Number(options.pageSize) || DEFAULT_GAME_PAGE_SIZE);
        const offset = Math.max(0, Number(options.offset) || 0);

        if (!parsedGroup) {
            throw new Error("Invalid mciGroup");
        }

        await this.initAuth();

        const client = this.getClient();
        const rangeEnd = offset + pageSize - 1;
        const { data, error, count } = await client
            .from(GAME_LIST_TABLE)
            .select("id, gid, name, mci_group, max_score, created_at", { count: "exact" })
            .eq("mci_group", parsedGroup)
            .order("created_at", { ascending: true })
            .range(offset, rangeEnd);

        if (error) {
            throw error;
        }

        const items = data || [];
        const total = Number(count) || 0;

        return {
            items,
            total,
            offset,
            pageSize,
            nextOffset: offset + items.length,
            hasMore: offset + items.length < total,
        };
    }

    async getGameByGid(gid) {
        const parsedGid = String(gid || "").trim();
        if (!parsedGid) {
            throw new Error("Invalid gid");
        }

        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(GAME_LIST_TABLE)
            .select("id, gid, name, mci_group, created_at")
            .eq("gid", parsedGid)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

    async _withRetry(operation, maxRetries = 3) {
        let lastError = null;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (err) {
                lastError = err;
                console.warn(`Database operation attempt ${i + 1} failed, retrying...`, err);
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }
        throw lastError;
    }

    async submitGameData({ gid, score = null, level = null, startedAt, endedAt }) {
        const session = await this.initAuth();
        const user = session?.user || (await this.getCurrentUser());
        const parsedGid = String(gid || "").trim();
        const parsedScore = score == null ? null : Number(score);
        const parsedLevel = level == null ? null : Number(level);
        const normalizedStartedAt = new Date(startedAt);
        const normalizedEndedAt = new Date(endedAt);

        if (!parsedGid) {
            throw new Error("Invalid gid");
        }

        if (parsedScore != null && (!Number.isFinite(parsedScore) || parsedScore < 0)) {
            throw new Error("Invalid score");
        }

        if (parsedLevel != null && (!Number.isFinite(parsedLevel) || parsedLevel < 0)) {
            throw new Error("Invalid level");
        }

        if (Number.isNaN(normalizedStartedAt.getTime())) {
            throw new Error("Invalid startedAt");
        }

        if (Number.isNaN(normalizedEndedAt.getTime())) {
            throw new Error("Invalid endedAt");
        }

        if (normalizedEndedAt < normalizedStartedAt) {
            throw new Error("endedAt must be greater than or equal to startedAt");
        }

        if (!user?.id) {
            throw new Error("Missing authenticated user");
        }

        const payload = {
            gid: parsedGid,
            score: parsedScore == null ? null : Math.floor(parsedScore),
            level: parsedLevel == null ? null : Math.floor(parsedLevel),
            started_at: normalizedStartedAt.toISOString(),
            ended_at: normalizedEndedAt.toISOString(),
        };

        return this._withRetry(async () => {
            const client = this.getClient();
            const { data, error } = await client
                .from(USER_GAME_DATA_TABLE)
                .insert([payload])
                .select("id, gid, started_at, ended_at")
                .maybeSingle();

            if (error) throw error;
            return data || payload;
        });
    }

    async addUserGameHistory({
        hn,
        gid = null,
        startAt = null,
        endAt = null,
        playedAt = null,
        userGameDataId = null,
        rest = false,
        checkIn = false,
        // Test-only controls can set false to insert fake same-day completion rows.
        reuseExisting = true,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedGid = gid == null ? "" : String(gid).trim();
        const parsedStartAt = new Date(startAt || playedAt || new Date().toISOString());
        const parsedEndAt = endAt == null ? null : new Date(endAt);
        const parsedUserGameDataId = userGameDataId == null ? null : Number(userGameDataId);
        const parsedCheckIn = Boolean(checkIn);

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!parsedGid && !parsedCheckIn) {
            throw new Error("Invalid gid");
        }

        if (Boolean(rest) && !parsedGid) {
            throw new Error("Invalid rest gid");
        }

        if (Number.isNaN(parsedStartAt.getTime())) {
            throw new Error("Invalid startAt");
        }

        if (parsedEndAt != null && Number.isNaN(parsedEndAt.getTime())) {
            throw new Error("Invalid endAt");
        }

        if (parsedEndAt != null && parsedEndAt < parsedStartAt) {
            throw new Error("endAt must be greater than or equal to startAt");
        }

        if (parsedUserGameDataId != null && !Number.isInteger(parsedUserGameDataId)) {
            throw new Error("Invalid userGameDataId");
        }

        await this.initAuth();

        const payload = {
            hn: parsedHn,
            gid: parsedGid || null,
            start_at: parsedStartAt.toISOString(),
            user_game_data_id: parsedUserGameDataId,
        };
        // Test-only fake completion rows can provide end_at without creating user_game_data.
        if (parsedEndAt != null) {
            payload.end_at = parsedEndAt.toISOString();
        }

        const client = this.getClient();

        if (Boolean(reuseExisting) && parsedGid && !Boolean(rest) && !parsedCheckIn && parsedUserGameDataId == null) {
            const { start, end } = this.getLocalDayRange(parsedStartAt);
            const { data: existingRows, error: existingError } = await client
                .from(USER_GAME_HISTORY_TABLE)
                .select("id, hn, gid, start_at, end_at, user_game_data_id")
                .eq("hn", parsedHn)
                .eq("gid", parsedGid)
                .gte("start_at", start.toISOString())
                .lt("start_at", end.toISOString())
                .order("start_at", { ascending: false })
                .limit(20);

            if (existingError) {
                throw existingError;
            }

            const existingHistory = (existingRows || []).find((row) => !row?.end_at) || existingRows?.[0] || null;
            if (existingHistory?.id) {
                return existingHistory;
            }
        }

        const insertHistory = async (insertPayload) => client
            .from(USER_GAME_HISTORY_TABLE)
            .insert([insertPayload])
            .select("id, hn, gid, start_at, end_at, user_game_data_id, \"check-in\"")
            .maybeSingle();

        let insertPayload = payload;
        if (parsedCheckIn) {
            insertPayload = {
                ...payload,
                "check-in": true,
            };
        }

        let { data, error } = await insertHistory(insertPayload);

        if (error && parsedCheckIn) {
            const fallbackPayload = {
                ...payload,
                check_in: true,
            };

            ({ data, error } = await insertHistory(fallbackPayload));
        }

        if (error) {
            throw error;
        }

        return data || insertPayload;
    }

    /*
     * Future Game Hub retry flow:
     * When addUserGameHistory(...) returns an existing same-day game history row,
     * call refreshUserGameHistoryStartAt({ historyId: row.id, startAt: new Date() })
     * before launching the minigame. This keeps the retry start time accurate while
     * still reusing the database row instead of creating duplicate history records.
     */
    async refreshUserGameHistoryStartAt({
        historyId,
        startAt = new Date().toISOString(),
    }) {
        const parsedHistoryId = Number(historyId);
        const parsedStartAt = new Date(startAt);

        if (!Number.isInteger(parsedHistoryId) || parsedHistoryId <= 0) {
            throw new Error("Invalid historyId");
        }

        if (Number.isNaN(parsedStartAt.getTime())) {
            throw new Error("Invalid startAt");
        }

        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_GAME_HISTORY_TABLE)
            .update({
                start_at: parsedStartAt.toISOString(),
            })
            .eq("id", parsedHistoryId)
            .select("id, hn, gid, start_at, end_at, user_game_data_id")
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

    async completeUserGameHistory({
        historyId,
        endAt = new Date().toISOString(),
        userGameDataId,
    }) {
        const parsedHistoryId = Number(historyId);
        const parsedUserGameDataId = Number(userGameDataId);
        const parsedEndAt = new Date(endAt);

        if (!Number.isInteger(parsedHistoryId) || parsedHistoryId <= 0) {
            throw new Error("Invalid historyId");
        }

        if (!Number.isInteger(parsedUserGameDataId) || parsedUserGameDataId <= 0) {
            throw new Error("Invalid userGameDataId");
        }

        if (Number.isNaN(parsedEndAt.getTime())) {
            throw new Error("Invalid endAt");
        }

        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_GAME_HISTORY_TABLE)
            .update({
                end_at: parsedEndAt.toISOString(),
                user_game_data_id: parsedUserGameDataId,
            })
            .eq("id", parsedHistoryId)
            .select("id, hn, gid, start_at, end_at, user_game_data_id")
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

    /*
     * Example game-completion flow:
     *
     * const pendingHistoryMapKey = "pending_game_history_by_gid";
     * const pendingHistoryMap = JSON.parse(sessionStorage.getItem(pendingHistoryMapKey) || "{}");
     * const pendingHistory = pendingHistoryMap[gid];
     *
     * if (!pendingHistory?.id) {
     *     throw new Error(`Missing pending user_game_history for ${gid}`);
     * }
     *
     * const endedAt = new Date().toISOString();
     * const gameData = await db.submitGameData({
     *     gid,
     *     score,
     *     level,
     *     startedAt: pendingHistory.startAt,
     *     endedAt,
     * });
     *
     * await db.completeUserGameHistory({
     *     historyId: pendingHistory.id,
     *     endAt: endedAt,
     *     userGameDataId: gameData.id,
     * });
     *
     * delete pendingHistoryMap[gid];
     * if (Object.keys(pendingHistoryMap).length > 0) {
     *     sessionStorage.setItem(pendingHistoryMapKey, JSON.stringify(pendingHistoryMap));
     * } else {
     *     sessionStorage.removeItem(pendingHistoryMapKey);
     * }
     */

    async getCompletedUserGameHistoryByHn({
        hn,
        gids = [],
        startFrom = null,
        startTo = null,
        playedFrom = null,
        playedTo = null,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedGids = Array.isArray(gids)
            ? gids.map((gid) => String(gid || "").trim()).filter(Boolean)
            : [];

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!parsedGids.length) {
            return [];
        }

        await this.initAuth();

        const client = this.getClient();
        let query = client
            .from(USER_GAME_HISTORY_TABLE)
            .select("id, gid, start_at, end_at, user_game_data_id")
            .eq("hn", parsedHn)
            .in("gid", parsedGids)
            .not("end_at", "is", null);

        const fromValue = startFrom || playedFrom;
        const toValue = startTo || playedTo;

        if (fromValue) {
            const parsedFrom = new Date(fromValue);
            if (Number.isNaN(parsedFrom.getTime())) {
                throw new Error("Invalid startFrom");
            }
            query = query.gte("start_at", parsedFrom.toISOString());
        }

        if (toValue) {
            const parsedTo = new Date(toValue);
            if (Number.isNaN(parsedTo.getTime())) {
                throw new Error("Invalid startTo");
            }
            query = query.lt("start_at", parsedTo.toISOString());
        }

        const { data, error } = await query.order("start_at", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }

    async getInstantUserNodeHistoryByHn({
        hn,
        restGid = "REST001",
        startFrom = null,
        startTo = null,
        playedFrom = null,
        playedTo = null,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedRestGid = String(restGid || "").trim();

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        await this.initAuth();

        const client = this.getClient();
        const fromValue = startFrom || playedFrom;
        const toValue = startTo || playedTo;

        const applyDateRange = (query) => {
            let scopedQuery = query;

            if (fromValue) {
                const parsedFrom = new Date(fromValue);
                if (Number.isNaN(parsedFrom.getTime())) {
                    throw new Error("Invalid startFrom");
                }
                scopedQuery = scopedQuery.gte("start_at", parsedFrom.toISOString());
            }

            if (toValue) {
                const parsedTo = new Date(toValue);
                if (Number.isNaN(parsedTo.getTime())) {
                    throw new Error("Invalid startTo");
                }
                scopedQuery = scopedQuery.lt("start_at", parsedTo.toISOString());
            }

            return scopedQuery;
        };

        const restQuery = parsedRestGid
            ? applyDateRange(
                client
                    .from(USER_GAME_HISTORY_TABLE)
                    .select("id, gid, start_at, end_at, user_game_data_id")
                    .eq("hn", parsedHn)
                    .eq("gid", parsedRestGid),
            )
            : null;
        const checkInQuery = applyDateRange(
            client
                .from(USER_GAME_HISTORY_TABLE)
                .select("id, gid, start_at, end_at, user_game_data_id")
                .eq("hn", parsedHn)
                .eq("check-in", true),
        );

        const [restResult, checkInResult] = await Promise.all([
            restQuery || Promise.resolve({ data: [], error: null }),
            checkInQuery,
        ]);

        if (restResult.error) {
            throw restResult.error;
        }

        let resolvedCheckInResult = checkInResult;
        if (resolvedCheckInResult.error) {
            resolvedCheckInResult = await applyDateRange(
                client
                    .from(USER_GAME_HISTORY_TABLE)
                    .select("id, gid, start_at, end_at, user_game_data_id")
                    .eq("hn", parsedHn)
                    .eq("check_in", true),
            );
        }

        if (resolvedCheckInResult.error) {
            resolvedCheckInResult = await applyDateRange(
                client
                    .from(USER_GAME_HISTORY_TABLE)
                    .select("id, gid, start_at, end_at, user_game_data_id")
                    .eq("hn", parsedHn)
                    .is("gid", null),
            );
        }

        if (resolvedCheckInResult.error) {
            throw resolvedCheckInResult.error;
        }

        return [
            ...(restResult.data || []).map((row) => ({ ...row, rest: true })),
            ...(resolvedCheckInResult.data || []).map((row) => ({ ...row, "check-in": true })),
        ].sort((first, second) => (
            new Date(first.start_at || 0).getTime() - new Date(second.start_at || 0).getTime()
        ));
    }

    async getUserCheckInDatesByHn({ hn }) {
        const parsedHn = String(hn || "").trim();

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        await this.initAuth();

        const client = this.getClient();
        const checkInDateKeys = new Set();
        const toDateKey = (value) => {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return "";
            }

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        const collectDateKeys = (rows) => {
            (rows || []).forEach((row) => {
                const key = toDateKey(row?.start_at || row?.played_at);
                if (key) {
                    checkInDateKeys.add(key);
                }
            });
        };
        const queryByCheckInColumn = async (columnName) => client
            .from(USER_GAME_HISTORY_TABLE)
            .select("start_at")
            .eq("hn", parsedHn)
            .eq(columnName, true)
            .order("start_at", { ascending: true });

        let result = await queryByCheckInColumn("check-in");

        if (result.error) {
            result = await queryByCheckInColumn("check_in");
        }

        if (result.error) {
            // Compatibility fallback: old test data might only have gid = null for check-in rows.
            const fallback = await client
                .from(USER_GAME_HISTORY_TABLE)
                .select("start_at")
                .eq("hn", parsedHn)
                .is("gid", null)
                .order("start_at", { ascending: true });

            if (fallback.error) {
                throw fallback.error;
            }

            collectDateKeys(fallback.data);
            return [...checkInDateKeys];
        }

        collectDateKeys(result.data);
        return [...checkInDateKeys];
    }

    async getUserGameHistoryByHn({
        hn,
        playedFrom = null,
        playedTo = null,
    }) {
        const parsedHn = String(hn || "").trim();

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        await this.initAuth();

        const client = this.getClient();
        let query = client
            .from(USER_GAME_HISTORY_TABLE)
            .select("gid, start_at, end_at, user_game_data_id, \"check-in\"")
            .eq("hn", parsedHn);

        if (playedFrom) {
            const parsedFrom = new Date(playedFrom);
            if (Number.isNaN(parsedFrom.getTime())) {
                throw new Error("Invalid playedFrom");
            }
            query = query.gte("start_at", parsedFrom.toISOString());
        }

        if (playedTo) {
            const parsedTo = new Date(playedTo);
            if (Number.isNaN(parsedTo.getTime())) {
                throw new Error("Invalid playedTo");
            }
            query = query.lt("start_at", parsedTo.toISOString());
        }

        const { data, error } = await query.order("start_at", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }

    async deleteUserGameHistoryByHn({
        hn,
        playedFrom,
        playedTo,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedFrom = new Date(playedFrom);
        const parsedTo = new Date(playedTo);

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (Number.isNaN(parsedFrom.getTime())) {
            throw new Error("Invalid playedFrom");
        }

        if (Number.isNaN(parsedTo.getTime())) {
            throw new Error("Invalid playedTo");
        }

        await this.initAuth();

        const client = this.getClient();
        const { error } = await client
            .from(USER_GAME_HISTORY_TABLE)
            .delete()
            .eq("hn", parsedHn)
            .gte("start_at", parsedFrom.toISOString())
            .lt("start_at", parsedTo.toISOString());

        if (error) {
            throw error;
        }
    }

    async logUserEvent(eventId, gid = null) {
        const session = await this.initAuth();
        const user = session?.user || (await this.getCurrentUser());
        const parsedEventId = String(eventId || "").trim().toUpperCase();
        const parsedGid = gid == null ? null : String(gid).trim();

        if (!parsedEventId) {
            throw new Error("Invalid eventId");
        }

        if (!Object.values(EVENT_IDS).includes(parsedEventId)) {
            throw new Error(`Unsupported eventId: ${parsedEventId}`);
        }

        if (parsedGid === "") {
            throw new Error("Invalid gid");
        }

        if (!user?.id) {
            throw new Error("Missing authenticated user");
        }

        const payload = {
            eventid: parsedEventId,
            gid: parsedGid,
        };

        return this._withRetry(async () => {
            const client = this.getClient();
            const { error } = await client
                .from(USER_EVENT_LOG_TABLE)
                .insert([payload]);

            if (error) {
                // If it's a foreign key error, retrying won't help, but we log it specifically
                if (error.code === "23503") {
                    console.error(`Logging failed: Event ID "${parsedEventId}" not found in database lookup table.`, error);
                    return payload; // Return payload to indicate "processed" even if failed to save
                }
                throw error;
            }
            return payload;
        });
    }
}

export default new Database();
