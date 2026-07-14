#!/usr/bin/env node
/**
 * update-user-hn.js — CLI-only tool to correct a patient's HN / Patient ID.
 *
 * Updates `user_data.hn` in one statement. Foreign keys from
 * `game_replay_log`, `game_user_log`, `user_game_history`, and
 * `user_game_profile_data` must use ON UPDATE CASCADE so PostgreSQL updates all
 * linked rows atomically. Apply and verify those constraints before using this
 * tool; this script intentionally does not perform non-atomic child updates.
 *
 * Environment (loaded from the project `.env`, same variables as the app):
 *   SUPABASE_URL              (or VITE_SUPABASE_URL)   — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) — service_role key
 *
 * A service_role key is REQUIRED: the anon/publishable key is blocked by RLS
 * and cannot update other users' data. Keep the service_role key server-side
 * only; never ship it to the browser bundle.
 *
 * Usage:
 *   node update-user-hn.js --from-hn 0812345678 --to-hn 12345
 *   node update-user-hn.js --from-hn 0812345678 --to-hn 12345 --dry-run
 *   node update-user-hn.js --help
 */
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT_TABLE = "user_data";

// Tables whose `hn` foreign key points to user_data.hn. Their constraints must
// use ON UPDATE CASCADE; this list is also used for --dry-run row counts.
const CASCADE_TABLES = [
    { table: "game_replay_log", column: "hn" },
    { table: "game_user_log", column: "hn" },
    { table: "user_game_history", column: "hn" },
    { table: "user_game_profile_data", column: "hn" },
];

const HELP = `update-user-hn.js — correct a patient's HN / Patient ID (CLI only)

Usage:
  node update-user-hn.js --from-hn <OLD> --to-hn <NEW>
  node update-user-hn.js --from-hn <OLD> --to-hn <NEW> --dry-run
  node update-user-hn.js --help

Options:
  --from-hn <HN>  Existing HN to replace.
  --to-hn <HN>    New HN. It must not already exist.
  --dry-run       Validate and print affected row counts without updating.
  --help          Show this help.

The HN foreign keys in game_replay_log, game_user_log, user_game_history, and
user_game_profile_data must use ON UPDATE CASCADE. PostgreSQL then changes the
root user and all linked rows atomically in one statement.

Environment (from .env):
  SUPABASE_URL / VITE_SUPABASE_URL                   Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY  service_role key (required)`;

function fail(message) {
    console.error(`[error] ${message}`);
    process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Transient network failures surface as a Supabase `error`. Retry those with
// exponential backoff. `runQuery` must create a fresh one-shot query each time.
async function withRetry(runQuery, { attempts = 4, baseDelay = 600 } = {}) {
    let result;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            result = await runQuery();
        } catch (e) {
            result = { error: e };
        }
        if (!result.error) return result;
        const message = String(result.error.message || result.error);
        const transient =
            /fetch failed|network|socket hang up|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|timeout|terminated/i.test(
                message,
            );
        if (!transient || attempt === attempts - 1) return result;
        const wait = baseDelay * 2 ** attempt;
        console.warn(
            `[retry] transient network error (${message}); retry ${attempt + 1}/${attempts - 1} in ${wait}ms...`,
        );
        await sleep(wait);
    }
    return result;
}

function normalizeHn(value) {
    return typeof value === "string" ? value.trim() : "";
}

