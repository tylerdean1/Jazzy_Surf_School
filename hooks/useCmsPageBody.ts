'use client';

import { useEffect, useState } from 'react';
import supabaseClient from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';

type Result = {
    body: string | null;
    locale: string | null;
    updatedAt: string | null;
    loading: boolean;
    error: string | null;
};

export default function useCmsPageBody(pageKey: string, locale: string): Result {
    const [body, setBody] = useState<string | null>(null);
    const [effectiveLocale, setEffectiveLocale] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            setBody(null);
            setEffectiveLocale(null);
            setUpdatedAt(null);

            const { data, error } = await supabaseClient.rpc('get_page_content', {
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
    }, [pageKey, locale]);

    return { body, locale: effectiveLocale, updatedAt, loading, error };
}
