'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import type { Database } from '@/lib/database.types';
import useContentBundle from '@/hooks/useContentBundle';

type SessionRow = Database['public']['Tables']['sessions']['Row'];

type LessonStatus = Database['public']['Enums']['lesson_status'];

const STATUSES: LessonStatus[] = ['booked', 'completed', 'canceled_with_refund', 'canceled_without_refund'];

function formatDateTime(value: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function toDatetimeLocal(value: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseClientNames(input: string): string[] {
    const items = input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return Array.from(new Set(items));
}

async function adminFetch(path: string, init?: RequestInit) {
    const res = await fetch(path, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
        throw new Error(json?.message || `Request failed: ${res.status}`);
    }
    return json;
}

export default function SessionsManager() {
    const admin = useContentBundle('admin.');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [items, setItems] = useState<SessionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const [newClientNames, setNewClientNames] = useState('');
    const [newGroupSize, setNewGroupSize] = useState<number>(1);
    const [newSessionTime, setNewSessionTime] = useState('');

    const statusLabel = (st: LessonStatus) => {
        const key = `admin.sessions.status.${st}`;
        const fallback =
            st === 'booked'
                ? 'Booked'
                : st === 'completed'
                    ? 'Completed'
                    : st === 'canceled_with_refund'
                        ? 'Canceled (with refund)'
                        : st === 'canceled_without_refund'
                            ? 'Canceled (without refund)'
                            : st;
        return admin.t(key, fallback);
    };

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const q = includeDeleted ? '?include_deleted=1' : '';
            const data = await adminFetch(`/api/admin/sessions${q}`);
            setItems((data.items || []) as SessionRow[]);
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sessions.errors.loadFailed', 'Failed to load sessions'));
        } finally {
            setLoading(false);
        }
    }, [includeDeleted]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => String(b.session_time).localeCompare(String(a.session_time)));
    }, [items]);

    async function createSession() {
        setError(null);
        setBusyId('create');
        try {
            const session_time = newSessionTime ? new Date(newSessionTime).toISOString() : undefined;
            await adminFetch('/api/admin/sessions', {
                method: 'POST',
                body: JSON.stringify({
                    op: 'create',
                    session: {
                        p_client_names: parseClientNames(newClientNames),
                        p_group_size: Number(newGroupSize) || 1,
                        p_session_time: session_time,
                        p_lesson_status: 'booked',
                        p_paid: 0,
                        p_tip: 0,
                    },
                }),
            });
            setNewClientNames('');
            setNewGroupSize(1);
            setNewSessionTime('');
            await refresh();
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sessions.errors.createFailed', 'Failed to create session'));
        } finally {
            setBusyId(null);
        }
    }

    async function updateSession(id: string, patch: Partial<SessionRow>) {
        setError(null);
        setBusyId(id);
        try {
            const payload: any = { p_id: id };
            if (patch.client_names !== undefined) payload.p_client_names = patch.client_names;
            if (patch.group_size !== undefined) payload.p_group_size = patch.group_size;
            if (patch.session_time !== undefined) payload.p_session_time = patch.session_time;
            if (patch.lesson_status !== undefined) payload.p_lesson_status = patch.lesson_status;
            if (patch.paid !== undefined) payload.p_paid = patch.paid;
            if (patch.tip !== undefined) payload.p_tip = patch.tip;

            await adminFetch('/api/admin/sessions', {
                method: 'POST',
                body: JSON.stringify({ op: 'update', session: payload }),
            });
            await refresh();
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sessions.errors.updateFailed', 'Failed to update session'));
        } finally {
            setBusyId(null);
        }
    }

    async function op(id: string, operation: 'soft_delete' | 'restore' | 'hard_delete') {
        setError(null);
        setBusyId(id);
        try {
            await adminFetch('/api/admin/sessions', {
                method: 'POST',
                body: JSON.stringify({ op: operation, id }),
            });
            await refresh();
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sessions.errors.operationFailed', 'Operation failed'));
        } finally {
            setBusyId(null);
        }
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
                {admin.t('admin.sessions.title', 'Sessions')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {admin.t(
                    'admin.sessions.subtitle',
                    'Uses existing `admin_*_session` RPCs. Deleted sessions are soft-deleted via `deleted_at`.'
                )}
            </Typography>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : null}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    label={admin.t('admin.sessions.create.clientNamesLabel', 'Client names (comma-separated)')}
                    value={newClientNames}
                    onChange={(e) => setNewClientNames(e.target.value)}
                />
                <TextField
                    label={admin.t('admin.sessions.create.groupSizeLabel', 'Group size')}
                    type="number"
                    value={newGroupSize}
                    onChange={(e) => setNewGroupSize(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ width: 140 }}
                />
                <TextField
                    label={admin.t('admin.sessions.create.sessionTimeLabel', 'Session time')}
                    type="datetime-local"
                    value={newSessionTime}
                    onChange={(e) => setNewSessionTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 240 }}
                />
                <Button
                    variant="contained"
                    onClick={createSession}
                    disabled={busyId === 'create' || !newClientNames.trim() || !newSessionTime}
                >
                    {busyId === 'create'
                        ? admin.t('admin.sessions.create.creating', 'Creating…')
                        : admin.t('admin.sessions.create.create', 'Create')}
                </Button>
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <FormControlLabel
                    control={<Checkbox checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />}
                    label={admin.t('admin.sessions.includeDeleted', 'Include deleted')}
                />
                <Button variant="outlined" onClick={refresh} disabled={loading}>
                    {admin.t('admin.common.refresh', 'Refresh')}
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <CircularProgress size={22} />
                    <Typography>{admin.t('admin.common.loading', 'Loading…')}</Typography>
                </Box>
            ) : sorted.length === 0 ? (
                <Alert severity="info">{admin.t('admin.sessions.empty', 'No sessions found.')}</Alert>
            ) : (
                <Stack spacing={2}>
                    {sorted.map((s) => {
                        const isDeleted = Boolean(s.deleted_at);
                        const busy = busyId === s.id;

                        return (
                            <Box
                                key={s.id}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    p: 2,
                                    opacity: isDeleted ? 0.7 : 1,
                                }}
                            >
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                                    <Box sx={{ flex: 1, minWidth: 260 }}>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {(s.client_names || []).join(', ') || admin.t('admin.common.none', '—')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDateTime(s.session_time)}
                                            {isDeleted ? admin.t('admin.sessions.deletedMarker', ' • Deleted') : ''}
                                        </Typography>
                                    </Box>

                                    <TextField
                                        label={admin.t('admin.sessions.fields.group', 'Group')}
                                        type="number"
                                        value={s.group_size ?? 1}
                                        onChange={(e) => updateSession(s.id, { group_size: Number(e.target.value) || 1 })}
                                        inputProps={{ min: 1 }}
                                        sx={{ width: 110 }}
                                        disabled={busy}
                                    />

                                    <TextField
                                        label={admin.t('admin.sessions.fields.paid', 'Paid')}
                                        type="number"
                                        value={s.paid ?? 0}
                                        onChange={(e) => updateSession(s.id, { paid: Number(e.target.value) || 0 })}
                                        sx={{ width: 120 }}
                                        disabled={busy}
                                    />

                                    <TextField
                                        label={admin.t('admin.sessions.fields.tip', 'Tip')}
                                        type="number"
                                        value={s.tip ?? 0}
                                        onChange={(e) => updateSession(s.id, { tip: Number(e.target.value) || 0 })}
                                        sx={{ width: 110 }}
                                        disabled={busy}
                                    />

                                    <FormControl sx={{ width: 240 }} disabled={busy}>
                                        <InputLabel id={`status-${s.id}`}>{admin.t('admin.sessions.fields.status', 'Status')}</InputLabel>
                                        <Select
                                            labelId={`status-${s.id}`}
                                            label={admin.t('admin.sessions.fields.status', 'Status')}
                                            value={s.lesson_status || 'booked'}
                                            onChange={(e) => updateSession(s.id, { lesson_status: e.target.value as LessonStatus })}
                                        >
                                            {STATUSES.map((st) => (
                                                <MenuItem key={st} value={st}>
                                                    {statusLabel(st)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label={admin.t('admin.sessions.fields.time', 'Time')}
                                        type="datetime-local"
                                        value={toDatetimeLocal(s.session_time)}
                                        onChange={(e) =>
                                            updateSession(s.id, {
                                                session_time: e.target.value ? new Date(e.target.value).toISOString() : s.session_time,
                                            })
                                        }
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ width: 240 }}
                                        disabled={busy}
                                    />

                                    <Stack direction="row" spacing={1}>
                                        {isDeleted ? (
                                            <>
                                                <Button variant="outlined" onClick={() => op(s.id, 'restore')} disabled={busy}>
                                                    {admin.t('admin.sessions.actions.restore', 'Restore')}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => op(s.id, 'hard_delete')}
                                                    disabled={busy}
                                                >
                                                    {admin.t('admin.sessions.actions.hardDelete', 'Hard delete')}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="outlined" color="error" onClick={() => op(s.id, 'soft_delete')} disabled={busy}>
                                                {admin.t('admin.sessions.actions.delete', 'Delete')}
                                            </Button>
                                        )}
                                    </Stack>
                                </Stack>
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}