async function main() {
    try {
        process.loadEnvFile();
    } catch {
        // No .env file — rely on the ambient environment instead.
    }

    let parsed;
    try {
        parsed = parseArgs({
            options: {
                "from-hn": { type: "string" },
                "to-hn": { type: "string" },
                "dry-run": { type: "boolean", default: false },
                help: { type: "boolean", default: false },
            },
            allowPositionals: false,
            strict: true,
        }).values;
    } catch (e) {
        fail(`${e.message}\n\n${HELP}`);
    }

    if (parsed.help) {
        console.log(HELP);
        return;
    }

    const fromHn = normalizeHn(parsed["from-hn"]);
    const toHn = normalizeHn(parsed["to-hn"]);
    const dryRun = parsed["dry-run"];

    if (!fromHn || !toHn) {
        fail(`Both --from-hn <OLD> and --to-hn <NEW> are required.\n\n${HELP}`);
    }
    if (fromHn === toHn) {
        fail("--from-hn and --to-hn must be different.");
    }

    console.log(`Target: HN ${fromHn} -> ${toHn}`);
    console.log(
        `Plan: UPDATE ${ROOT_TABLE} SET hn = ${JSON.stringify(toHn)} WHERE hn = ${JSON.stringify(fromHn)}; linked HN rows cascade.`,
    );

    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const serviceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        "";

    if (!url || !serviceKey) {
        const missing = [
            !url && "SUPABASE_URL (or VITE_SUPABASE_URL)",
            !serviceKey && "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)",
        ]
            .filter(Boolean)
            .join(", ");
        fail(
            `Missing ${missing}. Add them to .env. A service_role key is required ` +
                "because the anon key cannot update other users' data (RLS).",
        );
    }

    const client = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // Read up to two records defensively. The schema's unique constraint should
    // make more than one impossible, but an ambiguous source must never update.
    const { data: sourceRows, error: sourceError } = await withRetry(() =>
        client.from(ROOT_TABLE).select("id, hn").eq("hn", fromHn).limit(2),
    );
    if (sourceError) {
        fail(`Source HN lookup failed: ${sourceError.message}`);
    }
    if (!sourceRows || sourceRows.length === 0) {
        fail(`Source HN ${JSON.stringify(fromHn)} does not exist.`);
    }
    if (sourceRows.length !== 1) {
        fail(
            `Source HN ${JSON.stringify(fromHn)} matched ${sourceRows.length} users; refusing an ambiguous update.`,
        );
    }

    const { data: destinationRows, error: destinationError } = await withRetry(
        () => client.from(ROOT_TABLE).select("id").eq("hn", toHn).limit(1),
    );
    if (destinationError) {
        fail(`Destination HN lookup failed: ${destinationError.message}`);
    }
    if (destinationRows && destinationRows.length > 0) {
        fail(`Destination HN ${JSON.stringify(toHn)} already exists.`);
    }

    const countFor = async (table, column) => {
        const { count, error } = await withRetry(() =>
            client
                .from(table)
                .select("*", { count: "exact", head: true })
                .eq(column, fromHn),
        );
        return error ? `(count failed: ${error.message})` : `${count ?? 0} row(s)`;
    };

    if (dryRun) {
        console.log("\n[dry-run] Rows that would be updated:");
        console.log(`  - ${ROOT_TABLE}: 1 row(s)`);
        for (const { table, column } of CASCADE_TABLES) {
            console.log(
                `  - ${table} (cascade): ${await countFor(table, column)}`,
            );
        }
        console.log("\n[dry-run] No rows were updated.");
        return;
    }

    // This is deliberately one root-table statement. With ON UPDATE CASCADE on
    // every HN foreign key, PostgreSQL updates all linked rows atomically.
    const { data, error } = await withRetry(() =>
        client
            .from(ROOT_TABLE)
            .update({ hn: toHn })
            .eq("hn", fromHn)
            .select("id, hn"),
    );
    if (error) {
        const cascadeHint = /foreign key|constraint/i.test(error.message || "")
            ? " Verify that every foreign key to user_data.hn uses ON UPDATE CASCADE."
            : "";
        fail(`HN update failed: ${error.message}.${cascadeHint}`);
    }
    if (!data || data.length !== 1) {
        fail(`HN update affected ${data ? data.length : 0} user rows; expected exactly 1.`);
    }

    console.log(
        `[done] Updated ${ROOT_TABLE} row ${data[0].id}: HN ${fromHn} -> ${toHn}; linked HN rows cascaded atomically.`,
    );
}

// CLI-only guard: run only when invoked directly as a script, never on import.
const invokedDirectly =
    process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    main().catch((e) => fail(e.message));
} else {
    throw new Error(
        "update-user-hn.js is a CLI tool; run it with node, do not import it.",
    );
}
