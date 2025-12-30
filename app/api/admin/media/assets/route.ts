import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';
import { requireAdminApi } from '@/lib/adminAuth';
import { normalizeGalleryImagesSlotKey } from '@/lib/mediaSlots';

type MediaAssetRow = Database['public']['Tables']['media_assets']['Row'];
type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert'];

type MediaAssetWithKey = MediaAssetRow & { asset_key: string | null };

export async function GET(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('public', { ascending: false })
        .order('category', { ascending: true })
        .order('sort', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const assets = (data ?? []) as MediaAssetRow[];
    const ids = assets.map((a) => a.id).filter(Boolean);

    let slotMap = new Map<string, string[]>();
    if (ids.length) {
        const { data: slots, error: slotsErr } = await supabase
            .from('media_slots')
            .select('slot_key,asset_id')
            .in('asset_id', ids);

        if (slotsErr) {
            return NextResponse.json({ ok: false, message: slotsErr.message }, { status: 500 });
        }

        for (const s of slots ?? []) {
            const assetId = s.asset_id;
            if (!assetId) continue;
            const list = slotMap.get(assetId) ?? [];
            list.push(s.slot_key);
            slotMap.set(assetId, list);
        }
    }

    const items: MediaAssetWithKey[] = assets.map((a) => {
        const keys = slotMap.get(a.id) ?? [];
        keys.sort();
        return { ...a, asset_key: keys.length ? keys[0] : null };
    });

    return NextResponse.json({ ok: true, items });
}

type PostBody =
    | {
        op: 'upsert';
        asset: {
            asset_key?: string | null;
            id?: string;
            title: string;
            description?: string | null;
            public: boolean;
            bucket: string;
            path: string;
            category: Database['public']['Enums']['photo_category'];
            asset_type: Database['public']['Enums']['asset_type'];
            sort?: number;
            session_id?: string | null;
        };
    };

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let body: PostBody;
    try {
        body = (await req.json()) as PostBody;
    } catch {
        return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 });
    }

    if (!body || body.op !== 'upsert') {
        return NextResponse.json({ ok: false, message: 'Invalid op' }, { status: 400 });
    }

    const a = body.asset as any;

    const title = String(a?.title ?? '').trim();
    const bucket = String(a?.bucket ?? '').trim();
    const path = String(a?.path ?? '').trim();

    if (!title) return NextResponse.json({ ok: false, message: 'Missing title' }, { status: 400 });
    if (!bucket) return NextResponse.json({ ok: false, message: 'Missing bucket' }, { status: 400 });
    if (!path) return NextResponse.json({ ok: false, message: 'Missing path' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    const assetKeyRaw = a?.asset_key;
    const assetKeyUnnormalized = assetKeyRaw != null && String(assetKeyRaw).trim() ? String(assetKeyRaw).trim() : null;
    const assetKey = normalizeGalleryImagesSlotKey(assetKeyUnnormalized);
    const wantsClearAssetKey = assetKeyRaw === null;

    const insert: MediaAssetInsert = {
        id: a?.id ? String(a.id) : undefined,
        title,
        description: a?.description ?? null,
        public: Boolean(a?.public),
        bucket,
        path,
        category: a?.category,
        asset_type: a?.asset_type,
        sort: Number.isFinite(a?.sort) ? Number(a.sort) : 32767,
        session_id: a?.session_id ? String(a.session_id) : null,
    };

    const { data, error } = await supabase
        .from('media_assets')
        .upsert(insert, { onConflict: 'bucket,path' })
        .select('*')
        .maybeSingle();

    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const saved = data as MediaAssetRow | null;
    if (saved?.id) {
        if (wantsClearAssetKey) {
            const { error: delErr } = await supabase.from('media_slots').delete().eq('asset_id', saved.id);
            if (delErr) {
                return NextResponse.json({ ok: false, message: delErr.message }, { status: 500 });
            }
        } else if (assetKey) {
            const { error: slotErr } = await supabase
                .from('media_slots')
                .upsert({ slot_key: assetKey, asset_id: saved.id, sort: insert.sort }, { onConflict: 'slot_key' });
            if (slotErr) {
                return NextResponse.json({ ok: false, message: slotErr.message }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ ok: true, item: saved ? ({ ...saved, asset_key: assetKey } as MediaAssetWithKey) : null });
}
