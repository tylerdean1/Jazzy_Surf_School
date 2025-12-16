// Use `require` so Next resolves the package's `require` export (CJS),
// avoiding Next 13.5's ESM wrapper import rewrite issues.
// eslint-disable-next-line
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
import type { Database } from './database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
    // allow the file to be imported in environments where env isn't set yet
}

export const supabaseClient = createClient<Database>(url || '', anonKey || '');

export default supabaseClient;
