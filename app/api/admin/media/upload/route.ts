import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';
import { requireAdminApi } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_BUCKETS = new Set(['Private_Photos', 'Lesson_Photos']);

type PhotoCategory = Database['public']['Enums']['photo_category'];
type AssetType = Database['public']['Enums']['asset_type'];
type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert'];

function sanitizeFileName(name: string): string {
    // Remove any path parts and disallow separators.
    const justName = name.replace(/^.*[\\/]/, '');
    return justName.replace(/[\\/]/g, '').trim();
}

function splitBaseExt(fileName: string): { base: string; ext: string } {
    const idx = fileName.lastIndexOf('.');
    if (idx <= 0) return { base: fileName, ext: '' };
    return { base: fileName.slice(0, idx), ext: fileName.slice(idx) };
}

function normalizeFolder(folder: string): string {
    const f = String(folder || '').trim().replace(/\\/g, '/');
    const noLead = f.replace(/^\/+/, '');
    const noTrail = noLead.replace(/\/+$/, '');
    return noTrail;
}

function chooseUniqueName(existing: Set<string>, base: string, ext: string): string {
    const candidate = `${base}${ext}`;
    if (!existing.has(candidate)) return candidate;
    let n = 1;
    while (existing.has(`${base}(${n})${ext}`)) n++;
    return `${base}(${n})${ext}`;
}

async function listExistingNames(bucket: string, folder: string): Promise<Set<string>> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(bucket).list(folder || '', { limit: 1000 });
    if (error) throw new Error(error.message);
    return new Set((data ?? []).map((o) => o.name));
}

function parseBool(value: FormDataEntryValue | null, fallback: boolean): boolean {
    if (value == null) return fallback;
    const s = String(value).trim().toLowerCase();
    if (s === '1' || s === 'true' || s === 'yes' || s === 'on') return true;
    if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
    return fallback;
}

function parseIntOr(value: FormDataEntryValue | null, fallback: number): number {
    const n = parseInt(String(value ?? ''), 10);
    return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return NextResponse.json({ ok: false, message: 'Expected multipart/form-data' }, { status: 400 });
    }

    const bucket = String(form.get('bucket') || '').trim();
    const folder = normalizeFolder(String(form.get('folder') || ''));
    const mode = String(form.get('mode') || 'single').trim();

    if (!bucket) return NextResponse.json({ ok: false, message: 'Missing bucket' }, { status: 400 });
    if (!ALLOWED_BUCKETS.has(bucket)) {
        return NextResponse.json({ ok: false, message: `Invalid bucket. Use Private_Photos or Lesson_Photos.` }, { status: 400 });
    }

    const files = form.getAll('files').filter((f): f is File => f instanceof File);
    if (!files.length) return NextResponse.json({ ok: false, message: 'No files uploaded' }, { status: 400 });

    const isPublic = parseBool(form.get('public'), bucket === 'Lesson_Photos');
    const category = String(form.get('category') || 'uncategorized') as PhotoCategory;
    const assetType = String(form.get('asset_type') || 'photo') as AssetType;
    const description = String(form.get('description') || '').trim();
    const assetKey = String(form.get('asset_key') || '').trim();
    const assetKeyPrefix = String(form.get('asset_key_prefix') || '').trim();
    const sessionId = String(form.get('session_id') || '').trim();
    const sort = parseIntOr(form.get('sort'), 32767);

    if (mode !== 'single' && mode !== 'bulk') {
        return NextResponse.json({ ok: false, message: 'Invalid mode' }, { status: 400 });
    }

    const singleTitle = String(form.get('title') || '').trim();
    if (mode === 'single' && !singleTitle) {
        return NextResponse.json({ ok: false, message: 'Missing title (single upload)' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let existingNames: Set<string>;
    try {
        existingNames = await listExistingNames(bucket, folder);
    } catch (e: any) {
        return NextResponse.json({ ok: false, message: e?.message || 'Failed to list bucket' }, { status: 500 });
    }

    const uploaded: Array<{ bucket: string; path: string; id: string }> = [];

    let bulkKeyIndex = 1;
    const nextBulkAssetKey = () => {
        if (!assetKeyPrefix) return null;
        const key = `${assetKeyPrefix}.${String(bulkKeyIndex).padStart(3, '0')}`;
        bulkKeyIndex += 1;
        return key;
    };

    for (const file of files) {
        const safeName = sanitizeFileName(file.name || 'file');
        const { base, ext } = splitBaseExt(safeName);
        const uniqueName = chooseUniqueName(existingNames, base || 'file', ext);
        existingNames.add(uniqueName);

        const path = folder ? `${folder}/${uniqueName}` : uniqueName;
        const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now());

        const { error: uploadErr } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: false, contentType: file.type || undefined });

        if (uploadErr) {
            return NextResponse.json({ ok: false, message: uploadErr.message }, { status: 500 });
        }

        uploaded.push({ bucket, path, id });

        const derivedTitle = mode === 'single' ? singleTitle : `${safeName} (${id})`;
        const derivedAssetKey = mode === 'single' ? (assetKey || null) : nextBulkAssetKey();

        const row: MediaAssetInsert = {
            id,
            bucket,
            path,
            title: derivedTitle,
            public: isPublic,
            category,
            asset_type: assetType,
            description: description || null,
            session_id: sessionId ? sessionId : null,
            sort,
        };

        const { error: insertErr } = await supabase.from('media_assets').insert(row);
        if (insertErr) {
            // Best-effort cleanup.
            await supabase.storage.from(bucket).remove([path]);
            return NextResponse.json({ ok: false, message: insertErr.message }, { status: 500 });
        }

        if (derivedAssetKey) {
            const { error: slotErr } = await supabase
                .from('media_slots')
                .upsert({ slot_key: derivedAssetKey, asset_id: id, sort }, { onConflict: 'slot_key' });
            if (slotErr) {
                await supabase.storage.from(bucket).remove([path]);
                await supabase.from('media_assets').delete().eq('id', id);
                return NextResponse.json({ ok: false, message: slotErr.message }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ ok: true, uploaded });
}
