import { createClient } from "@supabase/supabase-js";

const HIGH_SCORE_TABLE = "attention_sorting_game";

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

    async submitHighScore(score, playtime = 0) {
        const session = await this.initAuth();
        const user = session?.user || (await this.getCurrentUser());
        const parsedScore = Number(score);
        const parsedPlaytime = Number(playtime);

        if (!Number.isFinite(parsedScore) || parsedScore < 0) {
            throw new Error("Invalid score");
        }

        if (!Number.isFinite(parsedPlaytime) || parsedPlaytime < 0) {
            throw new Error("Invalid playtime");
        }

        if (!user?.id) {
            throw new Error("Missing authenticated user");
        }

        const payload = {
            score: Math.floor(parsedScore),
            highscore: Math.floor(parsedScore),
            playtime: Math.floor(parsedPlaytime),
            UID: user.id,
        };

        const client = this.getClient();
        const { data, error } = await client
            .from(HIGH_SCORE_TABLE)
            .insert([payload])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}

export default new Database();
