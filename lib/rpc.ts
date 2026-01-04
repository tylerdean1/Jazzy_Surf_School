import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export async function rpc<T>(
    client: SupabaseClient<Database> | null,
    fn: string,
    args?: Record<string, any>
): Promise<T> {
    if (!client) throw new Error('Network error');

    const { data, error } = await (client as any).rpc(fn, args ?? {});
    if (error) throw new Error(error.message);
    return data as T;
}
