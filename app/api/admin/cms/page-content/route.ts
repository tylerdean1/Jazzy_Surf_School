import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Database } from '@/lib/database.types';
import { requireAdminApi } from '@/lib/adminAuth';

export async function GET(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    const url = new URL(req.url);
    const pageKey = String(url.searchParams.get('page_key') || '').trim();
    const category = String(url.searchParams.get('category') || '').trim();
    const pageKeyLike = String(url.searchParams.get('page_key_like') || '').trim();
    const limitRaw = String(url.searchParams.get('limit') || '').trim();

    if (!pageKey && !category) {
        return NextResponse.json({ ok: false, message: 'Missing page_key or category' }, { status: 400 });
    }

    // List-mode safety: require a constrained filter + a bounded limit so this endpoint
    // cannot be used to crawl all CMS keys.
    const MAX_LIMIT = 2000;
    const DEFAULT_LIMIT = 500;
    let limit = DEFAULT_LIMIT;
    if (limitRaw) {
        const n = Number(limitRaw);
        if (!Number.isFinite(n)) {
            return NextResponse.json({ ok: false, message: 'Invalid limit' }, { status: 400 });
        }
        limit = Math.floor(n);
    }
    if (limit < 1) {
        return NextResponse.json({ ok: false, message: 'limit must be >= 1' }, { status: 400 });
    }
    if (limit > MAX_LIMIT) {
        return NextResponse.json({ ok: false, message: `limit too large (max ${MAX_LIMIT})` }, { status: 400 });
    }

    if (!pageKey && category) {
        if (!pageKeyLike) {
            return NextResponse.json({ ok: false, message: 'Missing page_key_like' }, { status: 400 });
        }
        if (!pageKeyLike.startsWith('section.%')) {
            return NextResponse.json({ ok: false, message: "page_key_like must start with 'section.%'" }, { status: 400 });
        }
    }

    if (pageKeyLike && pageKeyLike.length > 256) {
        return NextResponse.json({ ok: false, message: 'page_key_like too long' }, { status: 400 });
    }
    if (pageKeyLike && !/^[a-z0-9._%:-]+$/i.test(pageKeyLike)) {
        return NextResponse.json({ ok: false, message: 'Invalid page_key_like' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (pageKey) {
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

    // List mode (admin-only): used by the Phase 3 page-sections wizard.
    // Allows discovering section meta rows by category + optional LIKE filter.
    let q = supabase
        .from('cms_page_content')
        .select('id,page_key,category,sort,body_en,body_es_draft,updated_at')
        .eq('category', category)
        .order('sort', { ascending: true })
        .order('page_key', { ascending: true })
        .limit(limit);

    if (pageKeyLike) {
        q = q.like('page_key', pageKeyLike);
    }

    const { data, error } = await q;
    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, items: data ?? [] });
}

type PostBody =
    | {
        op: 'save';
        page_key: string;
        body_en?: string | null;
        body_es_draft?: string | null;
        sort?: number | null;
        category?: string | null;
    }
    | {
        op: 'create_section';
        // Category used to group/order this section on a page/card (draft or real).
        category: string;
        // Optional explicit sort; if omitted we will append after the current max.
        sort?: number | null;
        // The section kind (e.g. hero, card, richText).
        kind: string;
        // Optional page/card association stored in meta JSON (not used by public rendering in Phase 2).
        owner?: { type: 'page' | 'card'; key: string } | null;
        // If provided, we will also upsert this key with body_en = sectionId.
        pointer_page_key?: string | null;
    }
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

    const op = (body as any)?.op;
    const pageKey = String((body as any)?.page_key || '').trim();
    if (op !== 'create_section' && !pageKey) {
        return NextResponse.json({ ok: false, message: 'Missing page_key' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (body.op === 'create_section') {
        const category = String((body as any)?.category || '').trim();
        const kind = String((body as any)?.kind || '').trim();
        if (!category) {
            return NextResponse.json({ ok: false, message: 'Missing category' }, { status: 400 });
        }
        if (!kind) {
            return NextResponse.json({ ok: false, message: 'Missing kind' }, { status: 400 });
        }

        // Backend-owned sectionId: we generate it server-side and also use it as the row id.
        const sectionId = crypto.randomUUID();
        const metaKey = `section.${sectionId}.meta`;

        const sortRaw = (body as any).sort;
        let sort: number | null = sortRaw == null ? null : Number(sortRaw);
        if (sort != null && !Number.isFinite(sort)) sort = null;

        if (sort == null) {
            const { data: maxRow, error: maxErr } = await supabase
                .from('cms_page_content')
                .select('sort')
                .eq('category', category)
                .order('sort', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (maxErr) {
                return NextResponse.json({ ok: false, message: maxErr.message }, { status: 500 });
            }

            const maxSort = Number.isFinite((maxRow as any)?.sort) ? Number((maxRow as any).sort) : 0;
            // Use 10-step spacing for easier inserts between.
            sort = Math.min(32767, maxSort + 10);
        }

        const owner = (body as any)?.owner;
        const metaJson = {
            version: 1,
            kind,
            owner: owner && (owner.type === 'page' || owner.type === 'card') ? { type: owner.type, key: String(owner.key || '') } : null,
        };

        const { data: metaRow, error: metaErr } = await supabase
            .from('cms_page_content')
            .insert({
                id: sectionId,
                page_key: metaKey,
                category,
                sort: Math.max(-32768, Math.min(32767, Math.floor(sort))),
                body_en: JSON.stringify(metaJson),
            } as any)
            .select('id,page_key,category,sort,body_en,body_es_draft,body_es_published,approved,updated_at')
            .maybeSingle();

        if (metaErr) {
            return NextResponse.json({ ok: false, message: metaErr.message }, { status: 500 });
        }

        const pointerKeyRaw = (body as any)?.pointer_page_key;
        const pointerKey = pointerKeyRaw != null && String(pointerKeyRaw).trim() ? String(pointerKeyRaw).trim() : null;
        if (pointerKey) {
            const { error: ptrErr } = await supabase
                .from('cms_page_content')
                .upsert({ page_key: pointerKey, body_en: sectionId } as any, { onConflict: 'page_key' });

            if (ptrErr) {
                return NextResponse.json({ ok: false, message: ptrErr.message }, { status: 500 });
            }
        }

        return NextResponse.json({ ok: true, sectionId, metaKey, row: metaRow ?? null });
    }

    if (body.op === 'save') {
        type CmsInsert = Database['public']['Tables']['cms_page_content']['Insert'];

        const sortRaw = (body as any).sort;
        const sortValue =
            sortRaw == null
                ? undefined
                : Number.isFinite(Number(sortRaw))
                    ? Math.max(-32768, Math.min(32767, Math.floor(Number(sortRaw))))
                    : undefined;

        const update: CmsInsert = {
            page_key: pageKey,
            body_en: 'body_en' in body ? body.body_en ?? null : undefined,
            body_es_draft: 'body_es_draft' in body ? body.body_es_draft ?? null : undefined,
            sort: 'sort' in body ? sortValue : undefined,
            category: 'category' in body ? body.category ?? null : undefined,
        };

        const { data, error } = await supabase
            .from('cms_page_content')
            .upsert(update, { onConflict: 'page_key' })
            .select('id,page_key,category,sort,body_en,body_es_draft,body_es_published,approved,updated_at')
            .maybeSingle();

        if (error) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, row: data ?? null });
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
        const { data, error } = await supabase
            .from('cms_page_content')
            .upsert(update, { onConflict: 'page_key' })
            .select('id,page_key,category,sort,body_en,body_es_draft,body_es_published,approved,updated_at')
            .maybeSingle();

        if (error) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, row: data ?? null });
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
