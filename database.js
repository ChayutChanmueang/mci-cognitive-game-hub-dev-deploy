import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

class Supabase {
    constructor() {
        this.supabase = null;
        this.config = {
            host: process.env.DB_HOST || "",
            serviceRole:
                process.env.DB_SERVICE_ROLE ||
                process.env.SUPABASE_SERVICE_ROLE_KEY ||
                "",
        };
    }

    requireConnection() {
        if (!this.supabase) {
            throw new Error("Supabase client is not connected.");
        }
    }

    async connect() {
        if (!this.config.host) {
            throw new Error("Missing DB_HOST in .env");
        }

        if (!this.config.serviceRole) {
            throw new Error(
                "Missing DB_SERVICE_ROLE in .env. Use the Supabase service_role key for the backend.",
            );
        }

        console.log(`Connecting to Supabase URL ${this.config.host}`);
        this.supabase = createClient(this.config.host, this.config.serviceRole, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        });

        console.log("Supabase service client ready.");
        return true;
    }

    async disconnect() {
        this.supabase = null;
        return { success: true };
    }

    async hello() {
        this.requireConnection();
        return "Hello World!";
    }

    async getRow(from, select, order, ascending) {
        this.requireConnection();

        if (!from) {
            throw new Error("Invalid parameters");
        }

        let query = this.supabase.from(from).select(select || "*");

        if (Array.isArray(order)) {
            order.forEach((item) => {
                query = query.order(item.column, { ascending: item.ascending });
            });
        } else if (order) {
            query = query.order(order, { ascending: ascending ?? false });
        }

        const { data, error } = await query;

        if (error) {
            console.error("Select error:", error);
            throw error;
        }

        console.log(`Found ${data.length} records`);
        console.log(`Row : ${JSON.stringify(data)}`);
        return data;
    }

    async getRowSingle(from, select, row, value) {
        this.requireConnection();

        if (!from || !row || value === undefined || value === null) {
            throw new Error("Invalid parameters");
        }

        const { data, error } = await this.supabase
            .from(from)
            .select(select || "*")
            .eq(row, value)
            .single();

        if (error) {
            console.error("Select error:", error);
            throw error;
        }

        console.log(`Row : ${JSON.stringify(data)}`);
        return data;
    }

    async createRow(from, insert) {
        this.requireConnection();

        if (!from || !insert) {
            throw new Error("Invalid parameters");
        }

        const { data, error } = await this.supabase
            .from(from)
            .insert([insert])
            .select()
            .single();

        if (error) {
            console.error("Insert error:", error);
            throw error;
        }

        if (!data) {
            console.warn("ID not return");
            return null;
        }

        console.log(`ID : ${data.id}`);
        return data.id;
    }

    async updateRow(from, update, row, value) {
        this.requireConnection();

        if (!from || !update || !row || value === undefined || value === null) {
            throw new Error("Invalid parameters");
        }

        const { data, error } = await this.supabase
            .from(from)
            .update(update)
            .eq(row, value)
            .select()
            .single();

        if (error) {
            console.error("Update error:", error);
            throw error;
        }

        if (!data) {
            console.warn("ID not return");
            return null;
        }

        console.log(`ID : ${data.id}`);
        return data.id;
    }
}

export default new Supabase();
