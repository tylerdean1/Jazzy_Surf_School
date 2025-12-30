'use client';

import { useEffect, useMemo, useState } from 'react';
import supabaseClient from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

type PageSectionRow = Database['public']['Functions']['rpc_get_page_sections']['Returns'][number];

type Result = {
    pageKey: string;
    sections: PageSectionRow[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

const cache = new Map<string, PageSectionRow[]>();
const inflight = new Map<string, Promise<PageSectionRow[]>>();

async function fetchSections(pageKey: string): Promise<PageSectionRow[]> {
    const key = String(pageKey || '').trim();
    if (!key) return [];

    const cached = cache.get(key);
    if (cached) return cached;

    const existing = inflight.get(key);
    if (existing) return existing;

    const p = (async () => {
        const { data, error } = await supabaseClient.rpc('rpc_get_page_sections', {
            p_page_key: key,
            p_include_drafts: false,
        });

        if (error) {
            const empty: PageSectionRow[] = [];
            cache.set(key, empty);
            return empty;
        }

        const rows = (data || []) as PageSectionRow[];
        cache.set(key, rows);
        return rows;
    })();

    inflight.set(key, p);
    try {
        return await p;
    } finally {
        inflight.delete(key);
    }
}

export default function usePageSections(pageKey: string): Result {
    const key = String(pageKey || '').trim();

    const [sections, setSections] = useState<PageSectionRow[]>(() => cache.get(key) || []);
    const [loading, setLoading] = useState<boolean>(() => !cache.has(key));
    const [error, setError] = useState<string | null>(null);

    const refresh = useMemo(() => {
        return async () => {
            if (!key) {
                setSections([]);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // bust cache for a hard refresh
                cache.delete(key);
                const rows = await fetchSections(key);
                setSections(rows);
            } catch (e: any) {
                setSections([]);
                setError(e?.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
    }, [key]);

    useEffect(() => {
        let cancelled = false;
        if (!key) {
            setSections([]);
            setLoading(false);
            setError(null);
            return;
        }

        // If cached, avoid a network fetch.
        if (cache.has(key)) {
            setSections(cache.get(key) || []);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        (async () => {
            try {
                const rows = await fetchSections(key);
                if (cancelled) return;
                setSections(rows);
                setLoading(false);
            } catch (e: any) {
                if (cancelled) return;
                setSections([]);
                setError(e?.message || 'Failed to load');
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [key]);

    return {
        pageKey: key,
        sections,
        loading,
        error,
        refresh,
    };
}
