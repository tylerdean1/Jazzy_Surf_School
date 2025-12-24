'use client';

import * as React from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useLocale } from 'next-intl';
import { useCmsStringValue, saveCmsStringValue } from '@/hooks/useCmsStringValue';
import MediaPickerDialog, { type MediaSelection } from '@/components/admin/MediaPickerDialog';
import useContentBundle from '@/hooks/useContentBundle';

type SlotItem = {
    slot_key: string;
    sort: number | null;
    asset_id: string | null;
    asset: {
        id: string;
        title: string;
        bucket: string;
        path: string;
        public: boolean;
        asset_type: 'photo' | 'video';
        category: string;
    } | null;
};

async function adminJson(path: string, init?: RequestInit) {
    const res = await fetch(path, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.ok === false) throw new Error(body?.message || `Request failed (${res.status})`);
    return body;
}

function clampCount(n: number) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.floor(n)));
}

export default function GalleryMediaSlotsEditor() {
    const locale = useLocale();
    const admin = useContentBundle('admin.');

    const { value: countValue } = useCmsStringValue('gallery.images.count', '12');
    const parsedCount = clampCount(Number(countValue));

    const [countDraft, setCountDraft] = React.useState(String(parsedCount));
    const [savingCount, setSavingCount] = React.useState(false);
    const [countError, setCountError] = React.useState<string | null>(null);

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [items, setItems] = React.useState<SlotItem[]>([]);

    const [pickerOpenFor, setPickerOpenFor] = React.useState<string | null>(null);
    const [busySlot, setBusySlot] = React.useState<string | null>(null);

    const prefix = 'gallery.images.';

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const body = await adminJson(`/api/admin/media/slots?prefix=${encodeURIComponent(prefix)}`);
            setItems((body?.items ?? []) as SlotItem[]);
        } catch (e: any) {
            setError(e?.message || admin.t('admin.gallerySlots.errors.loadFailed', 'Failed to load gallery slots'));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    React.useEffect(() => {
        // keep draft in sync when DB value changes
        setCountDraft(String(parsedCount));
    }, [parsedCount]);

    const bySlotKey = React.useMemo(() => {
        const map = new Map<string, SlotItem>();
        for (const it of items) map.set(it.slot_key, it);
        return map;
    }, [items]);

    const count = clampCount(Number(countDraft));

    const slots = React.useMemo(() => {
        return Array.from({ length: count }, (_, i) => `${prefix}${i}`);
    }, [count]);

    const saveCount = async () => {
        setSavingCount(true);
        setCountError(null);
        try {
            await saveCmsStringValue('gallery.images.count', locale, String(count));
        } catch (e: any) {
            setCountError(e?.message || admin.t('admin.gallerySlots.errors.saveCountFailed', 'Failed to save count'));
        } finally {
            setSavingCount(false);
        }
    };

    const setSlot = async (slotKey: string, selection: MediaSelection | null) => {
        setBusySlot(slotKey);
        setError(null);
        try {
            await adminJson('/api/admin/media/slots', {
                method: 'POST',
                body: JSON.stringify({
                    op: 'set',
                    slot_key: slotKey,
                    asset_id: selection ? selection.id : null,
                    sort: Number(slotKey.split('.').pop() || 0),
                }),
            });
            await load();
        } catch (e: any) {
            setError(e?.message || admin.t('admin.gallerySlots.errors.updateSlotFailed', 'Failed to update slot'));
        } finally {
            setBusySlot(null);
        }
    };

    return (
        <Box data-admin-edit-ui="1" sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6">{admin.t('admin.gallerySlots.title', 'Gallery Photos')}</Typography>
                <Box sx={{ flex: 1 }} />
                <Button variant="outlined" onClick={load} disabled={loading}>
                    {admin.t('admin.common.refresh', 'Refresh')}
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {admin.t(
                    'admin.gallerySlots.subtitle',
                    'Controls which media appears on the Gallery page by writing slot keys under gallery.images.*.'
                )}
            </Typography>

            {error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : null}

            <Box sx={{ mt: 2, display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <TextField
                    label={admin.t('admin.gallerySlots.countLabel', 'How many photos to show')}
                    size="small"
                    value={countDraft}
                    onChange={(e) => setCountDraft(e.target.value.replace(/[^0-9]/g, ''))}
                    sx={{ width: 220 }}
                    inputProps={{ inputMode: 'numeric' }}
                />
                <Button variant="contained" onClick={saveCount} disabled={savingCount}>
                    {savingCount ? admin.t('admin.common.saving', 'Saving…') : admin.t('admin.common.save', 'Save')}
                </Button>
                {countError ? (
                    <Alert severity="error" sx={{ py: 0.25, px: 1.5 }}>
                        {countError}
                    </Alert>
                ) : null}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">{admin.t('admin.gallerySlots.loadingSlots', 'Loading slots…')}</Typography>
                </Box>
            ) : null}

            <Stack spacing={1} sx={{ mt: 2 }}>
                {slots.map((slotKey) => {
                    const it = bySlotKey.get(slotKey) || null;
                    const title = it?.asset?.title || admin.t('admin.gallerySlots.noneSelected', 'None selected');
                    const disabled = busySlot === slotKey;

                    return (
                        <Box
                            key={slotKey}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.25,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Box sx={{ minWidth: 220 }}>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {slotKey}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {title}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1 }} />

                            <Button variant="outlined" onClick={() => setPickerOpenFor(slotKey)} disabled={disabled}>
                                {admin.t('admin.gallerySlots.actions.choose', 'Choose')}
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => void setSlot(slotKey, null)}
                                disabled={disabled || !it?.asset_id}
                            >
                                {admin.t('admin.gallerySlots.actions.clear', 'Clear')}
                            </Button>
                            {disabled ? <CircularProgress size={18} /> : null}
                        </Box>
                    );
                })}
            </Stack>

            <Dialog open={false} />

            <MediaPickerDialog
                open={!!pickerOpenFor}
                onClose={() => setPickerOpenFor(null)}
                onSelect={(selection) => {
                    const slotKey = pickerOpenFor;
                    setPickerOpenFor(null);
                    if (!slotKey) return;
                    void setSlot(slotKey, selection);
                }}
            />
        </Box>
    );
}
