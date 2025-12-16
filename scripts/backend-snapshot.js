#!/usr/bin/env node
/**
 * backend-snapshot.js
 *
 * Writes a backend snapshot to the TOP-LEVEL project folder:
 *   - backend.snapshot.md  (always; derived from `supabase gen types`)
 *   - backend.snapshot.sql (optional; only if a dump method is available)
 *
 * Goals:
 *  - Always works (no Docker required) for the MD snapshot
 *  - Never prints secrets (DB URL) to the console
 *  - Optionally produces a real SQL dump:
 *      A) If Docker is available -> use `npx supabase db dump`
 *      B) Else if pg_dump is available -> use `pg_dump`
 *      C) Else -> skip SQL dump and explain in the MD
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ------------------------------
// Env loading (same approach as your typegen script)
// ------------------------------
try {
  const dotenvPath = path.resolve(__dirname, "..", ".env.local");
  if (fs.existsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath });
  } else {
    require("dotenv").config();
  }
} catch (_) {
  // ignore dotenv errors
}

const env = process.env;

// Prefer URL-derived ref, same as you already do
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "";
let projectRef = env.SUPABASE_PROJECT_REF || env.SUPABASE_PROJECT_ID || "";
const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL || "";

// Derive projectRef from URL hostname if not set
if (!projectRef && supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    projectRef = url.hostname.split(".")[0];
  } catch (_) {}
}

if (!projectRef && !dbUrl) {
  console.error(
    "Error: Need either NEXT_PUBLIC_SUPABASE_URL (to derive project ref) / SUPABASE_PROJECT_REF, or DATABASE_URL."
  );
  process.exit(1);
}

// Save to top-level project folder
const outMd = path.resolve(__dirname, "..", "backend.snapshot.md");
const outSql = path.resolve(__dirname, "..", "backend.snapshot.sql");

// ------------------------------
// Helpers
// ------------------------------
function run(cmd, args, label, { redactDbUrl = false } = {}) {
  const printableArgs = redactDbUrl
    ? args.map((a, i) => (args[i - 1] === "--db-url" ? "[REDACTED_DB_URL]" : a))
    : args;

  console.log(`Running: ${cmd} ${printableArgs.join(" ")} (${label})`);

  const res = spawnSync(cmd, args, { encoding: "utf8", shell: true });

  if (res.error) {
    console.error(`Failed to run command (${label}):`, res.error);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(`${cmd} exited non-zero (${label}):`);
    // stderr often includes secrets if you print the full command; we do not.
    console.error(res.stderr || res.stdout);
    process.exit(res.status || 1);
  }
  return res.stdout;
}

function commandExists(cmd) {
  const r = spawnSync(cmd, ["--version"], { encoding: "utf8", shell: true });
  return r.status === 0;
}

function dockerAvailable() {
  // `docker version` is a better availability check than `docker --version`
  const r = spawnSync("docker", ["version"], { encoding: "utf8", shell: true });
  return r.status === 0;
}

function safeWrite(filePath, contents) {
  fs.writeFileSync(filePath, contents, "utf8");
}

// ------------------------------
// 1) Always generate a types-based snapshot (works without Docker/DB tools)
// ------------------------------
let typesOut = "";
const schema = env.SUPABASE_TYPEGEN_SCHEMA || "public,auth";

if (projectRef) {
  console.log("Using Supabase project id/ref:", projectRef);
  typesOut = run(
    "npx",
    ["supabase", "gen", "types", "typescript", "--project-id", projectRef, "--schema", schema],
    "types"
  );
} else {
  // Fallback: if no ref but dbUrl exists, we can still generate types via db-url
  console.log("No project ref found; using DATABASE_URL for types.");
  typesOut = run(
    "npx",
    ["supabase", "gen", "types", "typescript", "--db-url", dbUrl, "--schema", schema],
    "types",
    { redactDbUrl: true }
  );
}

// ------------------------------
// 2) Optional: generate a FULL SQL dump (best-effort, never required)
// ------------------------------
let sqlDumpOut = "";
let sqlDumpMethod = "";
let sqlDumpNote = "";

// Prefer Docker + supabase db dump if possible (matches Supabase expectations)
if (dbUrl && dockerAvailable()) {
  try {
    sqlDumpOut = run(
      "npx",
      ["supabase", "db", "dump", "--db-url", dbUrl, "--schema", schema],
      "db dump (docker)",
      { redactDbUrl: true }
    );
    sqlDumpMethod = "supabase db dump (Docker)";
  } catch (e) {
    // run() already exits on failure, but keep a note just in case
    sqlDumpNote =
      "Attempted Docker-based dump but it failed. Types snapshot still generated.\n";
  }
} else if (dbUrl && commandExists("pg_dump")) {
  // Docker not available, but pg_dump is
  // Note: pg_dump expects URL at the end; schema flags differ by version but this is standard.
  try {
    sqlDumpOut = run(
      "pg_dump",
      ["--schema=public", "--schema=auth", "--no-owner", "--no-privileges", dbUrl],
      "pg_dump",
      { redactDbUrl: true } // we never print args with dbUrl, but keep flag
    );
    sqlDumpMethod = "pg_dump (local Postgres tools)";
  } catch (e) {
    sqlDumpNote =
      "Attempted pg_dump but it failed. Types snapshot still generated.\n";
  }
} else {
  if (!dbUrl) {
    sqlDumpNote =
      "No DATABASE_URL provided, so a full SQL dump was skipped.\n";
  } else if (!dockerAvailable() && !commandExists("pg_dump")) {
    sqlDumpNote =
      "Skipped full SQL dump: Docker Desktop is not running/available and pg_dump is not installed.\n" +
      "You still got a types-based backend snapshot (tables/enums/RPC signatures).\n" +
      "If you want full SQL (including function bodies/triggers/policies), either:\n" +
      "  - Install/run Docker Desktop, or\n" +
      "  - Install PostgreSQL tools (pg_dump) locally.\n";
  }
}

// Write SQL dump only if we have it
if (sqlDumpOut && sqlDumpOut.trim().length > 0) {
  safeWrite(outSql, sqlDumpOut);
  console.log(`Wrote full SQL backend snapshot to: ${outSql} (${sqlDumpMethod})`);
}

// ------------------------------
// 3) Write MD snapshot (always)
// ------------------------------
const now = new Date().toISOString();

const md = `# Backend Snapshot

Generated: ${now}

## What this is
This file is a **reference snapshot** of the Supabase backend as seen by type generation.
It is designed to be something you can point Copilot/Codex at and say:

> “This describes what’s currently in the backend (tables/enums/RPC signatures). Make the frontend match it.”

## What it contains
- Generated TypeScript definitions from: \`supabase gen types\`
- Schemas included: \`${schema}\`

## Full SQL dump
${
  sqlDumpOut && sqlDumpOut.trim().length > 0
    ? `✅ Generated \`backend.snapshot.sql\` using: **${sqlDumpMethod}**`
    : `❌ Not generated.\n\n${(sqlDumpNote || "").trim()}`
}

---

## Generated Types

\`\`\`ts
${typesOut.trim()}
\`\`\`
`;

safeWrite(outMd, md);
console.log("Wrote backend snapshot to:", outMd);
