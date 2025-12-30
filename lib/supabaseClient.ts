// Use `require` so Next resolves the package's `require` export (CJS),
// avoiding Next 13.5's ESM wrapper import rewrite issues.
// eslint-disable-next-line
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
import type { Database } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let cached: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
    if (cached) return cached;
    if (!url || !anonKey) return null;
    cached = createClient<Database>(url, anonKey);
    return cached;
}

export const supabaseClient = getSupabaseClient();

export default supabaseClient;
