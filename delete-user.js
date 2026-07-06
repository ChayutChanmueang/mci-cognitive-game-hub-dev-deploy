#!/usr/bin/env node
import 'dotenv/config'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import pg from 'pg'

const argv = yargs(hideBin(process.argv))
.option('hn', { type: 'string', demandOption: true })
.option('dry-run', { type: 'boolean', default: false })
.strict()
.parse()

const hn = argv.hn
const dryRun = argv['dry-run']

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env
if (!PGHOST || !PGUSER || !PGDATABASE || !PGPASSWORD) {
    console.error('Missing PG* env vars. Set PGHOST, PGPORT (optional), PGDATABASE, PGUSER, PGPASSWORD')
    process.exit(1)
}

const client = new pg.Client({
    host: PGHOST,
    port: PGPORT ? Number(PGPORT) : 5432,
                             database: PGDATABASE,
                             user: PGUSER,
                             password: PGPASSWORD,
                             ssl: { rejectUnauthorized: false }
})

function quoteLiteral(v) {
    return v
}

async function main() {
    await client.connect()

    try {
        const fkRows = await client.query(
            `
            with fk as (
                select
                tc.table_schema   as referencing_schema,
                tc.table_name     as referencing_table,
                kcu.column_name   as referencing_column,
                ccu.table_schema  as referenced_schema,
                ccu.table_name    as referenced_table,
                ccu.column_name  as referenced_column,
                tc.constraint_name
                from information_schema.table_constraints tc
                join information_schema.key_column_usage kcu
                on tc.constraint_name = kcu.constraint_name
                and tc.table_schema = kcu.table_schema
                join information_schema.constraint_column_usage ccu
                on ccu.constraint_name = tc.constraint_name
                and ccu.table_schema = tc.table_schema
                where tc.constraint_type = 'FOREIGN KEY'
                and ccu.table_schema = 'public'
                and ccu.table_name = 'user_data'
                and ccu.column_name = 'hn'
            )
            select * from fk
            order by referencing_table;
            `
        )

        const referencingTables = [...new Set(fkRows.rows.map(r => `${r.referencing_schema}.${r.referencing_table}`))]

        const planDeletes = [
            ...referencingTables.map((t) => ({ table: t })),
            { table: 'public.user_data' }
        ]

        if (dryRun) {
            console.log('[dry-run] Planned deletes (order matters):')
            for (const d of planDeletes) {
                console.log(`- DELETE FROM ${d.table} WHERE hn = $1`)
            }
            return
        }

        await client.query('BEGIN;')

        for (const d of planDeletes) {
            await client.query(
                `DELETE FROM ${d.table} WHERE hn = $1`,
                [hn]
            )
            console.log(`[ok] deleted from ${d.table}`)
        }

        await client.query('COMMIT;')
        console.log(`[done] Cleaned user with hn=${hn}`)
    } catch (e) {
        await client.query('ROLLBACK;')
        console.error('Failed:', e.message)
        process.exit(1)
    } finally {
        await client.end()
    }
}

main()
