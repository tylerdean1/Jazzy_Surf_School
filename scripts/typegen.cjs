#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// This script generates Supabase TypeScript types into `lib/database.types.ts`.
// It requires either NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_REF to be set in the environment.

// Load .env.local if present so env vars are available when run via npm scripts
try {
    const dotenvPath = path.resolve(__dirname, '..', '.env.local');
    if (fs.existsSync(dotenvPath)) {
        require('dotenv').config({ path: dotenvPath });
    } else {
        require('dotenv').config();
    }
} catch (e) {
    // ignore dotenv errors
}

const env = process.env;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
let projectRef = env.SUPABASE_PROJECT_REF || env.SUPABASE_PROJECT_ID || '';
const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL || '';

// If projectRef isn't set but we have a NEXT_PUBLIC_SUPABASE_URL, derive the ref from the hostname.
if (!projectRef && supabaseUrl) {
    try {
        const url = new URL(supabaseUrl);
        projectRef = url.hostname.split('.')[0];
    } catch (e) {
        // ignore
    }
}

if (!projectRef && !dbUrl) {
    console.error('Error: Neither SUPABASE project ref nor DATABASE_URL found. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_REF, or provide DATABASE_URL.');
    process.exit(1);
}


const outPath = path.resolve(__dirname, '..', 'lib', 'database.types.ts');

let args;
if (projectRef) {
    console.log('Using Supabase project id/ref:', projectRef);
    args = ['gen', 'types', 'typescript', '--project-id', projectRef, '--schema', 'public'];
} else {
    const dbUrlFallback = env.DATABASE_URL || env.SUPABASE_DB_URL || '';
    console.log('Using DATABASE_URL to generate types');
    args = ['gen', 'types', 'typescript', '--db-url', dbUrlFallback, '--schema', 'public'];
}

console.log('Running: npx supabase', args.join(' '));
// Use shell:true so Windows can resolve `npx` through the shell (cmd.exe)
const res = spawnSync('npx', ['supabase', ...args], { encoding: 'utf8', shell: true });
if (res.error) {
    console.error('Failed to run supabase CLI via npx. Try installing @supabase/cli globally or run `npx supabase` manually.', res.error);
    process.exit(1);
}
if (res.status !== 0) {
    console.error('supabase CLI exited with non-zero status:');
    console.error(res.stderr || res.stdout);
    process.exit(res.status || 1);
}

fs.writeFileSync(outPath, res.stdout, 'utf8');
console.log('Wrote Supabase types to', outPath);
