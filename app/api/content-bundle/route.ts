import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import supabaseClient from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Locale = 'en' | 'es';

type CmsRow = Pick<
    Database['public']['Tables']['cms_page_content']['Row'],
    'page_key' | 'body_en' | 'body_es_published' | 'approved' | 'category' | 'updated_at'
>;

type MediaRow = Database['public']['Functions']['get_public_media_assets_by_prefix']['Returns'][number];

function isNonEmpty(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function normalizeLocale(raw: string | null): Locale {
    return raw === 'es' ? 'es' : 'en';
}

function normalizePrefix(raw: string | null): string {
    const p = String(raw || '').trim();
    if (!p) return '';
    if (p.length > 128) throw new Error('prefix too long');
    if (!/^[a-z0-9._-]+$/i.test(p)) throw new Error('invalid prefix');
    return p;
}

function resolveCmsValue(row: CmsRow, locale: Locale): string | null {
    if (locale === 'es') {
        if (row.approved && isNonEmpty(row.body_es_published)) return row.body_es_published;
        if (isNonEmpty(row.body_en)) return row.body_en;
        return null;
    }

    return isNonEmpty(row.body_en) ? row.body_en : null;
}

function publicUrl(bucket: string, path: string): string {
    try {
        return supabaseClient.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    } catch {
        return '';
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const locale = normalizeLocale(url.searchParams.get('locale'));
        const prefix = normalizePrefix(url.searchParams.get('prefix'));

        if (!prefix) {
            return NextResponse.json({ ok: false, message: 'Missing prefix' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // 1) Batch CMS strings by prefix (DB-first).
        // Note: inline editor keys (e.g. `home.hero.title`) may not set `category`,
        // so we cannot safely filter by category here.
        const { data: cmsRowsRaw, error: cmsErr } = await supabase
            .from('cms_page_content')
            .select('page_key,body_en,body_es_published,approved,category,updated_at')
            .like('page_key', `${prefix}%`)
            .order('sort', { ascending: true });

        if (cmsErr) {
            return NextResponse.json({ ok: false, message: cmsErr.message }, { status: 500 });
        }

        const cmsRows = (cmsRowsRaw ?? []) as unknown as CmsRow[];
        const strings: Record<string, string> = {};
        const updatedAtByKey: Record<string, string> = {};

        for (const row of cmsRows) {
            const value = resolveCmsValue(row, locale);
            if (!value) continue;
            strings[row.page_key] = value;
            if (row.updated_at) updatedAtByKey[row.page_key] = row.updated_at;
        }

        // 2) Deterministic public media by slot_key prefix.
        const { data: mediaData, error: mediaErr } = await supabase.rpc('get_public_media_assets_by_prefix', {
            p_prefix: prefix,
        });

        if (mediaErr) {
            return NextResponse.json({ ok: false, message: mediaErr.message }, { status: 500 });
        }

        const mediaRows = (mediaData ?? []) as unknown as MediaRow[];
        const media = mediaRows
            .map((m) => {
                const url = m.public ? publicUrl(m.bucket, m.path) : '';
                return {
                    slot_key: m.slot_key,
                    sort: m.sort,
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    bucket: m.bucket,
                    path: m.path,
                    public: m.public,
                    asset_type: m.asset_type,
                    category: m.category,
                    created_at: m.created_at,
                    updated_at: m.updated_at,
                    url,
                };
            })
            .filter((m) => m.public && !!m.url);

        return NextResponse.json({ ok: true, locale, prefix, strings, updatedAtByKey, media });
    } catch (e: any) {
        return NextResponse.json({ ok: false, message: e?.message || 'Failed' }, { status: 500 });
    }
}
