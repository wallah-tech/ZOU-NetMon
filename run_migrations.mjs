// Migration runner - applies all SQL files to Supabase using REST API
// Uses the service_role key from the Supabase dashboard to run DDL
// Run with: node --env-file=.env run_migrations.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or key environment variables');
  process.exit(1);
}

// Since we can't run DDL via anon key in most configurations,
// we'll output the SQL to run manually
const migrationsDir = join(__dirname, 'supabase', 'migrations');
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql') && f >= '20260317090001')
  .sort();

console.log('\n=== ZOU NetMon - Supabase Migrations ===\n');
console.log('Migration files to apply:');
files.forEach(f => console.log(' -', f));
console.log('\nPlease go to https://supabase.com/dashboard/project/fwfcrbtvubxcomdltstw/sql/new');
console.log('and run the following consolidated SQL:\n');
console.log('='.repeat(60));

let allSql = '';
for (const file of files) {
  const content = readFileSync(join(migrationsDir, file), 'utf-8');
  allSql += `\n-- ===== ${file} =====\n${content}\n`;
}
console.log(allSql);
