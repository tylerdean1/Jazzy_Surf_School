import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';
import { requireAdminApi } from '@/lib/adminAuth';

type MediaAssetRow = Database['public']['Tables']['media_assets']['Row'];
type MediaAssetInsert = Database['public']['Tables']['media_assets']['Insert'];

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

    return NextResponse.json({ ok: true, items: (data ?? []) as MediaAssetRow[] });
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

    const insert: MediaAssetInsert = {
        id: a?.id ? String(a.id) : undefined,
        asset_key: a?.asset_key != null && String(a.asset_key).trim() ? String(a.asset_key).trim() : null,
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

    return NextResponse.json({ ok: true, item: data ?? null });
}
