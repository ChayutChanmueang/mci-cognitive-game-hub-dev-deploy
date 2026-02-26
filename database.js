import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

class Supabase {
    constructor() {
        // load config
        dotenv.config()

        this.supabase = null;
        this.data = null;
        this.config = {
            user: process.env.DB_USER || "empty",
            password: process.env.DB_PASS || "",
            host: process.env.DB_HOST || "localhost",
            anon: process.env.DB_ANON || "none",
        };
    }

    isLoggedIn() {
        return (
            this.data &&
            this.data.session &&
            typeof this.data.session.access_token === "string" &&
            this.data.session.access_token !== ""
        );
    }

    async ensureLogin() {
        if (!this.isLoggedIn() || !await this.requestTestConnection()) {
            console.log("Session expired. Reconnecting...");
            await this.connect();
        }
    }

    async connect(retry = 12) {
        console.log(`Connecting to Supabase URL ${this.config.host}`);
        this.supabase = createClient(this.config.host, this.config.anon, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });

        while (retry > 0) {
            const result = await this.login(this.config.user, this.config.password);

            if (result.success) {
                console.log("Supabase logged in.");
                return true;
            }

            console.log(`Login failed. Retrying... (${retry})`);
            await new Promise(r => setTimeout(r, 2000)); // รอ 2 วิ
            retry--;
        }

        throw new Error("Failed to login to Supabase after retrying.");
    }

    async disconnect() {
        await this.logout();
    }

    async login(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            console.log('Login successful')
            console.log('User:', data.user)
            console.log('Session:', data.session)

            this.data = data;

            return {
                success: true,
                user: data.user,
                session: data.session
            }
        } catch (error) {
            console.error('Login failed:', error.message)

            this.data = null;
            return {
                success: false,
                error: error.message
            }
        }
    }

    async signup(email, password) {
        if (!this.supabase) {
            return {
                success: false,
                error: "Please login first"
            }
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password
            })

            if (error) throw error

            console.log('Signup successful')
            return {
                success: true,
                user: data.user
            }
        } catch (error) {
            console.error('Signup failed:', error.message)
            return {
                success: false,
                error: error.message
            }
        }
    }

    async logout() {
        if (!this.supabase) {
            return {
                success: false,
                error: "Please login first"
            }
        }

        try {
            const { error } = await this.supabase.auth.signOut()
            if (error) throw error

            console.log('Logout successful')
            return { success: true }
        } catch (error) {
            console.error('Logout failed:', error.message)
            return {
                success: false,
                error: error.message
            }
        }
    }

    async requestTestConnection() {
        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/test/checkConnection", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                signal: controller.signal,
            });

            return await this.IsResponseOK(supabaseResponse);
        } catch (err) {
            return false;
        }
    }

    async createHistory(createdAt, label, updatedAt) {
        if (!createdAt || !label || !updatedAt) {
            throw new Error("Invalid parameters: createdAt or label or updatedAt missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/createHistory", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    createdAt: createdAt,
                    label: label,
                    updatedAt: updatedAt
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                throw new Error(supabaseResponse.status.toString());
            }

            const data = await supabaseResponse.json();

            return {
                id: data.id ?? null,
                message: data.message ?? null
            };
        } catch (err) {
            return {
                message: err ?? null
            };
        }
    }

    async IsResponseOK(response) {
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API responded but failed", {
                status: response.status,
                body: errorBody,
            });
        }

        return response.ok;
    }
}


export default new Supabase();