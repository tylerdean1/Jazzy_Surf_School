import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        // Public-safe, narrow read: Home sections meta rows only.
        const category = 'sections.page.home';
        const pageKeyLike = 'section.%.meta';

        const { data, error } = await supabase
            .from('cms_page_content')
            .select('page_key,body_en,sort,updated_at,category')
            .eq('category', category)
            .like('page_key', pageKeyLike)
            .order('sort', { ascending: true })
            .limit(200);

        if (error) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }

        const items = (data ?? []).map((r: any) => ({
            page_key: String(r.page_key || ''),
            body_en: r.body_en ?? null,
            sort: typeof r.sort === 'number' ? r.sort : null,
            updated_at: r.updated_at ?? null,
            category: r.category ?? null,
        }));

        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        return NextResponse.json({ ok: false, message: e?.message || 'Failed' }, { status: 500 });
    }
}
