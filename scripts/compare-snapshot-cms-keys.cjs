/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const snapshotPath = path.join(root, 'backend.snapshot.sql');
const seedPath = path.join(root, 'supabase', 'migrations', '20251224_seed_cms_all_strings.sql');

const snapshot = fs.readFileSync(snapshotPath, 'utf8');
const seed = fs.readFileSync(seedPath, 'utf8');

// Extract seeded keys from the seed SQL (all INSERT value tuples start with ('page_key', ...)
const seeded = new Set();
for (const m of seed.matchAll(/\(\s*'([^']+)'\s*,/g)) {
    seeded.add(m[1]);
}

// Extract keys from the snapshot COPY data block for cms_page_content
const snapshotKeys = new Set();
const copyHeader = 'COPY public.cms_page_content';
const startIdx = snapshot.indexOf(copyHeader);
if (startIdx === -1) {
    throw new Error('Could not find COPY public.cms_page_content in backend.snapshot.sql');
}

const fromStdinIdx = snapshot.indexOf('FROM stdin;', startIdx);
if (fromStdinIdx === -1) {
    throw new Error('Could not find FROM stdin; after COPY public.cms_page_content');
}

const dataStart = snapshot.indexOf('\n', fromStdinIdx);
if (dataStart === -1) {
    throw new Error('Could not locate start of cms_page_content COPY data');
}

// Find the terminator line "\\." with either \n or \r\n
const terminatorRe = /\r?\n\\\.\r?\n/g;
terminatorRe.lastIndex = dataStart;
const termMatch = terminatorRe.exec(snapshot);
const dataEnd = termMatch ? termMatch.index : -1;

if (dataEnd === -1) {
    throw new Error('Could not locate cms_page_content COPY data boundaries');
}

const data = snapshot.slice(dataStart + 1, dataEnd);
for (const line of data.split(/\r?\n/g)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    // Columns: id, created_at, updated_at, created_by, updated_by, page_key, ...
    const pageKey = cols[5];
    if (pageKey) snapshotKeys.add(pageKey);
}

const missingFromSeed = [...snapshotKeys].filter((k) => !seeded.has(k)).sort();
const seededNotInSnapshot = [...seeded].filter((k) => !snapshotKeys.has(k)).sort();

console.log(JSON.stringify({
    snapshotKeyCount: snapshotKeys.size,
    seededKeyCount: seeded.size,
    snapshotMissingFromSeedCount: missingFromSeed.length,
    snapshotMissingFromSeed: missingFromSeed,
    seededNotInSnapshotCount: seededNotInSnapshot.length,
    // seededNotInSnapshot can be useful but noisy; cap to first 50
    seededNotInSnapshotSample: seededNotInSnapshot.slice(0, 50),
}, null, 2));
