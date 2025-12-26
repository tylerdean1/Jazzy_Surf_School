import { NextResponse } from 'next/server';

// Use `require` so Next resolves the package's `require` export (CJS),
// avoiding Next 13.5's ESM wrapper import rewrite issues.
// eslint-disable-next-line
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

        if (!url || !anonKey) {
            return NextResponse.json({ ok: false, items: [] }, { status: 500 });
        }

        // Anon key + RLS-safe client (no service role).
        const supabase = createClient(url, anonKey);

        // Public-safe, narrow read: Home sections meta rows only.
        const category = 'sections.page.home';
        const pageKeyLike = 'section.%.meta';

        const { data, error } = await supabase
            .from('cms_page_content')
            .select('page_key,body_en,sort')
            .eq('category', category)
            .like('page_key', pageKeyLike)
            .order('sort', { ascending: true })
            .order('page_key', { ascending: true })
            .limit(200);

        if (error) {
            return NextResponse.json({ ok: false, items: [] }, { status: 500 });
        }

        const items = (data ?? []).map((r: any) => ({
            page_key: String(r.page_key || ''),
            body_en: r.body_en ?? null,
            sort: typeof r.sort === 'number' ? r.sort : null,
        }));

        return NextResponse.json({ ok: true, items });
    } catch (e: any) {
        return NextResponse.json({ ok: false, items: [] }, { status: 500 });
    }
}
