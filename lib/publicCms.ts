// eslint-disable-next-line
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
import type { Database } from './database.types';

export async function getPublicCmsString(pageKey: string, locale: string, fallback: string): Promise<string> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !anonKey) return fallback;

    const supabase = createClient<Database>(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.rpc('get_page_content', {
        p_page_key: pageKey,
        p_locale: locale,
    });

    if (error) return fallback;
    const rows = (data ?? []) as Database['public']['Functions']['get_page_content']['Returns'];
    const first = rows.length ? rows[0] : null;
    const body = typeof first?.body === 'string' ? first.body : '';
    return body && body.trim().length ? body : fallback;
}
