/**
 * Schema consistency check.
 *
 * Queries the live Supabase DB and verifies that every targetTable/targetColumn
 * pair referenced in questions.ts actually exists and has the right type.
 *
 * Run with: npm run check:schema
 *
 * Exit code 0 = all good. Exit code 1 = mismatches found.
 */

import 'dotenv/config';
import { QUESTIONS } from '../src/lib/form/questions';

const PROJECT_ID = 'iqpcrjofhwollksgevqo';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in environment');
  process.exit(1);
}

type ColumnRow = {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
};

async function queryDB(sql: string): Promise<unknown[]> {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB query failed: ${text}`);
  }
  return res.json() as Promise<unknown[]>;
}

async function main() {
  // Tables we need to check (from auto-save ALLOWED_TABLES, minus auth_users)
  const tables = ['profiles', 'partner_preferences', 'medical_credentials', 'users', 'compatibility_profiles'];

  const rows = (await queryDB(
    `SELECT table_name, column_name, data_type, udt_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name IN (${tables.map((t) => `'${t}'`).join(',')})
     ORDER BY table_name, column_name`
  )) as ColumnRow[];

  // Build lookup: table -> column -> { data_type, udt_name }
  const schema = new Map<string, Map<string, { data_type: string; udt_name: string }>>();
  for (const row of rows) {
    if (!schema.has(row.table_name)) schema.set(row.table_name, new Map());
    schema.get(row.table_name)!.set(row.column_name, { data_type: row.data_type, udt_name: row.udt_name });
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const q of QUESTIONS) {
    // These types manage their own persistence (upload API) — skip schema check
    if (q.type === 'file_upload' || q.type === 'guided_photo_upload' || q.type === 'claude_chat') continue;

    const table = q.targetTable;
    if (!table || table === 'local' || table === 'auth_users') continue;

    const columns = schema.get(table);
    if (!columns) {
      errors.push(`[${q.id}] Table '${table}' not found in DB`);
      continue;
    }

    // Check primary targetColumn
    const checkColumn = (col: string, expectedArray: boolean) => {
      if (!columns.has(col)) {
        errors.push(`[${q.id}] Column '${table}.${col}' not found in DB`);
        return;
      }
      const info = columns.get(col)!;
      const isArray = info.data_type === 'ARRAY';
      if (expectedArray && !isArray) {
        errors.push(
          `[${q.id}] Column '${table}.${col}' should be text[] but is '${info.data_type}' (udt: ${info.udt_name}) — multi_select values will be JSON-stringified`
        );
      }
    };

    const isArrayType =
      q.type === 'multi_select' ||
      (q.type === 'range' && !!q.targetColumn2) === false; // range splits into 2 scalars

    if (q.type === 'multi_select') {
      checkColumn(q.targetColumn, true);
    } else if (q.type === 'range' && q.targetColumn2) {
      checkColumn(q.targetColumn, false);
      checkColumn(q.targetColumn2, false);
    } else if (q.type === 'dual_location' && q.targetColumn2 && q.targetColumn3) {
      checkColumn(q.targetColumn, true);  // states array
      checkColumn(q.targetColumn2, true); // countries array
      checkColumn(q.targetColumn3, false); // noPreference bool
    } else if (q.type === 'international_location' && q.targetColumn2) {
      checkColumn(q.targetColumn, false);
      checkColumn(q.targetColumn2, false);
    } else {
      checkColumn(q.targetColumn, false);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ Schema check passed — all question columns exist with correct types');
    process.exit(0);
  }

  if (warnings.length > 0) {
    console.warn('\nWarnings:');
    warnings.forEach((w) => console.warn(' ⚠', w));
  }

  if (errors.length > 0) {
    console.error('\nErrors:');
    errors.forEach((e) => console.error(' ✗', e));
    console.error(`\n${errors.length} schema error(s) found. Run 'npm run gen:types' after fixing.`);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('check-schema failed:', err);
  process.exit(1);
});
