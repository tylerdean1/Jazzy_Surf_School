import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';
import { requireAdminApi } from '@/lib/adminAuth';

export async function GET(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    const url = new URL(req.url);
    const pageKey = String(url.searchParams.get('page_key') || '').trim();
    if (!pageKey) {
        return NextResponse.json({ ok: false, message: 'Missing page_key' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('cms_page_content')
        .select('id,page_key,body_en,body_es_draft,body_es_published,approved,updated_at')
        .eq('page_key', pageKey)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, row: data ?? null });
}

type PostBody =
    | { op: 'save'; page_key: string; body_en?: string | null; body_es_draft?: string | null }
    | { op: 'publish_es'; page_key: string }
    | { op: 'delete'; page_key: string };

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let body: PostBody;
    try {
        body = (await req.json()) as PostBody;
    } catch {
        return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const pageKey = String((body as any)?.page_key || '').trim();
    if (!pageKey) {
        return NextResponse.json({ ok: false, message: 'Missing page_key' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (body.op === 'save') {
        type CmsInsert = Database['public']['Tables']['cms_page_content']['Insert'];
        const update: CmsInsert = {
            page_key: pageKey,
            body_en: 'body_en' in body ? body.body_en ?? null : undefined,
            body_es_draft: 'body_es_draft' in body ? body.body_es_draft ?? null : undefined,
        };

        const { error } = await supabase
            .from('cms_page_content')
            .upsert(update, { onConflict: 'page_key' });

        if (error) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    }

    if (body.op === 'publish_es') {
        // Copy draft -> published and mark approved.
        const { data: existing, error: readErr } = await supabase
            .from('cms_page_content')
            .select('body_es_draft')
            .eq('page_key', pageKey)
            .maybeSingle();

        if (readErr) {
            return NextResponse.json({ ok: false, message: readErr.message }, { status: 500 });
        }

        const draft = existing?.body_es_draft ?? null;
        type CmsInsert = Database['public']['Tables']['cms_page_content']['Insert'];
        const update: CmsInsert = { page_key: pageKey, body_es_published: draft, approved: true };
        const { error } = await supabase
            .from('cms_page_content')
            .upsert(update, { onConflict: 'page_key' });

        if (error) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    }

    if (body.op === 'delete') {
        const { error } = await supabase.from('cms_page_content').delete().eq('page_key', pageKey);

        if (error) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: 'Invalid op' }, { status: 400 });
}
