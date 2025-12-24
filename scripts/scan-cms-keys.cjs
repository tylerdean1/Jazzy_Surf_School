/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const exts = new Set(['.ts', '.tsx']);
const scanDirs = ['app', 'components', 'hooks', 'lib'];

function walk(dir, out) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p, out);
        else if (exts.has(path.extname(ent.name))) out.push(p);
    }
}

function addKey(set, k) {
    if (!k) return;
    set.add(k);
}

function normalizePrefix(prefixRaw) {
    if (!prefixRaw) return '';
    return prefixRaw.endsWith('.') ? prefixRaw : `${prefixRaw}.`;
}

const files = [];
for (const d of scanDirs) walk(path.join(root, d), files);

const used = new Set();
for (const file of files) {
    const s = fs.readFileSync(file, 'utf8');

    // Direct full keys
    for (const m of s.matchAll(/useCmsStringValue\(\s*['"]([^'"]+)['"]/g)) addKey(used, m[1]);
    for (const m of s.matchAll(/useCmsPageBody\(\s*['"]([^'"]+)['"]/g)) addKey(used, m[1]);

    // Map variable -> prefix for useContentBundle
    const varPrefix = new Map();
    for (const m of s.matchAll(/const\s+(\w+)\s*=\s*useContentBundle\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        varPrefix.set(m[1], m[2]);
    }

    // Map function name -> prefix when destructuring t
    const funcPrefix = new Map();
    for (const m of s.matchAll(
        /const\s*\{[^}]*\bt\s*:\s*(\w+)[^}]*\}\s*=\s*useContentBundle\(\s*['"]([^'"]+)['"]\s*\)/g
    )) {
        funcPrefix.set(m[1], m[2]);
    }
    for (const m of s.matchAll(
        /const\s*\{[^}]*\bt\b[^}]*\}\s*=\s*useContentBundle\(\s*['"]([^'"]+)['"]\s*\)/g
    )) {
        if (!funcPrefix.has('t')) funcPrefix.set('t', m[1]);
    }

    for (const [v, prefixRaw] of varPrefix) {
        const prefix = normalizePrefix(prefixRaw);
        const re = new RegExp(`\\b${v}\\.t\\(\\s*['\"]([^'\"]+)['\"]`, 'g');
        for (const mm of s.matchAll(re)) {
            const key = mm[1];
            addKey(used, key.includes('.') ? key : prefix + key);
        }
    }

    for (const [fn, prefixRaw] of funcPrefix) {
        const prefix = normalizePrefix(prefixRaw);
        const re = new RegExp(`\\b${fn}\\(\\s*['\"]([^'\"]+)['\"]`, 'g');
        for (const mm of s.matchAll(re)) {
            const key = mm[1];
            addKey(used, key.includes('.') ? key : prefix + key);
        }
    }
}

const seedPath = path.join(root, 'supabase', 'migrations', '20251224_seed_cms_all_strings.sql');
const seed = fs.readFileSync(seedPath, 'utf8');
const seeded = new Set();

for (const m of seed.matchAll(/\(\s*'([^']+)'\s*,/g)) seeded.add(m[1]);

const missing = [...used].filter((k) => !seeded.has(k)).sort();

console.log(JSON.stringify({
    scannedFiles: files.length,
    usedKeys: used.size,
    seededKeys: seeded.size,
    missingCount: missing.length,
    missing,
}, null, 2));
