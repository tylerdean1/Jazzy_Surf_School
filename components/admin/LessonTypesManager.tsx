'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import type { Database } from '@/lib/database.types';
import useContentBundle from '@/hooks/useContentBundle';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { rpc } from '@/lib/rpc';

type LessonTypeRow = Database['public']['Tables']['lesson_types']['Row'];

type Draft = {
    display_name: string;
    description: string;
    price_usd: string;
};

function formatUsdFromCents(cents: number): string {
    const dollars = cents / 100;
    if (!Number.isFinite(dollars)) return '0.00';
    return dollars.toFixed(2);
}

function parseUsdToCents(value: string): number | null {
    const raw = String(value || '').trim();
    if (!raw) return 0;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.round(n * 100));
}

export default function LessonTypesManager() {
    const admin = useContentBundle('admin.');
    const [items, setItems] = useState<LessonTypeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyKey, setBusyKey] = useState<string | null>(null);

    const [editingKeys, setEditingKeys] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = getSupabaseClient();
            const data = await rpc<LessonTypeRow[]>(supabase, 'admin_list_lesson_types');
            setItems((data || []) as LessonTypeRow[]);
        } catch (e: any) {
            setError(e?.message || admin.t('admin.lessonTypes.errors.loadFailed', 'Failed to load lesson types'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const startEdit = (row: LessonTypeRow) => {
        const key = String(row.key);
        setEditingKeys((m) => ({ ...m, [key]: true }));
        setDrafts((d) => ({
            ...d,
            [key]: {
                display_name: String(row.display_name || ''),
                description: String(row.description || ''),
                price_usd: formatUsdFromCents(Number(row.price_per_person_cents || 0)),
            },
        }));
    };

    const cancelEdit = (key: string) => {
        setEditingKeys((m) => ({ ...m, [key]: false }));
        setDrafts((d) => {
            const next = { ...d };
            delete next[key];
            return next;
        });
    };

    const updateDraft = (key: string, patch: Partial<Draft>) => {
        setDrafts((d) => ({
            ...d,
            [key]: { ...d[key], ...patch },
        }));
    };

    const save = async (key: string) => {
        const draft = drafts[key];
        if (!draft) return;

        const displayName = String(draft.display_name || '').trim();
        if (!displayName) {
            setError(admin.t('admin.lessonTypes.errors.missingName', 'Display name is required'));
            return;
        }

        const cents = parseUsdToCents(draft.price_usd);
        if (cents == null) {
            setError(admin.t('admin.lessonTypes.errors.badPrice', 'Price must be a number'));
            return;
        }

        setBusyKey(key);
        setError(null);
        try {
            const supabase = getSupabaseClient();
            const updated = await rpc<LessonTypeRow>(supabase, 'admin_update_lesson_type', {
                p_key: key,
                p_display_name: displayName,
                p_description: String(draft.description || ''),
                p_price_per_person_cents: cents,
            });
            setItems((prev) => prev.map((r) => (r.key === key ? updated : r)));
            cancelEdit(key);
        } catch (e: any) {
            setError(e?.message || admin.t('admin.lessonTypes.errors.saveFailed', 'Failed to save'));
        } finally {
            setBusyKey(null);
        }
    };

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    }, [items]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <CircularProgress size={22} />
                <Typography>{admin.t('admin.common.loading', 'Loading…')}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">
                    {admin.t('admin.lessonTypes.title', 'Lesson Types')}
                </Typography>
                <Button variant="outlined" onClick={() => void refresh()}>
                    {admin.t('admin.common.refresh', 'Refresh')}
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {admin.t(
                    'admin.lessonTypes.hint',
                    'Edit the display name, description, and price used across booking and lessons.'
                )}
            </Typography>

            {error ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : null}

            <Stack spacing={2} sx={{ mt: 3 }}>
                {sorted.map((row) => {
                    const key = String(row.key);
                    const isEditing = !!editingKeys[key];
                    const draft = drafts[key];
                    const disabled = busyKey != null && busyKey !== key;
                    const busy = busyKey === key;

                    return (
                        <Box key={key} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {row.display_name} <Typography component="span" color="text.secondary">({key})</Typography>
                                </Typography>
                                {!isEditing ? (
                                    <Button size="small" variant="outlined" onClick={() => startEdit(row)} disabled={disabled}>
                                        {admin.t('admin.common.edit', 'Edit')}
                                    </Button>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" variant="contained" onClick={() => void save(key)} disabled={busy}>
                                            {busy ? admin.t('admin.common.saving', 'Saving…') : admin.t('admin.common.save', 'Save')}
                                        </Button>
                                        <Button size="small" variant="outlined" onClick={() => cancelEdit(key)} disabled={busy}>
                                            {admin.t('admin.common.cancel', 'Cancel')}
                                        </Button>
                                    </Box>
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {!isEditing ? (
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        {admin.t('admin.lessonTypes.fields.price', 'Price')}: ${formatUsdFromCents(Number(row.price_per_person_cents || 0))} {admin.t('admin.lessonTypes.fields.perPerson', 'per person')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {admin.t('admin.lessonTypes.fields.active', 'Active')}: {row.is_active ? admin.t('admin.common.yes', 'Yes') : admin.t('admin.common.no', 'No')}
                                    </Typography>
                                    {row.description ? (
                                        <Typography variant="body2">{row.description}</Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            {admin.t('admin.lessonTypes.fields.noDescription', 'No description')}
                                        </Typography>
                                    )}
                                </Stack>
                            ) : (
                                <Stack spacing={2}>
                                    <TextField
                                        label={admin.t('admin.lessonTypes.fields.displayName', 'Display name')}
                                        value={draft?.display_name ?? ''}
                                        onChange={(e) => updateDraft(key, { display_name: e.target.value })}
                                        disabled={busy}
                                        fullWidth
                                    />
                                    <TextField
                                        label={admin.t('admin.lessonTypes.fields.description', 'Description')}
                                        value={draft?.description ?? ''}
                                        onChange={(e) => updateDraft(key, { description: e.target.value })}
                                        disabled={busy}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                    />
                                    <TextField
                                        label={admin.t('admin.lessonTypes.fields.priceUsd', 'Price (USD per person)')}
                                        value={draft?.price_usd ?? ''}
                                        onChange={(e) => updateDraft(key, { price_usd: e.target.value })}
                                        disabled={busy}
                                        fullWidth
                                        inputProps={{ inputMode: 'decimal' }}
                                    />
                                </Stack>
                            )}
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
}
