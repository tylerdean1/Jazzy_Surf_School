import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Intentionally untyped for now (frontend-only mode).
// We keep the Supabase client wiring here so it can be re-enabled later
// by re-introducing generated types.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
