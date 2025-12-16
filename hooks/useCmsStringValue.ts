'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import useCmsPageBody from '@/hooks/useCmsPageBody';
import { useAdminEdit } from '@/components/admin/edit/AdminEditContext';

type AdminRow = {
    body_en: string | null;
    body_es_draft: string | null;
};

function isNonEmpty(value: string | null | undefined) {
    return !!value && value.trim().length > 0;
}

async function fetchAdminRow(pageKey: string): Promise<AdminRow | null> {
    const res = await fetch(`/api/admin/cms/page-content?page_key=${encodeURIComponent(pageKey)}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) return null;
    const row = body?.row as any;
    if (!row) return null;
    return { body_en: row.body_en ?? null, body_es_draft: row.body_es_draft ?? null };
}

export function useCmsStringValue(pageKey: string, fallback: string) {
    const locale = useLocale();
    const { enabled } = useAdminEdit();

    // Public: reads published ES (if approved) or EN via security-definer RPC.
    const publicCms = useCmsPageBody(pageKey, locale);
    const publicValue = useMemo(() => {
        const v = publicCms.body;
        return isNonEmpty(v) ? (v as string) : fallback;
    }, [publicCms.body, fallback]);

    const [adminValue, setAdminValue] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!enabled) {
            setAdminValue(null);
            return;
        }

        (async () => {
            const row = await fetchAdminRow(pageKey);
            if (cancelled) return;
            const v = locale === 'es' ? row?.body_es_draft : row?.body_en;
            setAdminValue(isNonEmpty(v) ? (v as string) : null);
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled, pageKey, locale]);

    const value = enabled ? (adminValue ?? fallback) : publicValue;

    return {
        value,
        loading: enabled ? adminValue === null && false : publicCms.loading,
        error: enabled ? null : publicCms.error,
    };
}

export async function saveCmsStringValue(pageKey: string, locale: string, nextValue: string) {
    const payload: any = { op: 'save', page_key: pageKey };
    if (locale === 'es') payload.body_es_draft = nextValue;
    else payload.body_en = nextValue;

    const res = await fetch('/api/admin/cms/page-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) {
        throw new Error(body?.message || `Save failed (${res.status})`);
    }
}

export async function publishCmsSpanish(pageKey: string) {
    const res = await fetch('/api/admin/cms/page-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'publish_es', page_key: pageKey }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) {
        throw new Error(body?.message || `Publish failed (${res.status})`);
    }
}
