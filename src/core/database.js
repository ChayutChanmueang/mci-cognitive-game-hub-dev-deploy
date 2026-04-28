import { createClient } from "@supabase/supabase-js";

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

    getClient() {
        if (this.client) {
            return this.client;
        }

        if (!this.supabaseUrl || !this.supabaseAnonKey) {
            throw new Error(
                "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in the frontend environment.",
            );
        }

        this.client = createClient(this.supabaseUrl, this.supabaseAnonKey, {
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
                throw error;
            });
        }

        return this.authReadyPromise;
    }

    async ensureSignedIn() {
        const client = this.getClient();
        const { data, error } = await client.auth.getSession();

        if (error) {
            throw error;
        }

        if (data.session) {
            return data.session;
        }

        const anonymousResult = await this.signInAnonymously();
        if (!anonymousResult.session) {
            throw new Error("Anonymous sign-in did not return a session");
        }

        return anonymousResult.session;
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
            .select("id, uid, hn, firstname, lastname, gender, education_level, started_program, date")
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
            .select("id, uid, hn, firstname, lastname, gender, education_level, started_program, date")
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
            gender: parsedGender,
            education_level: parsedEducation,
            started_program: normalizedStartedProgram.toISOString(),
            date: parsedBirthDate,
        };

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_PATIENT_DATA_TABLE)
            .insert([payload])
            .select("id, uid, hn, firstname, lastname, gender, education_level, started_program, date")
            .maybeSingle();

        if (error) {
            if (error.code === "23505") {
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

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_GAME_DATA_TABLE)
            .insert([payload])
            .select("id, gid, started_at, ended_at")
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || payload;
    }

    async addUserGameHistory({
        hn,
        gid = null,
        playedAt = new Date().toISOString(),
        userGameDataId = null,
        rest = false,
        checkIn = false,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedGid = gid == null ? "" : String(gid).trim();
        const parsedPlayedAt = new Date(playedAt);
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

        if (Number.isNaN(parsedPlayedAt.getTime())) {
            throw new Error("Invalid playedAt");
        }

        if (parsedUserGameDataId != null && !Number.isInteger(parsedUserGameDataId)) {
            throw new Error("Invalid userGameDataId");
        }

        await this.initAuth();

        const payload = {
            hn: parsedHn,
            gid: parsedGid || null,
            played_at: parsedPlayedAt.toISOString(),
            user_game_data_id: parsedUserGameDataId,
        };

        const client = this.getClient();
        const insertHistory = async (insertPayload) => client
            .from(USER_GAME_HISTORY_TABLE)
            .insert([insertPayload])
            .select("id, hn, gid, played_at, user_game_data_id")
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
            .select("gid, played_at")
            .eq("hn", parsedHn);

        if (playedFrom) {
            const parsedFrom = new Date(playedFrom);
            if (Number.isNaN(parsedFrom.getTime())) {
                throw new Error("Invalid playedFrom");
            }
            query = query.gte("played_at", parsedFrom.toISOString());
        }

        if (playedTo) {
            const parsedTo = new Date(playedTo);
            if (Number.isNaN(parsedTo.getTime())) {
                throw new Error("Invalid playedTo");
            }
            query = query.lt("played_at", parsedTo.toISOString());
        }

        const { data, error } = await query.order("played_at", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }

    async getPlayedGameGidsByHn({
        hn,
        gids = [],
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
            .select("gid, played_at")
            .eq("hn", parsedHn)
            .in("gid", parsedGids);

        if (playedFrom) {
            const parsedFrom = new Date(playedFrom);
            if (Number.isNaN(parsedFrom.getTime())) {
                throw new Error("Invalid playedFrom");
            }
            query = query.gte("played_at", parsedFrom.toISOString());
        }

        if (playedTo) {
            const parsedTo = new Date(playedTo);
            if (Number.isNaN(parsedTo.getTime())) {
                throw new Error("Invalid playedTo");
            }
            query = query.lt("played_at", parsedTo.toISOString());
        }

        const { data, error } = await query.order("played_at", { ascending: true });

        if (error) {
            throw error;
        }

        const seen = new Set();
        (data || []).forEach((item) => {
            const gid = String(item?.gid || "").trim();
            if (gid) {
                seen.add(gid);
            }
        });

        return [...seen];
    }

    async submitHighScore(score, playtime = 0, gid = "ATTN001", level = null) {
        const endedAt = new Date();
        const startedAt = new Date(endedAt.getTime() - Math.max(0, Number(playtime) || 0) * 1000);

        return this.submitGameData({
            gid,
            score,
            level,
            startedAt,
            endedAt,
        });
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

        const client = this.getClient();
        const { error } = await client
            .from(USER_EVENT_LOG_TABLE)
            .insert([payload]);

        if (error) {
            throw error;
        }

        return payload;
    }
}

export default new Database();
