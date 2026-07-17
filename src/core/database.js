import { createClient } from "@supabase/supabase-js";
import {
    isCompleteThaiPhoneNumber,
    normalizeThaiPhoneNumber,
} from "../util/phone-number-util.js";
import edgeFunction from "./edge-function.js";
import { getProgramDayStatus } from "../util/program-date-util.js";

const GAME_LIST_TABLE = "game_list_data";
const USER_GAME_DATA_TABLE = "user_game_data";
const USER_GAME_HISTORY_TABLE = "user_game_history";
const REPLAY_LOG_TABLE = "game_replay_log";
const USER_PATIENT_DATA_TABLE = "user_data";
const USER_GAME_PROFILE_DATA_TABLE = "user_game_profile_data";
const GAME_TREE_LIST_TABLE = "game_tree_list";
const USER_EDUCATION_LEVEL_TABLE = "user_education_level";
const GAME_LEVEL_PRESET_LIST_TABLE = "game_level_preset_list";
const GAME_DAILY_PRESET_DATA_TABLE = "game_daily_preset_data";
const GAME_LEVEL_PRESET_DATA_TABLE = "game_level_preset_data";
const DEFAULT_GAME_PAGE_SIZE = 10;
const DEFAULT_GAME_PROFILE_PROGRAM_ID = 5;
class Database {
    constructor() {
        const env = import.meta.env || {};
        this.client = null;
        this.authReadyPromise = null;
        this.supabaseUrl = env.VITE_SUPABASE_URL || "";
        this.supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "";
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

    getLocalDayStart(dateValue) {
        return this.getLocalDayRange(dateValue).start;
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

    async _withRetry(operation, { attempts = 3, delayMs = 500 } = {}) {
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

    normalizeJsonValue(value) {
        if (value == null) {
            return null;
        }

        try {
            const serializedValue = JSON.stringify(value);
            if (serializedValue === undefined) {
                throw new Error("Value is not JSON serializable");
            }

            return JSON.parse(serializedValue);
        } catch (error) {
            throw new Error(`Invalid replay value: ${error?.message || "not JSON serializable"}`);
        }
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
            .select("id, hn, firstname, lastname, phone, gender, education_level, started_program, birth_date")
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

    /**
     * ข้อมูลผู้เล่นสำหรับ CSV — hn ว่าง/ไม่ส่ง = ทุกคน
     *
     * เดิมเมธอดนี้ดึง 5 ตารางเต็มมา join ใน browser (user_data, user_education_level,
     * user_game_profile_data, game_level_preset_list, game_level_preset_data)
     * ตอนนี้ย้ายไป SQL ทั้งหมดผ่าน edge function → US-E9-05
     *
     * row ที่ได้ป้อน buildPlayersCsv() / buildPlayerCsv() ได้ตรง ๆ ไม่ต้องแปลงอะไร
     * (พิสูจน์แล้วว่า CSV ที่ออกมาเหมือนของเดิม byte-for-byte)
     */
    async getAllPatientCsvExportRows({ hn = null } = {}) {
        return edgeFunction.getPlayerExportRows(hn);
    }

    /**
     * ข้อมูลการเล่นรายครั้งสำหรับ CSV — hn ว่าง/ไม่ส่ง = ทุกคน
     *
     * เดิมดึง 4 ตารางเต็มแล้วกรอง hn ใน JS + นับข้อถูก/ผิดจาก replay log ฝั่ง client
     * ซึ่ง query replay **ไม่มี .range()** → PostgREST ตัดที่ 1,000 แถวเงียบ ๆ
     * ทำให้ผู้เล่นที่เล่นเยอะนับได้ไม่ครบ (วัดจริง: ได้ 1000 จาก 4,231 = หาย 76.4%)
     * ตอนนี้ปล่อยให้ SQL นับ ซึ่งไม่ผ่านเพดาน PostgREST → ได้ครบ
     */
    async getGameCsvExportRows({ hn = null } = {}) {
        return edgeFunction.getGameExportRows(hn);
    }

    /**
     * ประวัติรายวัน (ผู้เล่น × วันโปรแกรม) สำหรับ CSV — hn ว่าง/ไม่ส่ง = ทุกคน
     *
     * เดิมเรียก RPC แล้วถ้าพลาดจะ **ตกไป fallback ดึง 4 ตารางเต็มเงียบ ๆ** (console.warn อย่างเดียว)
     * fallback นั้นถูกลบทิ้งแล้วโดยตั้งใจ — มันกลบความจริงว่า RPC ใช้ไม่ได้มาตลอด
     * โดยไม่มีใครรู้ ตอนนี้ถ้า export พังจะพังให้เห็น ไม่ใช่เงียบ ๆ แล้วให้ข้อมูลที่อาจไม่ครบ
     */
    async getGameHistoryCsvExportRows({ hn = null } = {}) {
        return edgeFunction.getGameHistoryExportRows(hn);
    }

    async getAllTableRows(tableName, selectColumns, orders = []) {
        const client = this.getClient();
        const pageSize = 1000;
        const rows = [];

        for (let from = 0; ; from += pageSize) {
            let query = client
                .from(tableName)
                .select(selectColumns)
                .range(from, from + pageSize - 1);

            for (const order of orders) {
                const orderOptions = {
                    ascending: order.ascending !== false,
                };

                if (Object.prototype.hasOwnProperty.call(order, "nullsFirst")) {
                    orderOptions.nullsFirst = order.nullsFirst;
                }

                query = query.order(order.column, orderOptions);
            }

            const { data, error } = await query;
            if (error) {
                throw error;
            }

            rows.push(...(data || []));
            if (!data || data.length < pageSize) {
                break;
            }
        }

        return rows;
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
        await this.initAuth();
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

        const payload = {
            hn: parsedHn,
            firstname: parsedFirstname,
            lastname: parsedLastname,
            phone: parsedPhone,
            gender: parsedGender,
            education_level: parsedEducation,
            started_program: normalizedStartedProgram.toISOString(),
            birth_date: parsedBirthDate,
        };

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_PATIENT_DATA_TABLE)
            .insert([payload])
            .select("id, hn, firstname, lastname, phone, gender, education_level, started_program, birth_date")
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

    async validatePatientSignupDependencies({
        hn,
        phone,
        defaultProgramId = DEFAULT_GAME_PROFILE_PROGRAM_ID,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedPhone = normalizeThaiPhoneNumber(phone);
        const parsedProgramId = Number(defaultProgramId);

        if (!parsedHn) {
            throw new Error("Missing patient ID");
        }

        if (!parsedPhone) {
            throw new Error("กรุณากรอกเบอร์โทร");
        }

        if (!isCompleteThaiPhoneNumber(parsedPhone)) {
            throw new Error("กรุณากรอกเบอร์โทร 10 หลัก");
        }

        if (!Number.isInteger(parsedProgramId) || parsedProgramId <= 0) {
            throw new Error("Invalid default game profile program");
        }

        await this.initAuth();

        const client = this.getClient();
        const [
            patientResult,
            phoneResult,
            profileResult,
            programResult,
        ] = await Promise.all([
            client
                .from(USER_PATIENT_DATA_TABLE)
                .select("id")
                .eq("hn", parsedHn)
                .maybeSingle(),
            client
                .from(USER_PATIENT_DATA_TABLE)
                .select("id")
                .eq("phone", parsedPhone)
                .maybeSingle(),
            client
                .from(USER_GAME_PROFILE_DATA_TABLE)
                .select("id")
                .eq("hn", parsedHn)
                .maybeSingle(),
            client
                .from(GAME_LEVEL_PRESET_LIST_TABLE)
                .select("id")
                .eq("id", parsedProgramId)
                .maybeSingle(),
        ]);

        if (patientResult.error) {
            throw patientResult.error;
        }

        if (phoneResult.error) {
            throw phoneResult.error;
        }

        if (profileResult.error) {
            throw profileResult.error;
        }

        if (programResult.error) {
            throw programResult.error;
        }

        if (patientResult.data?.id) {
            throw new Error("Patient ID นี้ถูกใช้งานแล้ว");
        }

        if (phoneResult.data?.id) {
            throw new Error("เบอร์โทรนี้ถูกใช้งานแล้ว");
        }

        if (profileResult.data?.id) {
            throw new Error("Game profile นี้ถูกสร้างไว้แล้ว");
        }

        if (!programResult.data?.id) {
            throw new Error("Default game profile program does not exist");
        }

        return true;
    }

    async createUserGameProfile({
        hn,
        defaultProgramId = DEFAULT_GAME_PROFILE_PROGRAM_ID,
        treeType = "",
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedProgramId = Number(defaultProgramId);

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!Number.isInteger(parsedProgramId) || parsedProgramId <= 0) {
            throw new Error("Invalid default game profile program");
        }

        await this.initAuth();

        const client = this.getClient();
        const treeRows = await this.getGameTreeList();
        const allowedTreeTypes = new Set(treeRows.map((row) => String(row?.id || "").trim()).filter(Boolean));
        const requestedTreeType = String(treeType || "").trim();
        const resolvedTreeType = allowedTreeTypes.has(requestedTreeType)
            ? requestedTreeType
            : await this.pickRandomTreeType(treeRows);
        const { data, error } = await client
            .from(USER_GAME_PROFILE_DATA_TABLE)
            .insert([{ hn: parsedHn, program: parsedProgramId, tree_type: resolvedTreeType }])
            .select("id, hn, program, tree_type, created_at")
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || { hn: parsedHn };
    }

    async getGameTreeList() {
        await this.initAuth();

        const { data, error } = await this.getClient()
            .from(GAME_TREE_LIST_TABLE)
            .select("id, name, created_at")
            .order("id", { ascending: true });

        if (error) {
            throw error;
        }

        return (data || []).filter((row) => String(row?.id || "").trim());
    }

    async pickRandomTreeType(treeRows = null) {
        const rows = Array.isArray(treeRows) ? treeRows : await this.getGameTreeList();
        const treeTypes = [...new Set(rows.map((row) => String(row?.id || "").trim()).filter(Boolean))];

        if (!treeTypes.length) {
            throw new Error("Game tree catalog is empty or inaccessible");
        }

        return treeTypes[Math.floor(Math.random() * treeTypes.length)];
    }

    async ensureUserGameProfileTreeType({ hn }) {
        const parsedHn = String(hn || "").trim();
        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        await this.initAuth();

        const client = this.getClient();
        const treeRows = await this.getGameTreeList();
        const allowedTreeTypes = new Set(treeRows.map((row) => String(row?.id || "").trim()).filter(Boolean));
        if (!allowedTreeTypes.size) {
            throw new Error("Game tree catalog is empty or inaccessible");
        }
        const { data: profileRows, error: profileError } = await client
            .from(USER_GAME_PROFILE_DATA_TABLE)
            .select("id, hn, program, tree_type, created_at")
            .eq("hn", parsedHn)
            .order("created_at", { ascending: false })
            .limit(1);

        if (profileError) {
            throw profileError;
        }

        const profile = Array.isArray(profileRows) ? profileRows[0] : null;
        if (!profile?.id) {
            throw new Error("Game profile not found");
        }

        const currentTreeType = String(profile.tree_type || "").trim();
        if (allowedTreeTypes.has(currentTreeType)) {
            return profile;
        }

        const nextTreeType = await this.pickRandomTreeType(treeRows);
        let updateQuery = client
            .from(USER_GAME_PROFILE_DATA_TABLE)
            .update({ tree_type: nextTreeType })
            .eq("id", profile.id);

        updateQuery = profile.tree_type == null
            ? updateQuery.is("tree_type", null)
            : updateQuery.eq("tree_type", profile.tree_type);

        const { data: updatedRows, error: updateError } = await updateQuery
            .select("id, hn, program, tree_type, created_at");

        if (updateError) {
            throw updateError;
        }

        const updatedProfile = Array.isArray(updatedRows) ? updatedRows[0] : null;
        if (updatedProfile?.tree_type) {
            return updatedProfile;
        }

        // Another tab may have filled the value first. Read the persisted winner.
        const { data: latestRows, error: latestError } = await client
            .from(USER_GAME_PROFILE_DATA_TABLE)
            .select("id, hn, program, tree_type, created_at")
            .eq("id", profile.id)
            .limit(1);

        if (latestError) {
            throw latestError;
        }

        const latestProfile = Array.isArray(latestRows) ? latestRows[0] : null;
        if (!allowedTreeTypes.has(String(latestProfile?.tree_type || "").trim())) {
            throw new Error("Unable to persist a valid game tree type");
        }

        return latestProfile;
    }

    async getGameLevelPresetList() {
        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(GAME_LEVEL_PRESET_LIST_TABLE)
            .select("id, name, description, created_at")
            .order("id", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }

    async setUserGameProfileProgram({ hn, programId }) {
        const parsedHn = String(hn || "").trim();
        const parsedProgramId = Number(programId);

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!Number.isInteger(parsedProgramId) || parsedProgramId <= 0) {
            throw new Error("Invalid programId");
        }

        await this.initAuth();

        const client = this.getClient();
        const { data: existingRows, error: findError } = await client
            .from(USER_GAME_PROFILE_DATA_TABLE)
            .select("id, hn, program, tree_type, created_at")
            .eq("hn", parsedHn)
            .order("created_at", { ascending: false })
            .limit(1);

        if (findError) {
            throw findError;
        }

        const existingProfile = Array.isArray(existingRows) ? existingRows[0] : null;
        if (existingProfile?.id) {
            const { data: updatedProfile, error: updateError } = await client
                .from(USER_GAME_PROFILE_DATA_TABLE)
                .update({ program: parsedProgramId })
                .eq("id", existingProfile.id)
                .select("id, hn, program, tree_type, created_at")
                .maybeSingle();

            if (updateError) {
                throw updateError;
            }

            if (!updatedProfile?.id) {
                throw new Error("Unable to update user game profile program");
            }

            return updatedProfile;
        }

        const treeType = await this.pickRandomTreeType();
        const { data: insertedProfile, error: insertError } = await client
            .from(USER_GAME_PROFILE_DATA_TABLE)
            .insert([{ hn: parsedHn, program: parsedProgramId, tree_type: treeType }])
            .select("id, hn, program, tree_type, created_at")
            .maybeSingle();

        if (insertError) {
            throw insertError;
        }

        if (!insertedProfile?.id) {
            throw new Error("Unable to create user game profile program");
        }

        return insertedProfile;
    }

    async deletePatientProfileByHn({ hn }) {
        const parsedHn = String(hn || "").trim();

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        await this.initAuth();

        const client = this.getClient();
        const { error } = await client
            .from(USER_PATIENT_DATA_TABLE)
            .delete()
            .eq("hn", parsedHn);

        if (error) {
            throw error;
        }

        return true;
    }

    async getGameList() {
        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(GAME_LIST_TABLE)
            .select("id, gid, name, th_name, mci_group, created_at")
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
            .select("id, gid, name, th_name, mci_group, max_score, created_at", { count: "exact" })
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
            .select("id, gid, name, th_name, mci_group, created_at")
            .eq("gid", parsedGid)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

    async getDailyGameProgramByHn({
        hn,
        currentDate = new Date(),
        dayFrom = null,
        dayTo = null,
        windowBefore = 2,
        windowAfter = 0,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedCurrentDate = new Date(currentDate);

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (Number.isNaN(parsedCurrentDate.getTime())) {
            throw new Error("Invalid currentDate");
        }

        await this.initAuth();

        const client = this.getClient();
        const [patientResult, profileResult] = await Promise.all([
            client
                .from(USER_PATIENT_DATA_TABLE)
                .select("hn, started_program")
                .eq("hn", parsedHn)
                .maybeSingle(),
            client
                .from(USER_GAME_PROFILE_DATA_TABLE)
                .select("id, hn, program, tree_type, created_at")
                .eq("hn", parsedHn)
                .order("created_at", { ascending: false })
                .limit(1),
        ]);

        if (patientResult.error) {
            throw patientResult.error;
        }

        if (profileResult.error) {
            throw profileResult.error;
        }

        const patient = patientResult.data || null;
        const profile = Array.isArray(profileResult.data) ? profileResult.data[0] : null;
        const programId = Number(profile?.program);
        const startedProgram = new Date(patient?.started_program || "");

        if (!patient?.hn) {
            throw new Error("Patient profile not found");
        }

        if (!Number.isInteger(programId) || programId <= 0) {
            throw new Error("Game program profile not found");
        }

        if (Number.isNaN(startedProgram.getTime())) {
            throw new Error("Invalid started_program");
        }

        const { data: programRows, error: programRowsError } = await client
            .from(GAME_LEVEL_PRESET_DATA_TABLE)
            .select("id, gpid, gdid, gid, stage, level, day")
            .eq("gpid", programId)
            .order("day", { ascending: true })
            .order("stage", { ascending: true })
            .order("id", { ascending: true });

        if (programRowsError) {
            throw programRowsError;
        }

        const allProgramRows = programRows || [];
        const programDayCount = allProgramRows.reduce((maxDay, row) => {
            const day = Number(row?.day);
            return Number.isFinite(day) ? Math.max(maxDay, Math.floor(day)) : maxDay;
        }, 0);

        if (!programDayCount) {
            return {
                hn: parsedHn,
                programId,
                profileId: profile?.id || null,
                startedProgram: startedProgram.toISOString(),
                programDay: 0,
                rawProgramDay: 0,
                programDayCount: 0,
                programStarted: false,
                programEnded: false,
                programEndDate: null,
                dailyPreset: null,
                games: [],
            };
        }

        const programDayStatus = getProgramDayStatus(startedProgram, programDayCount, parsedCurrentDate);
        const {
            programDay,
            rawProgramDay,
            programEndDate,
        } = programDayStatus;
        const requestedDayFrom = dayFrom == null || dayFrom === "" ? NaN : Number(dayFrom);
        const requestedDayTo = dayTo == null || dayTo === "" ? NaN : Number(dayTo);
        const safeWindowBefore = Math.max(0, Number(windowBefore) || 0);
        const safeWindowAfter = Math.max(0, Number(windowAfter) || 0);
        const resolvedDayFrom = Number.isFinite(requestedDayFrom)
            ? Math.floor(requestedDayFrom)
            : programDay - safeWindowBefore;
        const resolvedDayTo = Number.isFinite(requestedDayTo)
            ? Math.floor(requestedDayTo)
            : programDay + safeWindowAfter;
        const visibleDayFrom = Math.max(1, Math.min(resolvedDayFrom, programDayCount));
        const visibleDayTo = Math.max(visibleDayFrom, Math.min(resolvedDayTo, programDayCount));
        const visibleRows = allProgramRows.filter((row) => {
            const day = Number(row?.day);
            return day >= visibleDayFrom && day <= visibleDayTo;
        });
        const dailyRows = allProgramRows.filter((row) => Number(row?.day) === programDay);
        const dailyPresetIds = [...new Set(
            visibleRows
                .map((row) => Number(row?.gdid))
                .filter((id) => Number.isInteger(id) && id > 0),
        )];
        const gameGids = [...new Set(
            visibleRows
                .map((row) => String(row?.gid || "").trim())
                .filter(Boolean),
        )];

        const [dailyPresetResult, gameListResult] = await Promise.all([
            dailyPresetIds.length
                ? client
                    .from(GAME_DAILY_PRESET_DATA_TABLE)
                    .select("id, gpid, goal, loop, created_at")
                    .in("id", dailyPresetIds)
                : Promise.resolve({ data: [], error: null }),
            gameGids.length
                ? client
                    .from(GAME_LIST_TABLE)
                    .select("id, gid, name, th_name, mci_group, max_score, created_at")
                    .in("gid", gameGids)
                : Promise.resolve({ data: [], error: null }),
        ]);

        if (dailyPresetResult.error) {
            throw dailyPresetResult.error;
        }

        if (gameListResult.error) {
            throw gameListResult.error;
        }

        const dailyPresetMap = new Map(
            (dailyPresetResult.data || []).map((item) => [Number(item?.id), item]),
        );
        const gameMap = new Map(
            (gameListResult.data || []).map((item) => [String(item?.gid || "").trim(), item]),
        );
        const fallbackDailyPreset = dailyPresetMap.get(dailyPresetIds[0]) || null;
        const buildGameEntry = (row) => {
            const gid = String(row?.gid || "").trim();
            const game = gameMap.get(gid) || { gid, name: gid };
            const dailyPreset = dailyPresetMap.get(Number(row?.gdid)) || fallbackDailyPreset;

            return {
                ...game,
                preset_data_id: row?.id ?? null,
                daily_preset_id: row?.gdid ?? null,
                program_id: row?.gpid ?? programId,
                stage: Number(row?.stage),
                level: Number(row?.level),
                day: Number(row?.day),
                loop: Number(dailyPreset?.loop || 1),
                goal: dailyPreset?.goal || "",
            };
        };
        const days = [];

        for (let day = visibleDayFrom; day <= visibleDayTo; day += 1) {
            const dayRows = visibleRows.filter((row) => Number(row?.day) === day);
            const dayPreset = dailyPresetMap.get(Number(dayRows[0]?.gdid)) || fallbackDailyPreset;
            days.push({
                day,
                goal: dayPreset?.goal || "",
                loop: Number(dayPreset?.loop || 1),
                dailyPreset: dayPreset || null,
                games: dayRows.map((row) => buildGameEntry(row)),
            });
        }

        const games = dailyRows.map((row) => buildGameEntry(row));

        return {
            hn: parsedHn,
            programId,
            profileId: profile?.id || null,
            startedProgram: startedProgram.toISOString(),
            programDay,
            rawProgramDay,
            programDayCount,
            visibleDayFrom,
            visibleDayTo,
            programStarted: programDayStatus.programStarted,
            programEnded: programDayStatus.programEnded,
            programEndDate: programEndDate ? programEndDate.toISOString() : null,
            dailyPreset: fallbackDailyPreset,
            days,
            games,
        };
    }

    async submitGameData({ gid, score = null, level = null, startedAt, endedAt }) {
        await this.initAuth();
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
        stage = null,
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
        const parsedStage = stage == null || stage === "" ? null : Number(stage);
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

        if (parsedStage != null && !Number.isFinite(parsedStage)) {
            throw new Error("Invalid stage");
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
            stage: parsedStage,
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
                .select("id, hn, gid, stage, start_at, end_at, user_game_data_id")
                .eq("hn", parsedHn)
                .eq("gid", parsedGid)
                .gte("start_at", start.toISOString())
                .lt("start_at", end.toISOString())
                .order("start_at", { ascending: false })
                .limit(20);

            if (existingError) {
                throw existingError;
            }

            const matchedRows = parsedStage == null
                ? (existingRows || []).filter((row) => row?.stage == null)
                : (existingRows || []).filter((row) => Number(row?.stage) === parsedStage);
            const existingHistory = matchedRows.find((row) => !row?.end_at) || matchedRows[0] || null;
            if (existingHistory?.id) {
                return existingHistory;
            }
        }

        const insertHistory = async (insertPayload) => client
            .from(USER_GAME_HISTORY_TABLE)
            .insert([insertPayload])
            .select("id, hn, gid, stage, start_at, end_at, user_game_data_id, \"check-in\"")
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
            .select("id, hn, gid, stage, start_at, end_at, user_game_data_id")
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
            .select("id, hn, gid, stage, start_at, end_at, user_game_data_id")
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

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
            .select("id, gid, stage, start_at, end_at, user_game_data_id")
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
                    .select("id, gid, stage, start_at, end_at, user_game_data_id")
                    .eq("hn", parsedHn)
                    .eq("gid", parsedRestGid),
            )
            : null;
        const checkInQuery = applyDateRange(
            client
                .from(USER_GAME_HISTORY_TABLE)
                .select("id, gid, stage, start_at, end_at, user_game_data_id")
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
                    .select("id, gid, stage, start_at, end_at, user_game_data_id")
                    .eq("hn", parsedHn)
                    .eq("check_in", true),
            );
        }

        if (resolvedCheckInResult.error) {
            resolvedCheckInResult = await applyDateRange(
                client
                    .from(USER_GAME_HISTORY_TABLE)
                    .select("id, gid, stage, start_at, end_at, user_game_data_id")
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

    getDateRangeForLocalDay(dateValue = new Date()) {
        const start = this.getLocalDayStart(new Date(dateValue));
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        return {
            start,
            end,
        };
    }

    async getUserCheckInHistoryForDate({
        hn,
        date = new Date(),
    }) {
        const parsedHn = String(hn || "").trim();
        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        await this.initAuth();

        const client = this.getClient();
        const { start, end } = this.getDateRangeForLocalDay(date);
        const selectColumns = "id, gid, stage, start_at, end_at, user_game_data_id";
        const withDateRange = (query) => query
            .gte("start_at", start.toISOString())
            .lt("start_at", end.toISOString())
            .order("start_at", { ascending: false })
            .limit(1);

        let result = await withDateRange(
            client
                .from(USER_GAME_HISTORY_TABLE)
                .select(selectColumns)
                .eq("hn", parsedHn)
                .eq("check-in", true),
        );

        if (result.error) {
            result = await withDateRange(
                client
                    .from(USER_GAME_HISTORY_TABLE)
                    .select(selectColumns)
                    .eq("hn", parsedHn)
                    .eq("check_in", true),
            );
        }

        if (result.error) {
            result = await withDateRange(
                client
                    .from(USER_GAME_HISTORY_TABLE)
                    .select(selectColumns)
                    .eq("hn", parsedHn)
                    .is("gid", null),
            );
        }

        if (result.error) {
            throw result.error;
        }

        return Array.isArray(result.data) && result.data.length ? result.data[0] : null;
    }

    async addUserCheckInHistoryIfMissing({
        hn,
        date = new Date(),
        startAt = new Date().toISOString(),
    }) {
        const existingRecord = await this.getUserCheckInHistoryForDate({ hn, date });
        if (existingRecord?.id) {
            return {
                record: {
                    ...existingRecord,
                    "check-in": true,
                },
                created: false,
            };
        }

        const record = await this.addUserGameHistory({
            hn,
            gid: null,
            startAt,
            userGameDataId: null,
            rest: false,
            checkIn: true,
        });

        return {
            record,
            created: true,
        };
    }

    async hasCompletedGameHubNodesForDate({
        hn,
        nodes = [],
        date = new Date(),
        restGid = "REST001",
    }) {
        const parsedHn = String(hn || "").trim();
        const playableNodes = (Array.isArray(nodes) ? nodes : [])
            .filter((node) => ["game", "rest"].includes(node?.type));

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!playableNodes.length) {
            return {
                complete: false,
                completedCount: 0,
                requiredCount: 0,
                missingNodes: [],
            };
        }

        const gids = [...new Set(playableNodes
            .map((node) => String(node?.gid || (node?.type === "rest" ? restGid : "")).trim())
            .filter(Boolean))];
        const { start, end } = this.getDateRangeForLocalDay(date);

        await this.initAuth();

        const client = this.getClient();
        const { data, error } = await client
            .from(USER_GAME_HISTORY_TABLE)
            .select("id, gid, stage, start_at, end_at, user_game_data_id")
            .eq("hn", parsedHn)
            .in("gid", gids)
            .gte("start_at", start.toISOString())
            .lt("start_at", end.toISOString())
            .order("start_at", { ascending: true });

        if (error) {
            throw error;
        }

        const rows = data || [];
        const isMatched = (node, row) => {
            if (node?.type === "rest") {
                return String(row?.gid || "").trim() === restGid;
            }

            const nodeStage = node?.stage == null || node?.stage === "" ? null : Number(node.stage);
            const rowStage = row?.stage == null || row?.stage === "" ? null : Number(row.stage);

            return String(row?.gid || "").trim() === String(node?.gid || "").trim()
                && (nodeStage == null ? rowStage == null : rowStage === nodeStage)
                && Boolean(row?.end_at);
        };
        const matchedIds = new Set();
        const missingNodes = [];

        for (const node of playableNodes) {
            const matchedRow = rows.find((row) => !matchedIds.has(row?.id) && isMatched(node, row));
            if (matchedRow?.id) {
                matchedIds.add(matchedRow.id);
            } else {
                missingNodes.push({
                    type: node?.type || "",
                    gid: node?.gid || "",
                    stage: node?.stage ?? null,
                });
            }
        }

        return {
            complete: missingNodes.length === 0,
            completedCount: playableNodes.length - missingNodes.length,
            requiredCount: playableNodes.length,
            missingNodes,
        };
    }

    async getUserCheckInDatesByHn({
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
        const applyDateRange = (query) => {
            let scopedQuery = query;
            if (playedFrom) {
                scopedQuery = scopedQuery.gte("start_at", new Date(playedFrom).toISOString());
            }
            if (playedTo) {
                scopedQuery = scopedQuery.lt("start_at", new Date(playedTo).toISOString());
            }
            return scopedQuery;
        };
        const queryByCheckInColumn = async (columnName) => applyDateRange(
            client
                .from(USER_GAME_HISTORY_TABLE)
                .select("start_at")
                .eq("hn", parsedHn)
                .eq(columnName, true),
        ).order("start_at", { ascending: true });

        let result = await queryByCheckInColumn("check-in");

        if (result.error) {
            result = await queryByCheckInColumn("check_in");
        }

        if (result.error) {
            // Compatibility fallback: old test data might only have gid = null for check-in rows.
            const fallback = await applyDateRange(
                client
                    .from(USER_GAME_HISTORY_TABLE)
                    .select("start_at")
                    .eq("hn", parsedHn)
                    .is("gid", null),
            ).order("start_at", { ascending: true });

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
            .select("gid, stage, start_at, end_at, user_game_data_id, \"check-in\"")
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

    async writeReplayLog({
        hn,
        replayId = null,
        replayid = null,
        gid = null,
        value = null,
        historyId = null,
        historyid = null,
        userGameDataId = null,
        user_game_data_id = null,
    }) {
        const payload = this.buildReplayLogPayload({
            hn,
            replayId,
            replayid,
            gid,
            value,
            historyId,
            historyid,
            userGameDataId,
            user_game_data_id,
        });

        await this.initAuth();

        return this._withRetry(async () => {
            const client = this.getClient();
            const { data, error } = await client
                .from(REPLAY_LOG_TABLE)
                .insert([payload])
                .select("id, created_at, hn, replayid, gid, value, historyid")
                .maybeSingle();

            if (error) {
                throw error;
            }

            return data || payload;
        });
    }

    buildReplayLogPayload({
        hn,
        replayId = null,
        replayid = null,
        gid = null,
        value = null,
        historyId = null,
        historyid = null,
        userGameDataId = null,
        user_game_data_id = null,
    }) {
        const parsedHn = String(hn || "").trim();
        const parsedReplayId = String(replayId || replayid || "").trim();
        const parsedGid = gid == null ? null : String(gid).trim() || null;
        const parsedHistoryIdValue = historyId ?? historyid ?? userGameDataId ?? user_game_data_id;
        const parsedHistoryId = parsedHistoryIdValue == null || parsedHistoryIdValue === ""
            ? null
            : Number(parsedHistoryIdValue);
        const parsedValue = this.normalizeJsonValue(value);

        if (!parsedHn) {
            throw new Error("Invalid hn");
        }

        if (!parsedReplayId) {
            throw new Error("Invalid replayId");
        }

        if (
            parsedHistoryId != null
            && (!Number.isInteger(parsedHistoryId) || parsedHistoryId <= 0)
        ) {
            throw new Error("Invalid historyId");
        }

        return {
            hn: parsedHn,
            replayid: parsedReplayId,
            gid: parsedGid,
            value: parsedValue,
            historyid: parsedHistoryId,
        };
    }

    async writeReplayLogs(replayLogs, { batchSize = 100 } = {}) {
        if (!Array.isArray(replayLogs)) {
            throw new Error("Invalid replayLogs");
        }

        const parsedBatchSize = Number(batchSize);
        if (!Number.isInteger(parsedBatchSize) || parsedBatchSize <= 0) {
            throw new Error("Invalid batchSize");
        }

        const payloads = replayLogs.map((replayLog) => this.buildReplayLogPayload(replayLog));
        if (!payloads.length) {
            return [];
        }

        await this.initAuth();

        const insertedRows = [];
        for (let index = 0; index < payloads.length; index += parsedBatchSize) {
            const batch = payloads.slice(index, index + parsedBatchSize);
            const batchRows = await this._withRetry(async () => {
                const client = this.getClient();
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

    async logReplayEvent(params) {
        return this.writeReplayLog(params);
    }

    _buildLeaderboardPlayers(rows, currentHn, offset = 0) {
        return rows.map((row, index) => {
            const hn = String(row?.hn || "").trim();
            const firstname = String(row?.firstname || "").trim();
            const lastname = String(row?.lastname || "").trim();
            const name = [firstname, lastname].filter(Boolean).join(" ") || hn;
            return {
                rank: offset + index + 1,
                name,
                score: Number(row?.total_score) || 0,
                current: currentHn ? hn === currentHn : false,
            };
        });
    }

    async getUserRank(hn) {
        await this.initAuth();

        const parsedHn = String(hn || "").trim();
        if (!parsedHn) {
            return { rank: null, total: 0 };
        }

        const buildResult = (row) => ({
            rank: row?.rank != null ? Number(row.rank) : null,
            total: Number(row?.total) || 0,
            name: [row?.firstname, row?.lastname].filter(Boolean).join(" ") || null,
            score: row?.score != null ? Number(row.score) : (row?.total_score != null ? Number(row.total_score) : null),
        });

        try {
            const result = await edgeFunction.getUserRank(parsedHn);
            const built = buildResult(result);
            if (built.name != null) return built;
            // edge function returned incomplete data — fall through to RPC
        } catch {
            // fallback to direct RPC
        }

        const client = this.getClient();
        const { data, error } = await client.rpc("get_user_rank", { p_hn: parsedHn });
        if (!error && Array.isArray(data) && data[0]) {
            return buildResult(data[0]);
        }

        return { rank: null, total: 0, name: null, score: null };
    }

    async getLeaderboard({ currentHn = null, offset = 0, limit = 20 } = {}) {
        await this.initAuth();

        const parsedCurrentHn = String(currentHn || "").trim();
        const parsedOffset = Math.max(0, Number(offset) || 0);
        const parsedLimit = Math.max(1, Number(limit) || 20);

        try {
            const result = await edgeFunction.getLeaderboard({ offset: parsedOffset, limit: parsedLimit });
            const rows = result?.rows || [];
            const total = Number(result?.total) || 0;
            return {
                players: this._buildLeaderboardPlayers(rows, parsedCurrentHn, parsedOffset),
                hasMore: parsedOffset + rows.length < total,
                total,
            };
        } catch (edgeError) {
            console.warn("Leaderboard edge function unavailable, using RPC:", edgeError);
        }

        const client = this.getClient();
        const { data: rpcRows, error: rpcError } = await client.rpc("get_leaderboard_page", {
            p_offset: parsedOffset,
            p_limit: parsedLimit,
        });

        if (!rpcError) {
            const rows = rpcRows || [];
            const total = rows.length > 0 ? Number(rows[0].total_players) : 0;
            return {
                players: this._buildLeaderboardPlayers(rows, parsedCurrentHn, parsedOffset),
                hasMore: parsedOffset + rows.length < total,
                total,
            };
        }

        console.warn("Leaderboard RPC unavailable, using client query:", rpcError);

        const [patients, histories] = await Promise.all([
            this.getAllTableRows(
                USER_PATIENT_DATA_TABLE,
                "hn, firstname, lastname",
                [{ column: "hn", ascending: true }],
            ),
            this.getAllTableRows(
                USER_GAME_HISTORY_TABLE,
                'hn, user_game_data_id, "check-in"',
                [],
            ),
        ]);

        const validHistories = histories.filter(
            (h) => h?.user_game_data_id != null && h?.["check-in"] !== true,
        );
        const gameDataIds = [
            ...new Set(
                validHistories
                    .map((h) => Number(h.user_game_data_id))
                    .filter((id) => Number.isFinite(id) && id > 0),
            ),
        ];

        const scoreById = new Map();
        const batchSize = 500;
        for (let i = 0; i < gameDataIds.length; i += batchSize) {
            const batch = gameDataIds.slice(i, i + batchSize);
            // eslint-disable-next-line no-await-in-loop
            const { data: gameDataRows } = await client
                .from(USER_GAME_DATA_TABLE)
                .select("id, score")
                .in("id", batch);
            for (const row of gameDataRows || []) {
                const id = Number(row?.id);
                const score = Number(row?.score);
                if (Number.isFinite(id) && id > 0 && Number.isFinite(score)) {
                    scoreById.set(id, score);
                }
            }
        }

        const scoreByHn = new Map();
        for (const history of validHistories) {
            const hn = String(history?.hn || "").trim();
            const gameDataId = Number(history?.user_game_data_id);
            const score = scoreById.get(gameDataId);
            if (hn && Number.isFinite(score)) {
                scoreByHn.set(hn, (scoreByHn.get(hn) || 0) + score);
            }
        }

        const patientByHn = new Map(
            patients.map((p) => [String(p?.hn || "").trim(), p]),
        );

        const allRows = [...scoreByHn.entries()]
            .map(([hn, totalScore]) => {
                const patient = patientByHn.get(hn) || {};
                return {
                    hn,
                    firstname: String(patient?.firstname || "").trim(),
                    lastname: String(patient?.lastname || "").trim(),
                    total_score: totalScore,
                };
            })
            .sort((a, b) => b.total_score - a.total_score);

        const page = allRows.slice(parsedOffset, parsedOffset + parsedLimit);
        return {
            players: this._buildLeaderboardPlayers(page, parsedCurrentHn, parsedOffset),
            hasMore: parsedOffset + page.length < allRows.length,
            total: allRows.length,
        };
    }

    async getRandomGameVideoUrl() {
        await this.initAuth();
        const client = this.getClient();
        const { data, error } = await client.from("game_video_list").select("url").eq("hidden", false);
        if (error || !data?.length) return null;
        return data[Math.floor(Math.random() * data.length)].url;
    }
}

export default new Database();
