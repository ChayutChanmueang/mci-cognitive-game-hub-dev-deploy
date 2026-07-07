#!/usr/bin/env node
/**
 * delete-user.js — CLI-only tool to permanently delete patient accounts.
 *
 * Deletes a user's `user_data` row(s). Every table with a foreign key to
 * `user_data` uses ON DELETE CASCADE, so all linked rows (game logs, history,
 * event logs, roles, etc.) are removed automatically and atomically by the
 * database in a single statement — no manual table ordering required.
 *
 * Environment (loaded from the project `.env`, same variables as the app):
 *   SUPABASE_URL              (or VITE_SUPABASE_URL)   — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) — service_role key
 *
 * A service_role key is REQUIRED: the anon/publishable key is blocked by RLS
 * and cannot delete other users' data. Keep the service_role key server-side
 * only; never ship it to the browser bundle.
 *
 * Usage:
 *   node delete-user.js --hn 12345                 # one user
 *   node delete-user.js --hn 12345 --hn 67890      # several users
 *   node delete-user.js --hn 12345,67890           # comma list, same effect
 *   node delete-user.js --all --yes                # every user (needs --yes)
 *   node delete-user.js --hn 12345 --dry-run       # preview, no writes
 *   node delete-user.js --help
 */
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

// Root table we delete from. Everything else cascades from the DB constraints.
const ROOT_TABLE = "user_data";

// Tables that cascade when a user_data row is deleted — informational only,
// used to render a preview in --dry-run. `via` is the user_data column the
// table's `column` points at (kept in sync with the ON DELETE CASCADE FKs;
// see docs/software/03-data-schema.md).
const CASCADE_TABLES = [
    { table: "game_replay_log", column: "hn", via: "hn" },
    { table: "game_user_log", column: "hn", via: "hn" },
    { table: "user_game_history", column: "hn", via: "hn" },
    { table: "user_game_profile_data", column: "hn", via: "hn" },
    { table: "user_event_log", column: "user_id", via: "id" },
    { table: "user_personnel", column: "user_id", via: "id" },
    { table: "user_roles", column: "user_id", via: "id" },
];

const HELP = `delete-user.js — permanently delete patient accounts (CLI only)

Usage:
  node delete-user.js --hn <HN> [--hn <HN> ...]   Delete one or more users
  node delete-user.js --hn <HN>,<HN>              Comma-separated HNs
  node delete-user.js --all --yes                 Delete ALL users
  node delete-user.js ... --dry-run               Preview only, no writes
  node delete-user.js --help                      Show this help

Options:
  --hn <HN>    HN of a user to delete. Repeatable and/or comma-separated.
  --all        Delete every user (requires --yes as a safety confirmation).
  --yes        Confirm a destructive --all run.
  --dry-run    Print the plan (and row counts if reachable) without deleting.
  --help       Show this help.

Linked rows in game_replay_log, game_user_log, user_game_history,
user_game_profile_data, user_event_log, user_personnel and user_roles are
removed automatically via ON DELETE CASCADE.

Environment (from .env):
  SUPABASE_URL / VITE_SUPABASE_URL              Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY   service_role key (required)`;

function parseHnList(values) {
    const list = Array.isArray(values) ? values : values ? [values] : [];
    return [
        ...new Set(
            list
                .flatMap((v) => String(v).split(","))
                .map((v) => v.trim())
                .filter(Boolean),
        ),
    ];
}

function fail(message) {
    console.error(`[error] ${message}`);
    process.exit(1);
}

async function main() {
    // Load .env from the project root using the Node built-in (no dotenv dep).
    // Real environment variables still win / act as a fallback if .env absent.
    try {
        process.loadEnvFile();
    } catch {
        // No .env file — rely on the ambient environment instead.
    }

    let parsed;
    try {
        parsed = parseArgs({
            options: {
                hn: { type: "string", multiple: true },
                all: { type: "boolean", default: false },
                yes: { type: "boolean", default: false },
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

    const dryRun = parsed["dry-run"];
    const deleteAll = parsed.all;
    const hnList = parseHnList(parsed.hn);

    // Validate the selection.
    if (deleteAll && hnList.length > 0) {
        fail("Use either --hn or --all, not both.");
    }
    if (!deleteAll && hnList.length === 0) {
        fail(`No target specified. Pass --hn <HN> or --all.\n\n${HELP}`);
    }
    if (deleteAll && !parsed.yes && !dryRun) {
        fail("Refusing to delete ALL users without --yes. Add --yes to confirm.");
    }

    const scope = deleteAll ? "ALL users" : `HN: ${hnList.join(", ")}`;
    console.log(`Target: ${scope}`);
    console.log(
        deleteAll
            ? `Plan: DELETE FROM ${ROOT_TABLE} (all rows) — linked rows cascade.`
            : `Plan: DELETE FROM ${ROOT_TABLE} WHERE hn IN (${hnList.join(", ")}) — linked rows cascade.`,
    );

    // Resolve credentials.
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
        if (dryRun) {
            console.log(
                `\n[dry-run] Missing ${missing}; printed plan only (no row counts).`,
            );
            return;
        }
        fail(
            `Missing ${missing}. Add them to .env. A service_role key is required ` +
                "because the anon key cannot delete other users' data (RLS).",
        );
    }

    const client = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    if (dryRun) {
        // Resolve the internal ids of the targeted users so we can count the
        // tables that reference user_data.id (not hn).
        let targetIds = [];
        if (!deleteAll) {
            const { data, error } = await client
                .from(ROOT_TABLE)
                .select("id")
                .in("hn", hnList);
            if (error) fail(`Lookup of target users failed: ${error.message}`);
            targetIds = (data || []).map((r) => r.id);
        }

        const countFor = async (table, column, keys) => {
            let query = client.from(table).select("*", { count: "exact", head: true });
            query = deleteAll ? query.not(column, "is", null) : query.in(column, keys);
            const { count, error } = await query;
            return error ? `(count failed: ${error.message})` : `${count ?? 0} row(s)`;
        };

        console.log("\n[dry-run] Rows that would be deleted:");
        console.log(
            `  - ${ROOT_TABLE}: ${await countFor(ROOT_TABLE, "hn", hnList)}`,
        );
        for (const { table, column, via } of CASCADE_TABLES) {
            const keys = via === "hn" ? hnList : targetIds;
            console.log(`  - ${table} (cascade): ${await countFor(table, column, keys)}`);
        }
        console.log("\n[dry-run] No rows were deleted.");
        return;
    }

    // Execute: a single delete on user_data; the DB cascades the rest atomically.
    const query = client.from(ROOT_TABLE).delete().select("id");
    const { data, error } = deleteAll
        ? await query.not("id", "is", null)
        : await query.in("hn", hnList);
    if (error) {
        fail(`Delete from ${ROOT_TABLE} failed: ${error.message}`);
    }
    const removed = data ? data.length : 0;
    console.log(
        `[done] Deleted ${removed} ${ROOT_TABLE} row(s) for ${scope}; linked rows cascaded.`,
    );
}

// CLI-only guard: run only when invoked directly as a script, never on import.
const invokedDirectly =
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    main().catch((e) => fail(e.message));
} else {
    throw new Error("delete-user.js is a CLI tool; run it with node, do not import it.");
}
