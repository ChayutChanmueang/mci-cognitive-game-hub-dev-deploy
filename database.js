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

    /** Connect Function **/
// #region Connect Function
    async ensureLogin() {
        if (!this.isLoggedIn() || !await this.requestTestConnection()) {
            console.log("Session expired. Reconnecting...");
            await this.connect();
        }
    }

    async connect(retry = 12) {
        console.log(`Connecting to Supabase URL ${this.config.host}`);
        console.log(`Username ${this.config.user}`);
        console.log(`Password ${this.config.password}`);
        console.log(`ANON ${this.config.anon}`);
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
// #endregion
    /** Connect Function **/

    /** Application Functions **/
// #region Application Functions
    async requestTestConnection() {
        try {
            const controller = new AbortController();

            console.log('Request test connection...');

            const url = new URL("functions/v1/test/checkConnection", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                console.error(supabaseResponse.status.toString())
                throw new Error(supabaseResponse.status.toString());
            }

            console.log("Request test connection successful");
            return await this.IsResponseOK(supabaseResponse);
        } catch (err) {
            return false;
        }
    }

    async hello() {
        await this.ensureLogin();

        try {
            const controller = new AbortController();

            console.log('Request hello function...');

            const url = new URL("functions/v1/read-database/hello", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                console.error(supabaseResponse.status.toString())
                throw new Error(supabaseResponse.status.toString());
            }

            const text = await supabaseResponse.text();

            console.log(`Message: ${text}`)

            return text;
        } catch (err) {
            return err;
        }
    }

    async getRow(from, select, order, ascending){
        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/read-database/getRow", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    from: from,
                    select: select,
                    order: order,
                    ascending: ascending
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                console.error(supabaseResponse.status.toString())
                throw new Error(supabaseResponse.status.toString());
            }

            const result = await supabaseResponse.json();

            console.log(`Message: ${result.message}`)

            console.log(`Row : ${JSON.stringify(result.data)}`);
            return result.data;
        } catch (err) {
            return err;
        }
    }

    async getRowSingle(from, select, row, value){
        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/read-database/getRowSingle", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    from: from,
                    select: select,
                    row: row,
                    value: value
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                console.error(supabaseResponse.status.toString())
                throw new Error(supabaseResponse.status.toString());
            }

            const result = await supabaseResponse.json();

            console.log(`Message: ${result.message}`)

            return result.data;
        } catch (err) {
            return err;
        }
    }

    async createRow(from, insert){
        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/createRow", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    from: from,
                    insert: insert
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                console.error(supabaseResponse.status.toString())
                throw new Error(supabaseResponse.status.toString());
            }

            const result = await supabaseResponse.json();

            console.log(`Message: ${result.message}`)

            return result.id;
        } catch (err) {
            return err;
        }
    }

    async updateRow(from, update, row, value){
        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/updateRow", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    from: from,
                    update: update,
                    row: row,
                    value: value
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                console.error(supabaseResponse.status.toString())
                throw new Error(supabaseResponse.status.toString());
            }

            const result = await supabaseResponse.json();

            console.log(`Message: ${result.message}`)

            return result.id;
        } catch (err) {
            return err;
        }
    }
// #endregion
    /** Application Functions **/
}

export default new Supabase();