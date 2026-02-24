import mysql from "mysql2/promise";
import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js'

class Supabase {
    constructor() {
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
            return this.getErrorMessage(err);
        }
    }

    async getAllHistory() {
        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/read-database/getAllHistory", this.config.host);
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
                throw new Error(supabaseResponse.status.toString());
            }

            const history = await supabaseResponse.json();

            return history;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getChatByID(id) {
        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/read-database/getChatByID", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                throw new Error(supabaseResponse.status.toString());
            }

            const chat = await supabaseResponse.json();

            return chat;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getChatMessageByID(id) {
        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/read-database/getChatMessageByID", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                throw new Error(supabaseResponse.status.toString());
            }

            const chat = await supabaseResponse.json();

            return chat;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async createChat(id, prompt, createdAt, updatedAt) {
        if (!id || !prompt || !createdAt || !updatedAt) {
            throw new Error("Invalid parameters: id or prompt or createdAt or updatedAt missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/createChat", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id,
                    prompt: prompt,
                    createdAt: createdAt,
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
            return this.getErrorMessage(err);
        }
    }

    async updateChatMessage(id, message, updatedAt) {
        if (!id || !message || !updatedAt) {
            throw new Error("Invalid parameters: id or message or updatedAt");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/updateChatMessage", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id,
                    message: message,
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
            return this.getErrorMessage(err);
        }
    }

    async updateChatUnityCode(id, unityCode, updatedAt)  {
        if (!id || !unityCode || !updatedAt) {
            throw new Error("Invalid parameters: id or unityCode or updatedAt");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/updateChatUnityCode", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id,
                    unityCode: unityCode,
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
            return this.getErrorMessage(err);
        }
    }

    async newMessage(chatId, message, createdAt)  {
        if (!chatId || !createdAt) {
            throw new Error("Invalid parameters: id or createdAt");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/newMessage", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    chatId: chatId,
                    message: message,
                    createdAt: createdAt
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
            return this.getErrorMessage(err);
        }
    }

    async newUnityCode(chatId, unityCode, createdAt)  {
        if (!chatId || !createdAt) {
            throw new Error("Invalid parameters: id or createdAt");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/newUnityCode", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    chatId: chatId,
                    unityCode: unityCode,
                    createdAt: createdAt
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
            return this.getErrorMessage(err);
        }
    }

    async createResponseLog(model, chatId, userInput, startAt, endAt, completed)  {
        if (!model || !startAt || !endAt) {
            throw new Error("Invalid parameters: model or startAt or endAt missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/createResponseLog", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    model: model,
                    chatId: chatId,
                    userInput: userInput,
                    startAt: startAt,
                    endAt: endAt,
                    completed: completed,
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
            return this.getErrorMessage(err);
        }
    }

    async updateResponseLog(id, chatId, endAt, completed)  {
        if (!endAt) {
            throw new Error("Invalid parameters: endAt missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/updateResponseLog", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id,
                    chatId: chatId,
                    endAt: endAt,
                    completed: completed,
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
            return this.getErrorMessage(err);
        }
    }

    async createSystemLog(type, script, log, createdAt, responseId)  {
        if (!type || !script || !log || !createdAt) {
            throw new Error("Invalid parameters: type or script or log or createdAt missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/createSystemLog", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    type: type,
                    script: script,
                    log: log,
                    createdAt: createdAt,
                    responseId: responseId
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
            return this.getErrorMessage(err);
        }
    }

    async createSystemSetting(name, value)  {
        if (!name || !value) {
            throw new Error("Invalid parameters: name or value missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/createSystemSetting", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    name: name,
                    value: value,
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
            return this.getErrorMessage(err);
        }
    }

    async updateSystemSettingByName(name, value)  {
        if (!name || !value) {
            throw new Error("Invalid parameters: name or value missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/updateSystemSettingByName", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    name: name,
                    value: value,
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
            return this.getErrorMessage(err);
        }
    }

    async updateSystemSettingByID(id, value)  {
        if (!id || !value) {
            throw new Error("Invalid parameters: id or value missing");
        }

        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/write-database/updateSystemSettingByID", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id,
                    value: value,
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
            return this.getErrorMessage(err);
        }
    }

    async getSettingByID(id) {
        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/read-database/getSettingByID", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    id: id
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                throw new Error(supabaseResponse.status.toString());
            }

            const setting = await supabaseResponse.json();

            return setting;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getSettingByName(name) {
        await this.ensureLogin();

        try {
            const controller = new AbortController();
            const url = new URL("functions/v1/read-database/getSettingByName", this.config.host);
            const supabaseResponse = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.anon}`
                },
                body: JSON.stringify({
                    token: this.data.session.access_token,
                    name: name
                }),
                signal: controller.signal,
            });

            if (!await this.IsResponseOK(supabaseResponse)){
                throw new Error(supabaseResponse.status.toString());
            }

            const setting = await supabaseResponse.json();

            return setting;
        } catch (err) {
            console.error(err);
            return null;
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

    getErrorMessage(err) {
        return {
            id: null,
            message: err.message || "Unknown error",
            error: err
        };
    }
}

class MySqlConnection {
    constructor() {
        this.connection = null;

        this.config = {
            host: process.env.DB_HOST || "localhost",
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASS || "",
            database: process.env.DB_NAME || "testdb",
        };
    }

    async connect() {
        if (!this.connection){
            try {
                this.connection = await mysql.createConnection(this.config);
                console.log(`Connected to MySQL: ${this.config.host}:${this.config.port}`);

                this.connection.on("error", async (err) => {
                    console.error("MySQL connection error:", err.message);
                    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
                        console.log("Attempting to reconnect...");
                        this.connection = null;
                        await this.reconnect();
                    }
                });

            } catch (error) {
                console.error("Database connection failed:", error.message);
                throw error;
            }
        }

        return this.connection;
    }

    async reconnect() {
        let retries = 5;
        while (retries > 0) {
            try {
                console.log(`Reconnecting to MySQL... (${6 - retries}/5)`);
                this.connection = await mysql.createConnection(this.config);
                console.log("Reconnected to MySQL!");
                return;
            } catch (error) {
                console.error("Reconnect failed:", error.message);
                retries--;
                await new Promise(r => setTimeout(r, 2000));
            }
        }
        throw new Error("Could not reconnect to MySQL after several attempts");
    }

    async checkConnection() {
        try {
            if (!this.connection) {
                await this.connect();
                return true;
            }
            await this.connection.ping();
            return true;
        } catch (error) {
            console.warn("Lost MySQL connection, reconnecting...");
            this.connection = null;
            await this.reconnect();
            return true;
        }
    }

    async safeQuery(sql, params = []) {
        try {
            await this.checkConnection();
            console.log("MySQL still connected.");
            return await this.connection.query(sql, params);
        } catch (error) {
            if (
                error.message.includes("Can't add new command when connection is in closed state") ||
                error.code === "PROTOCOL_CONNECTION_LOST" ||
                error.code === "ECONNRESET" ||
                error.code === "ECONNREFUSED"
            ) {
                console.warn("MySQL connection lost, reconnecting...");
                this.connection = null;
                await this.reconnect();

                return await this.connection.query(sql, params);
            }

            throw error;
        }
    }

    async createHistory(createdAt, label, updatedAt) {
        if (!createdAt || !label || !updatedAt) {
            throw new Error("Invalid parameters: createdAt or label or updatedAt missing");
        }

        const sql = "INSERT INTO history (createdAt, label, updatedAt) VALUES (?, ?, ?)";
        const [result] = await this.safeQuery(sql, [createdAt, label, updatedAt]);
        return result.insertId;
    }

    async updateHistory(id, updatedAt) {
        if (!id || !updatedAt) {
            throw new Error("Invalid parameters: id or updatedAt missing");
        }

        const sql = "UPDATE history Set updatedAt = ? WHERE id = ?"
        const [result] = await this.safeQuery(sql, [updatedAt, id]);
        return result.affectedRows;
    }

    async deleteHistoryAndChat(id) {
        const sql = "DELETE FROM history WHERE id = ?"
        const result = await this.safeQuery(sql, [id]);

        await this.deleteChat(id);
        return result.affectedRows;
    }

    async deleteHistory(id) {
        const sql = "DELETE FROM history WHERE id = ?"
        const result = await this.safeQuery(sql, [id]);

        return result.affectedRows;
    }

    async getAllHistory() {
        const sql = "SELECT id, label, updatedAt FROM history ORDER BY updatedAt DESC;";
        return await this.safeQuery(sql);
    }

    async getHistory(id) {
        const sql = "SELECT * FROM history WHERE id = ?";
        return await this.safeQuery(sql, [id]);
    }

    async createChat(id, prompt, createdAt, updatedAt) {
        if (!id || !prompt || !createdAt || !updatedAt) {
            throw new Error("Invalid parameters: id or prompt or createdAt or updatedAt missing");
        }

        const sql = "INSERT INTO chat (id, prompt, createdAt, updatedAt) VALUES (?, ?, ?, ?)";
        const [result] = await this.safeQuery(sql, [id, prompt, createdAt, updatedAt]);
        return result.insertId;
    }

    async updateChatMessage(id, message, updatedAt) {
        if (!id || !message || !updatedAt) {
            throw new Error("Invalid parameters: id or message or updatedAt");
        }

        const sql = "UPDATE chat Set updatedAt = ?, message = ? WHERE id = ?"
        const [result] = await this.safeQuery(sql, [updatedAt, message, id]);
        return result.affectedRows;
    }

    async updateChatUnityCode(id, unityCode, updatedAt) {
        if (!id || !unityCode || !updatedAt) {
            throw new Error("Invalid parameters: id or unityCode or updatedAt");
        }

        const sql = "UPDATE chat Set updatedAt = ?, unityCode = ? WHERE id = ?"
        const [result] = await this.safeQuery(sql, [updatedAt, unityCode, id]);
        return result.affectedRows;
    }

    async newMessage(chatId, message, createdAt) {
        if (!chatId || !createdAt) {
            throw new Error("Invalid parameters: id or createdAt");
        }

        const sql = "INSERT INTO message (chatId, message, createdAt) VALUES (?, ?, ?)";
        const [result] = await this.safeQuery(sql, [chatId, message, createdAt]);
        return result.insertId;
    }

    async newUnityCode(chatId, unityCode, createdAt) {
        if (!chatId || !createdAt) {
            throw new Error("Invalid parameters: id or createdAt");
        }

        const sql = "INSERT INTO unityCode (chatId, code, createdAt) VALUES (?, ?, ?)";
        const [result] = await this.safeQuery(sql, [chatId, unityCode, createdAt]);
        return result.insertId;
    }

    async deleteChatAndHis(id) {
        const sql = "DELETE FROM chat WHERE id = ?"
        const result = await this.safeQuery(sql, [id]);

        await this.deleteHistory(id);
        return result.affectedRows;
    }

    async deleteChat(id) {
        const sql = "DELETE FROM chat WHERE id = ?"
        const result = await this.safeQuery(sql, [id]);

        return result.affectedRows;
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log("MySQL connection closed");
        }
    }

    async createResponseLog(model, chatId, userInput, startAt, endAt, completed) {
        if (!model || !startAt || !endAt) {
            throw new Error("Invalid parameters: model or startAt or endAt missing");
        }

        const sql = "INSERT INTO response_log (model, chatId, userInput, startAt, endAt, completed) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await this.safeQuery(sql, [model, chatId, userInput, startAt, endAt, completed]);
        return result.insertId;
    }

    async updateResponseLog(id, chatId, endAt, completed) {
        if (!endAt) {
            throw new Error("Invalid parameters: endAt missing");
        }

        const sql = "UPDATE response_log Set chatId = ?, endAt = ?, completed = ? WHERE id = ?"
        const [result] = await this.safeQuery(sql, [chatId, endAt, completed, id]);
        return result.affectedRows;
    }

    async createSystemLog(type, script, log, createdAt, responseId) {
        if (!type || !script || !log || !createdAt) {
            throw new Error("Invalid parameters: type or script or log or createdAt missing");
        }

        const sql = "INSERT INTO system_log (type, script, log, createdAt, responseId) VALUES (?, ?, ?, ?, ?)";
        const [result] = await this.safeQuery(sql, [type, script, log, createdAt, responseId]);
        return result.insertId;
    }
}


export default new Supabase();
export { MySqlConnection };