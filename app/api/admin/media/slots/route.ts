import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizePrefix(raw: string | null): string {
    const p = String(raw || '').trim();
    if (!p) return '';
    if (p.length > 128) throw new Error('prefix too long');
    if (!/^[a-z0-9._-]+$/i.test(p)) throw new Error('invalid prefix');
    return p;
}

type SlotItem = {
    slot_key: string;
    sort: number | null;
    asset_id: string | null;
    asset: {
        id: string;
        title: string;
        bucket: string;
        path: string;
        public: boolean;
        asset_type: Database['public']['Enums']['asset_type'];
        category: Database['public']['Enums']['photo_category'];
    } | null;
};

export async function GET(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    try {
        const url = new URL(req.url);
        const prefix = normalizePrefix(url.searchParams.get('prefix'));
        if (!prefix) {
            return NextResponse.json({ ok: false, message: 'Missing prefix' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('media_slots')
            .select('slot_key,sort,asset_id,media_assets(id,title,bucket,path,public,asset_type,category)')
            .like('slot_key', `${prefix}%`)
            .order('sort', { ascending: true })
            .order('slot_key', { ascending: true });

        if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

        const items: SlotItem[] = (data ?? []).map((r: any) => {
            const a = r.media_assets ?? null;
            return {
                slot_key: String(r.slot_key || ''),
                sort: r.sort ?? null,
                asset_id: r.asset_id ?? null,
                asset: a
                    ? {
                        id: String(a.id),
                        title: String(a.title || ''),
                        bucket: String(a.bucket || ''),
                        path: String(a.path || ''),
                        public: Boolean(a.public),
                        asset_type: a.asset_type,
                        category: a.category,
                    }
                    : null,
            };
        });

        return NextResponse.json({ ok: true, prefix, items });
    } catch (e: any) {
        return NextResponse.json({ ok: false, message: e?.message || 'Failed' }, { status: 500 });
    }
}

type PostBody =
    | {
        op: 'set';
        slot_key: string;
        asset_id: string | null;
        sort?: number | null;
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

    if (!body || body.op !== 'set') {
        return NextResponse.json({ ok: false, message: 'Invalid op' }, { status: 400 });
    }

    const slot_key = String((body as any).slot_key || '').trim();
    if (!slot_key) return NextResponse.json({ ok: false, message: 'Missing slot_key' }, { status: 400 });
    if (slot_key.length > 128) return NextResponse.json({ ok: false, message: 'slot_key too long' }, { status: 400 });

    const asset_id_raw = (body as any).asset_id;
    const asset_id = asset_id_raw == null ? null : String(asset_id_raw).trim();
    const sortRaw = (body as any).sort;
    const sort = sortRaw == null ? null : Number(sortRaw);

    const supabase = getSupabaseAdmin();

    if (!asset_id) {
        const { error } = await supabase.from('media_slots').delete().eq('slot_key', slot_key);
        if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }

    const { error } = await supabase
        .from('media_slots')
        .upsert(
            {
                slot_key,
                asset_id,
                sort: Number.isFinite(sort as any) ? (sort as number) : null,
            } as any,
            { onConflict: 'slot_key' }
        );

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
