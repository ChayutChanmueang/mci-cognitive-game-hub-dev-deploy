import { createClient } from "@supabase/supabase-js";

const GAME_LIST_TABLE = "game_list_data";
const USER_GAME_DATA_TABLE = "user_game_data";
const USER_EVENT_LOG_TABLE = "user_event_log";
const USER_PATIENT_DATA_TABLE = "user_patient_data";
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
            .select("id, hn, firstname, lastname, age, gender, education_level, started_program")
            .eq("hn", parsedHn)
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

    async createPatientProfile({
        hn,
        firstname,
        lastname,
        age,
        gender,
        educationLevel = null,
        startedProgram,
    }) {
        const session = await this.initAuth();
        const user = session?.user || (await this.getCurrentUser());
        const parsedHn = String(hn || "").trim();
        const parsedFirstname = String(firstname || "").trim();
        const parsedLastname = String(lastname || "").trim();
        const parsedGender = String(gender || "").trim();
        const parsedAge = Number(age);
        const normalizedStartedProgram = new Date(startedProgram);

        if (!parsedHn) {
            throw new Error("Missing patient ID");
        }

        if (!parsedFirstname) {
            throw new Error("กรุณากรอกชื่อ");
        }

        if (!parsedLastname) {
            throw new Error("กรุณากรอกนามสกุล");
        }

        if (!Number.isInteger(parsedAge) || parsedAge <= 0 || parsedAge > 130) {
            throw new Error("กรุณากรอกอายุให้ถูกต้อง");
        }

        if (!parsedGender) {
            throw new Error("กรุณาเลือกเพศ");
        }

        if (Number.isNaN(normalizedStartedProgram.getTime())) {
            throw new Error("กรุณาเลือกวันที่เริ่มโปรแกรม");
        }

        if (!user?.id) {
            throw new Error("Missing authenticated user");
        }

        const parsedEducationLevel =
            educationLevel == null || String(educationLevel).trim() === ""
                ? null
                : Number(educationLevel);

        const payload = {
            uid: user.id,
            hn: parsedHn,
            firstname: parsedFirstname,
            lastname: parsedLastname,
            age: parsedAge,
            gender: parsedGender,
            education_level: Number.isFinite(parsedEducationLevel) ? parsedEducationLevel : null,
            started_program: normalizedStartedProgram.toISOString(),
        };

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_PATIENT_DATA_TABLE)
            .insert([payload])
            .select("id, hn, firstname, lastname, age, gender, education_level, started_program")
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
        const { error } = await client
            .from(USER_GAME_DATA_TABLE)
            .insert([payload]);

        if (error) {
            throw error;
        }

        return payload;
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
