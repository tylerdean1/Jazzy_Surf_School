import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role for privileged operations
// DO NOT expose the service role key to the client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin client missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(supabaseUrl || '', serviceRoleKey || '');

export default supabaseAdmin;
