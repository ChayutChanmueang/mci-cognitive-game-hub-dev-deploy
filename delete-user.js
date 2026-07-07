#!/usr/bin/env node
/**
 * delete-user.js — CLI-only tool to permanently delete patient accounts.
 *
 * Deletes a user's rows from every table that has a foreign key to
 * `user_data.hn`, then the `user_data` row itself, inside a best-effort
 * ordered cascade (children first, root last).
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

// Child tables carrying a direct FK to user_data.hn, in delete order
// (children first). The root table is deleted last. Keep this in sync with
// the schema (docs/software/03-data-schema.md); tables are deleted in the
// order listed here.
const CHILD_TABLES = [
    "game_replay_log",
    "user_game_history",
    "user_game_profile_data",
];
const ROOT_TABLE = "user_data";

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

    // Describe the plan (children first, root last).
    const orderedTables = [...CHILD_TABLES, ROOT_TABLE];
    const scope = deleteAll ? "ALL users" : `HN: ${hnList.join(", ")}`;
    console.log(`Target: ${scope}`);
    console.log("Planned deletes (order matters):");
    for (const table of orderedTables) {
        console.log(
            deleteAll
                ? `  - DELETE FROM ${table}  (all rows)`
                : `  - DELETE FROM ${table} WHERE hn IN (${hnList.join(", ")})`,
        );
    }

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

    // Helper: build a delete/select query scoped to the selection.
    const scoped = (query) =>
        deleteAll ? query.not("id", "is", null) : query.in("hn", hnList);

    if (dryRun) {
        console.log("\n[dry-run] Row counts that would be deleted:");
        for (const table of orderedTables) {
            const { count, error } = await scoped(
                client.from(table).select("id", { count: "exact", head: true }),
            );
            if (error) {
                console.log(`  - ${table}: (count failed: ${error.message})`);
            } else {
                console.log(`  - ${table}: ${count ?? 0} row(s)`);
            }
        }
        console.log("\n[dry-run] No rows were deleted.");
        return;
    }

    // Execute the cascade: children first, then the root table.
    let totalDeleted = 0;
    for (const table of orderedTables) {
        const { data, error } = await scoped(
            client.from(table).delete().select("id"),
        );
        if (error) {
            fail(`Delete from ${table} failed: ${error.message}`);
        }
        const removed = data ? data.length : 0;
        totalDeleted += removed;
        console.log(`[ok] deleted ${removed} row(s) from ${table}`);
    }

    console.log(`[done] Removed ${totalDeleted} row(s) for ${scope}.`);
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
