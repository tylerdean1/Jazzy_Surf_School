/* eslint-disable no-console */

// CommonJS version (works on Node 22 without ESM/glob interop issues).
// Opens files in the CURRENT VS Code window with a delay so they show up as tabs.

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const DEFAULT_DELAY_MS = 200;
const delayMs = Number.parseInt(process.env.OPENALL_DELAY_MS || '', 10);
const DELAY = Number.isFinite(delayMs) ? delayMs : DEFAULT_DELAY_MS;

// If set, just prints the files and exits.
const DRY_RUN = String(process.env.OPENALL_DRY_RUN || '').trim() === '1';

// Optional: only open certain extensions.
// Example: set OPENALL_EXTS=.ts,.tsx,.js,.cjs,.json
const EXTS = (() => {
  const raw = String(process.env.OPENALL_EXTS || '').trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith('.') ? s.toLowerCase() : `.${s.toLowerCase()}`))
  );
})();

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', 'supabase']);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isWin() {
  return process.platform === 'win32';
}

function firstExistingPath(candidates) {
  for (const p of candidates) {
    if (!p) continue;
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

function resolveVsCodeCliCommand() {
  const override = (process.env.OPENALL_CODE_CMD || '').trim();
  if (override) return override;
  if (!isWin()) return 'code';

  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.ProgramFiles || '';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || '';

  const candidates = [
    'code',
    'code.cmd',
    localAppData ? path.join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd') : null,
    localAppData ? path.join(localAppData, 'Programs', 'Microsoft VS Code Insiders', 'bin', 'code.cmd') : null,
    programFiles ? path.join(programFiles, 'Microsoft VS Code', 'bin', 'code.cmd') : null,
    programFilesX86 ? path.join(programFilesX86, 'Microsoft VS Code', 'bin', 'code.cmd') : null,
  ];

  return firstExistingPath(candidates) || 'code';
}

async function listFilesRecursive(rootDir) {
  const results = [];
  const stack = [rootDir];

  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;

      if (EXTS) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!EXTS.has(ext)) continue;
      }

      results.push(fullPath);
    }
  }

  results.sort((a, b) => a.localeCompare(b));
  return results;
}

function openFileInVSCode(codeCmd, filePath) {
  return new Promise((resolve) => {
    // Using exec mirrors your working script style and tends to play nicer with VS Code on Windows.
    // -r reuses the current window.
    const cmd = `"${codeCmd}" -r "${filePath}"`;
    exec(cmd, { windowsHide: true }, (error) => {
      if (error) {
        console.error('[openall] Error opening:', filePath, error.message || String(error));
      }
      resolve();
    });
  });
}

(async () => {
  const codeCmd = resolveVsCodeCliCommand();
  console.log(`[openall] root: ${PROJECT_ROOT}`);
  console.log(`[openall] delay: ${DELAY}ms`);
  console.log(`[openall] skipping dirs: ${Array.from(SKIP_DIRS).join(', ')}`);
  console.log(`[openall] code cmd: ${codeCmd}`);
  if (EXTS) console.log(`[openall] exts: ${Array.from(EXTS).join(', ')}`);

  const files = await listFilesRecursive(PROJECT_ROOT);
  console.log(`[openall] files: ${files.length}`);

  if (!files.length) {
    console.log('[openall] No files found.');
    process.exit(0);
  }

  if (DRY_RUN) {
    files.forEach((f) => console.log(f));
    process.exit(0);
  }

  for (let i = 0; i < files.length; i += 1) {
    const f = files[i];
    console.log(`[openall] (${i + 1}/${files.length}) ${path.relative(PROJECT_ROOT, f)}`);
    // eslint-disable-next-line no-await-in-loop
    await openFileInVSCode(codeCmd, f);
    // eslint-disable-next-line no-await-in-loop
    await sleep(DELAY);
  }

  console.log('[openall] done');
})();
