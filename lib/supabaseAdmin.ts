// eslint-disable-next-line
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
import type { Database } from './database.types';

export type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

let cached: SupabaseAdminClient | null = null;

export function getSupabaseAdmin(): SupabaseAdminClient {
    if (cached) return cached;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

    if (!url || !serviceKey) {
        throw new Error(
            'Missing Supabase service credentials. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.'
        );
    }

    cached = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });
    return cached;
}

// Back-compat default export.
export default getSupabaseAdmin;
