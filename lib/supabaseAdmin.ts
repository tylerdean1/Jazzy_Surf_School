import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

type SupabaseAdminDatabaseClient = ReturnType<typeof createClient>;

let supabaseAdminClient: SupabaseAdminDatabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseAdminDatabaseClient {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Supabase admin client is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.'
      );
    }

    supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey);
  }

  return supabaseAdminClient;
}

export default getSupabaseAdminClient;
