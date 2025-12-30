'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';

type Result = {
    body: string | null;
    locale: string | null;
    updatedAt: string | null;
    loading: boolean;
    error: string | null;
};

export default function useCmsPageBody(pageKey: string, locale: string, enabled: boolean = true): Result {
    const [body, setBody] = useState<string | null>(null);
    const [effectiveLocale, setEffectiveLocale] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (!enabled) {
            setLoading(false);
            setError(null);
            setBody(null);
            setEffectiveLocale(null);
            setUpdatedAt(null);
            return () => {
                cancelled = true;
            };
        }

        (async () => {
            setLoading(true);
            setError(null);
            setBody(null);
            setEffectiveLocale(null);
            setUpdatedAt(null);

            const supabase = getSupabaseClient();
            if (!supabase) {
                setError('Supabase client unavailable');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.rpc('get_page_content', {
                p_page_key: pageKey,
                p_locale: locale,
            });

            if (cancelled) return;

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            const rows = (data ?? []) as Database['public']['Functions']['get_page_content']['Returns'];
            const first = rows.length ? rows[0] : null;
            setBody(first?.body ?? null);
            setEffectiveLocale(first?.locale ?? null);
            setUpdatedAt(first?.updated_at ?? null);
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled, pageKey, locale]);

    return { body, locale: effectiveLocale, updatedAt, loading, error };
}
