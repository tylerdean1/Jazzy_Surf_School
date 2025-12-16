// eslint-disable-next-line
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
import type { Database } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!url || !serviceKey) {
    // it's fine in dev if env vars are not present at module-eval time
}

export const supabaseAdmin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false }
});

export default supabaseAdmin;
