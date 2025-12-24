/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const snapshotPath = path.join(root, 'backend.snapshot.sql');

const wanted = new Set([
    'booking.customerInfo',
    'booking.email',
    'booking.lessonType',
    'booking.name',
    'booking.partySize',
    'booking.phone',
    'booking.proceedToPayment',
    'booking.selectDate',
    'booking.selectTime',
    'booking.totalPrice',
    'contact.followUs',
    'contact.location',
    'contact.subtitle',
    'contact.title',
    'home.bookNow',
    'home.galleryDescription',
    'home.galleryTitle',
    'home.heroSubtitle',
    'home.heroTitle',
    'home.learnMore',
    'home.lessonsDescription',
    'home.lessonsTitle',
    'home.teamDescription',
    'home.teamTitle',
    'navigation.about',
    'navigation.contact',
    'navigation.faq',
    'navigation.gallery',
    'navigation.home',
    'navigation.lessons',
    'navigation.schedule',
]);

function sqlEscape(s) {
    return String(s ?? '').replace(/'/g, "''");
}

const snapshot = fs.readFileSync(snapshotPath, 'utf8');
const copyHeader = 'COPY public.cms_page_content';
const startIdx = snapshot.indexOf(copyHeader);
if (startIdx === -1) throw new Error('COPY public.cms_page_content not found');
const fromStdinIdx = snapshot.indexOf('FROM stdin;', startIdx);
if (fromStdinIdx === -1) throw new Error('FROM stdin; not found');
const dataStart = snapshot.indexOf('\n', fromStdinIdx);
if (dataStart === -1) throw new Error('dataStart not found');

const terminatorRe = /\r?\n\\\.\r?\n/g;
terminatorRe.lastIndex = dataStart;
const termMatch = terminatorRe.exec(snapshot);
const dataEnd = termMatch ? termMatch.index : -1;
if (dataEnd === -1) throw new Error('terminator not found');

const data = snapshot.slice(dataStart + 1, dataEnd);

const tuples = [];
for (const line of data.split(/\r?\n/g)) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const page_key = cols[5];
    if (!wanted.has(page_key)) continue;

    // columns: id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category
    const body_en = cols[6] === '\\N' ? null : cols[6];
    const body_es_draft = cols[7] === '\\N' ? null : cols[7];
    const body_es_published = cols[8] === '\\N' ? null : cols[8];
    const approved = cols[9] === 't' ? 'true' : 'false';
    const sort = cols[10];
    const category = cols[11] === '\\N' ? null : cols[11];

    tuples.push({ page_key, body_en, body_es_draft, body_es_published, approved, sort, category });
}

// stable output order
for (const t of tuples.sort((a, b) => a.page_key.localeCompare(b.page_key))) {
    console.log(
        `  ('${sqlEscape(t.page_key)}', '${sqlEscape(t.body_en)}', '${sqlEscape(t.body_es_draft)}', '${sqlEscape(t.body_es_published)}', ${t.approved}, ${t.sort}, '${sqlEscape(t.category)}'),`
    );
}
