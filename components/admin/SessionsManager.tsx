'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
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
import AdminMonthCalendar from './AdminMonthCalendar';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { rpc } from '@/lib/rpc';

type SessionRow = Database['public']['Tables']['sessions']['Row'];
type LessonTypeRow = Database['public']['Tables']['lesson_types']['Row'];

type LessonStatus = Database['public']['Enums']['lesson_status'];

const STATUSES: LessonStatus[] = [
    'booked_paid_in_full',
    'booked_unpaid',
    'completed',
    'canceled_with_refund',
    'canceled_without_refund',
];

type SessionDraft = {
    clientNamesText: string;
    groupSize: number;
    date: string; // yyyy-mm-dd
    timeLabel: string; // e.g. '7:30 AM'
    lessonTypeKey: string; // lesson_types.key (empty means unknown)
    lessonStatus: LessonStatus;
    paid: number;
    tip: number;
    notes: string;
};

function parseSessionTimestampNoTz(value: string | null):
    | { yyyy: number; mm: number; dd: number; hour: number; minute: number }
    | null {
    if (!value) return null;
    const s = String(value).trim();
    // Accept both "YYYY-MM-DDTHH:mm:ss" and "YYYY-MM-DD HH:mm:ss" (and variants with seconds/fractions/timezone).
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
    if (!m) return null;
    const yyyy = Number(m[1]);
    const mm = Number(m[2]);
    const dd = Number(m[3]);
    const hour = Number(m[4]);
    const minute = Number(m[5]);
    if (!yyyy || !mm || !dd) return null;
    if (hour < 0 || hour > 23) return null;
    if (minute < 0 || minute > 59) return null;
    return { yyyy, mm, dd, hour, minute };
}

function formatSessionDateTime(value: string | null): string {
    const parts = parseSessionTimestampNoTz(value);
    if (!parts) return value ? String(value) : '';
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const mm = pad2(parts.mm);
    const dd = pad2(parts.dd);
    const yyyy = parts.yyyy;
    const h24 = parts.hour;
    const mins = pad2(parts.minute);
    const ampm = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${mm}-${dd}-${yyyy} @ ${h12}:${mins} ${ampm.toLowerCase()}`;
}

function parseClientNames(input: string): string[] {
    const items = input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return Array.from(new Set(items));
}

function formatUsd(value: unknown): string {
    const n = Number(value ?? 0);
    const safe = Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safe);
}

function formatYmd(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeLabel(d: Date): string {
    const h24 = d.getHours();
    const m = d.getMinutes();
    const ampm = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mm = m === 0 ? '00' : String(m).padStart(2, '0');
    return `${h12}:${mm} ${ampm}`;
}

function ymdFromSessionTime(value: string | null): string {
    const parts = parseSessionTimestampNoTz(value);
    if (!parts) return value ? formatYmd(new Date(value)) : '';
    const pad2 = (n: number) => String(n).padStart(2, '0');
    return `${parts.yyyy}-${pad2(parts.mm)}-${pad2(parts.dd)}`;
}

function timeLabelFromSessionTime(value: string | null): string {
    const parts = parseSessionTimestampNoTz(value);
    if (!parts) return value ? toTimeLabel(new Date(value)) : '';
    const h24 = parts.hour;
    const ampm = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mm = String(parts.minute).padStart(2, '0');
    return `${h12}:${mm} ${ampm}`;
}

function parseTimeLabel(label: string): { hour: number; minute: number } | null {
    const m = String(label || '').trim().match(/^([0-9]{1,2}):([0-9]{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let hour = Number(m[1]);
    const minute = Number(m[2]);
    const ampm = String(m[3] || '').toUpperCase();
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    if (hour < 1 || hour > 12) return null;
    if (minute !== 0 && minute !== 30) return null;
    if (ampm === 'AM') {
        if (hour === 12) hour = 0;
    } else {
        if (hour !== 12) hour += 12;
    }
    return { hour, minute };
}

function buildIsoFromDateAndLabel(date: string, timeLabel: string): string | null {
    const parsed = parseTimeLabel(timeLabel);
    if (!parsed) return null;
    const [y, m, d] = String(date || '').split('-').map((x) => Number(x));
    if (!y || !m || !d) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    // sessions.session_time is stored as timestamp without time zone.
    // Use a local wall-clock timestamp string so it round-trips without timezone shifts.
    return `${y}-${pad(m)}-${pad(d)}T${pad(parsed.hour)}:${pad(parsed.minute)}:00`;
}

function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 7; hour <= 15; hour++) {
        const h12 = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        slots.push(`${h12}:00 ${ampm}`);
        slots.push(`${h12}:30 ${ampm}`);
    }
    return slots;
}

export default function SessionsManager() {
    const admin = useContentBundle('admin.');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [items, setItems] = useState<SessionRow[]>([]);
    const [lessonTypes, setLessonTypes] = useState<LessonTypeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<LessonStatus | 'all' | 'booked'>('booked_paid_in_full');
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');
    const [filterName, setFilterName] = useState('');

    const calendarSelectedDate = useMemo(() => {
        const a = String(filterFromDate || '').trim();
        const b = String(filterToDate || '').trim();
        if (a && b && a === b) return a;
        return undefined;
    }, [filterFromDate, filterToDate]);

    const statusPriority = (st: LessonStatus) => {
        // Booked sessions should be top priority.
        if (st === 'booked_paid_in_full') return 0;
        if (st === 'booked_unpaid') return 1;
        if (st === 'completed') return 2;
        if (st === 'canceled_with_refund') return 3;
        if (st === 'canceled_without_refund') return 4;
        return 5;
    };

    const statusColor = (st: LessonStatus) => {
        if (st === 'booked_paid_in_full') return 'success.main';
        if (st === 'booked_unpaid') return 'warning.main';
        if (st === 'completed') return 'info.main';
        if (st === 'canceled_with_refund') return 'secondary.main';
        if (st === 'canceled_without_refund') return 'error.main';
        return 'text.secondary';
    };

    const [editingIds, setEditingIds] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, SessionDraft>>({});

    const [newClientNames, setNewClientNames] = useState('');
    const [newGroupSize, setNewGroupSize] = useState<number>(1);
    const [newSessionDate, setNewSessionDate] = useState('');
    const [newSessionTimeLabel, setNewSessionTimeLabel] = useState('');
    const [newLessonTypeKey, setNewLessonTypeKey] = useState('');

    const statusLabel = (st: LessonStatus) => {
        const key = `admin.sessions.status.${st}`;
        const fallback =
            st === 'booked_unpaid'
                ? 'Booked (unpaid)'
                : st === 'booked_paid_in_full'
                    ? 'Booked (paid in full)'
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
            const supabase = getSupabaseClient();
            const data = await rpc<SessionRow[]>(supabase, 'admin_list_sessions', { include_deleted: includeDeleted });
            setItems((data || []) as SessionRow[]);

            const lts = await rpc<LessonTypeRow[]>(supabase, 'admin_list_lesson_types');
            setLessonTypes((lts || []) as LessonTypeRow[]);
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sessions.errors.loadFailed', 'Failed to load sessions'));
        } finally {
            setLoading(false);
        }
    }, [includeDeleted]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const timeSlots = useMemo(() => generateTimeSlots(), []);

    const lessonTypeOptions = useMemo(() => {
        const active = (lessonTypes || []).filter((lt) => Boolean(lt.is_active));
        const sorted = [...active].sort(
            (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || String(a.key).localeCompare(String(b.key))
        );
        return sorted
            .map((lt) => {
                const key = String(lt.key || '').trim();
                if (!key) return null;
                const label = String(lt.display_name || key).trim() || key;
                return { key, label };
            })
            .filter(Boolean) as Array<{ key: string; label: string }>;
    }, [lessonTypes]);

    useEffect(() => {
        if (!newLessonTypeKey && lessonTypeOptions.length) {
            setNewLessonTypeKey(lessonTypeOptions[0].key);
        }
    }, [lessonTypeOptions, newLessonTypeKey]);

    const filteredAndSorted = useMemo(() => {
        const nameNeedle = String(filterName || '').trim().toLowerCase();
        const fromNeedle = String(filterFromDate || '').trim();
        const toNeedle = String(filterToDate || '').trim();

        const statusSet =
            statusFilter === 'all'
                ? new Set<LessonStatus>(STATUSES)
                : statusFilter === 'booked'
                    ? new Set<LessonStatus>(['booked_unpaid', 'booked_paid_in_full'])
                    : new Set<LessonStatus>([statusFilter]);

        const matches = (s: SessionRow) => {
            const status = (s.lesson_status || 'booked_unpaid') as LessonStatus;
            if (!statusSet.has(status)) return false;

            if (fromNeedle || toNeedle) {
                const d = s.session_time ? ymdFromSessionTime(s.session_time) : '';
                if (fromNeedle && d < fromNeedle) return false;
                if (toNeedle && d > toNeedle) return false;
            }

            if (nameNeedle) {
                const names = (s.client_names || []).join(' ').toLowerCase();
                if (!names.includes(nameNeedle)) return false;
            }
            return true;
        };

        return [...items]
            .filter(matches)
            .sort((a, b) => String(b.session_time).localeCompare(String(a.session_time)));
    }, [items, filterFromDate, filterToDate, filterName, statusFilter]);

    const makeDraft = useCallback((s: SessionRow): SessionDraft => {
        const date = s.session_time ? ymdFromSessionTime(s.session_time) : '';
        const timeLabel = s.session_time ? timeLabelFromSessionTime(s.session_time) : '';
        return {
            clientNamesText: (s.client_names || []).join(', '),
            groupSize: Number(s.group_size ?? 1) || 1,
            date,
            timeLabel,
            lessonTypeKey: String((s as any).lesson_type_key || ''),
            lessonStatus: (s.lesson_status || 'booked_unpaid') as LessonStatus,
            paid: Number(s.paid ?? 0) || 0,
            tip: Number(s.tip ?? 0) || 0,
            notes: String((s as any).notes ?? ''),
        };
    }, []);

    const setDraftField = (id: string, patch: Partial<SessionDraft>) => {
        setDrafts((prev) => {
            const existing = prev[id];
            if (!existing) return prev;
            return { ...prev, [id]: { ...existing, ...patch } };
        });
    };

    async function createSession() {
        setError(null);
        setBusyId('create');
        try {
            const iso = buildIsoFromDateAndLabel(newSessionDate, newSessionTimeLabel);
            const session_time = iso || undefined;
            const supabase = getSupabaseClient();
            await rpc<SessionRow>(supabase, 'admin_create_session', {
                p_client_names: parseClientNames(newClientNames),
                p_group_size: Number(newGroupSize) || 1,
                p_session_time: session_time,
                p_lesson_status: 'booked_unpaid',
                p_paid: 0,
                p_tip: 0,
                // Always pass to avoid ambiguity if legacy overloads exist in DB.
                p_lesson_type_key: newLessonTypeKey ? newLessonTypeKey : null,
            });
            setNewClientNames('');
            setNewGroupSize(1);
            setNewSessionDate('');
            setNewSessionTimeLabel('');
            setNewLessonTypeKey('');
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
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Network error');

            const wantsNotes = (patch as any).notes !== undefined;

            const existing = items.find((x) => x.id === id);

            // Use the typed RPC that returns the updated row for the supported fields.
            const payload: any = { p_id: id };
            if (patch.client_names !== undefined) payload.p_client_names = patch.client_names;
            if (patch.group_size !== undefined) payload.p_group_size = patch.group_size;
            if (patch.session_time !== undefined) payload.p_session_time = patch.session_time;
            if (patch.lesson_status !== undefined) payload.p_lesson_status = patch.lesson_status;
            if (patch.paid !== undefined) payload.p_paid = patch.paid;
            if (patch.tip !== undefined) payload.p_tip = patch.tip;
            // Always pass to avoid ambiguity if legacy overloads exist in DB.
            // Use the current value when not editing lesson type to avoid accidental clearing.
            payload.p_lesson_type_key =
                (patch as any).lesson_type_key !== undefined ? (patch as any).lesson_type_key : (existing?.lesson_type_key ?? null);

            const hasAny = Object.keys(payload).length > 1;
            if (hasAny) {
                await rpc<SessionRow>(supabase, 'admin_update_session', payload);
            }

            // Notes are handled via admin_update_session_v2 (RPC-only; returns void).
            if (wantsNotes) {
                await rpc<void>(supabase, 'admin_update_session_v2', {
                    p_session_id: id,
                    p_notes: (patch as any).notes ?? null,
                });
            }

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
            const supabase = getSupabaseClient();
            if (operation === 'soft_delete') {
                await rpc<void>(supabase, 'admin_delete_session', { p_id: id });
            } else if (operation === 'restore') {
                await rpc<void>(supabase, 'admin_restore_session', { p_id: id });
            } else {
                await rpc<void>(supabase, 'admin_hard_delete_session', { p_id: id });
            }
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

            <Box sx={{ mb: 3 }}>
                <AdminMonthCalendar
                    title={admin.t('admin.sessions.calendar.title', 'Sessions Calendar')}
                    legendItems={[
                        { label: statusLabel('booked_paid_in_full' as LessonStatus), color: 'success.main' },
                        { label: statusLabel('booked_unpaid' as LessonStatus), color: 'warning.main' },
                        { label: statusLabel('completed' as LessonStatus), color: 'info.main' },
                        { label: statusLabel('canceled_with_refund' as LessonStatus), color: 'secondary.main' },
                        { label: statusLabel('canceled_without_refund' as LessonStatus), color: 'error.main' },
                    ]}
                    items={items}
                    selectedDateYmd={calendarSelectedDate}
                    onSelectDateYmd={(ymd) => {
                        setFilterFromDate(ymd);
                        setFilterToDate(ymd);
                    }}
                    getItemDateYmd={(s) => ymdFromSessionTime(s.session_time)}
                    getItemStatusKey={(s) => String((s.lesson_status || 'booked_unpaid') as LessonStatus)}
                    getStatusPriority={(k) => statusPriority(k as LessonStatus)}
                    getStatusColor={(k) => statusColor(k as LessonStatus)}
                    getItemTitle={(s) => (s.client_names || []).join(', ') || admin.t('admin.common.none', '—')}
                    getItemSubtitle={(s) => {
                        const st = statusLabel((s.lesson_status || 'booked_unpaid') as LessonStatus);
                        const raw = timeLabelFromSessionTime(s.session_time);
                        const time = raw ? raw.replace(/\b(am|pm)\b/i, (m) => m.toLowerCase()) : '';
                        return time ? `${st} • ${time}` : st;
                    }}
                />
            </Box>

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
                    label={admin.t('admin.sessions.create.sessionDateLabel', 'Date')}
                    type="date"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                />
                <FormControl sx={{ width: 200 }}>
                    <InputLabel id="create-session-time">{admin.t('admin.sessions.create.sessionTimeLabel', 'Time')}</InputLabel>
                    <Select
                        labelId="create-session-time"
                        label={admin.t('admin.sessions.create.sessionTimeLabel', 'Time')}
                        value={newSessionTimeLabel}
                        onChange={(e) => setNewSessionTimeLabel(String(e.target.value || ''))}
                        disabled={!newSessionDate}
                    >
                        {timeSlots.map((slot) => (
                            <MenuItem key={slot} value={slot}>
                                {slot}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ width: 220 }} disabled={!lessonTypeOptions.length}>
                    <InputLabel id="create-lesson-type">{admin.t('admin.sessions.create.lessonTypeLabel', 'Lesson type')}</InputLabel>
                    <Select
                        labelId="create-lesson-type"
                        label={admin.t('admin.sessions.create.lessonTypeLabel', 'Lesson type')}
                        value={newLessonTypeKey}
                        onChange={(e) => setNewLessonTypeKey(String(e.target.value || ''))}
                    >
                        {lessonTypeOptions.map((lt) => (
                            <MenuItem key={lt.key} value={lt.key}>
                                {lt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    onClick={createSession}
                    disabled={busyId === 'create' || !newClientNames.trim() || !newSessionDate || !newSessionTimeLabel}
                >
                    {busyId === 'create'
                        ? admin.t('admin.sessions.create.creating', 'Creating…')
                        : admin.t('admin.sessions.create.create', 'Create')}
                </Button>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
                <FormControlLabel
                    control={<Checkbox checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />}
                    label={admin.t('admin.sessions.includeDeleted', 'Include deleted')}
                />

                <FormControl sx={{ width: 240 }}>
                    <InputLabel id="sessions-status-filter">{admin.t('admin.sessions.filters.status', 'Status')}</InputLabel>
                    <Select
                        labelId="sessions-status-filter"
                        label={admin.t('admin.sessions.filters.status', 'Status')}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as LessonStatus | 'all' | 'booked')}
                    >
                        <MenuItem value="all">{admin.t('admin.sessions.filters.allStatuses', 'All statuses')}</MenuItem>
                        <MenuItem value="booked">{admin.t('admin.sessions.filters.bookedAny', 'Booked (all)')}</MenuItem>
                        {STATUSES.map((st) => (
                            <MenuItem key={st} value={st}>
                                {statusLabel(st)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label={admin.t('admin.sessions.filters.fromDate', 'From')}
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                />
                <TextField
                    label={admin.t('admin.sessions.filters.toDate', 'To')}
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                />
                <TextField
                    label={admin.t('admin.sessions.filters.name', 'Filter name')}
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    sx={{ width: 220 }}
                />

                <Box sx={{ flex: 1 }} />

                <Button variant="outlined" onClick={refresh} disabled={loading}>
                    {admin.t('admin.common.refresh', 'Refresh')}
                </Button>
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <CircularProgress size={22} />
                    <Typography>{admin.t('admin.common.loading', 'Loading…')}</Typography>
                </Box>
            ) : filteredAndSorted.length === 0 ? (
                <Alert severity="info">{admin.t('admin.sessions.empty', 'No sessions found.')}</Alert>
            ) : (
                <Stack spacing={2}>
                    {filteredAndSorted.map((s) => {
                        const isDeleted = Boolean(s.deleted_at);
                        const busy = busyId === s.id;
                        const isEditing = Boolean(editingIds[s.id]);
                        const draft = drafts[s.id] || makeDraft(s);

                        const hasDraft = Boolean(drafts[s.id]);
                        const currentDraft = hasDraft ? drafts[s.id] : draft;

                        const billed = Number((s as any).bill_total ?? 0) || 0;
                        const paid = Number(isEditing ? currentDraft.paid : (s.paid ?? 0)) || 0;
                        const balance = billed - paid;
                        const tip = Number(isEditing ? currentDraft.tip : (s.tip ?? 0)) || 0;

                        const canEdit = !busy;

                        const startEdit = () => {
                            setDrafts((prev) => ({ ...prev, [s.id]: makeDraft(s) }));
                            setEditingIds((prev) => ({ ...prev, [s.id]: true }));
                        };

                        const cancelEdit = () => {
                            setDrafts((prev) => {
                                const next = { ...prev };
                                delete next[s.id];
                                return next;
                            });
                            setEditingIds((prev) => ({ ...prev, [s.id]: false }));
                        };

                        const saveEdit = async () => {
                            const d = drafts[s.id];
                            if (!d) return;
                            const patch: Partial<SessionRow> = {};
                            patch.client_names = parseClientNames(d.clientNamesText);
                            patch.group_size = Number(d.groupSize) || 1;
                            if (d.lessonTypeKey && d.lessonTypeKey !== String((s as any).lesson_type_key || '')) {
                                (patch as any).lesson_type_key = d.lessonTypeKey;
                            }
                            patch.lesson_status = d.lessonStatus;
                            patch.paid = Number(d.paid) || 0;
                            patch.tip = Number(d.tip) || 0;
                            // notes exists in DB; persisted via API route (direct table update).
                            (patch as any).notes = d.notes;
                            const iso = d.date && d.timeLabel ? buildIsoFromDateAndLabel(d.date, d.timeLabel) : null;
                            patch.session_time = iso || s.session_time;

                            await updateSession(s.id, patch);
                            cancelEdit();
                        };

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
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'stretch' }}>
                                    <Box sx={{ flex: '0 0 33%', minWidth: 260 }}>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label={admin.t('admin.sessions.fields.clients', 'Client names')}
                                                value={currentDraft.clientNamesText}
                                                onChange={(e) => setDraftField(s.id, { clientNamesText: e.target.value })}
                                                disabled={!canEdit}
                                            />
                                        ) : (
                                            <Typography sx={{ fontWeight: 700 }}>
                                                {(s.client_names || []).join(', ') || admin.t('admin.common.none', '—')}
                                            </Typography>
                                        )}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.25 }}>
                                            {formatSessionDateTime(s.session_time)}
                                            {isDeleted ? admin.t('admin.sessions.deletedMarker', ' • Deleted') : ''}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {admin.t('admin.sessions.summary.billed', 'Billed')}: {formatUsd(billed)} •{' '}
                                            {admin.t('admin.sessions.summary.paid', 'Paid')}: {formatUsd(paid)} •{' '}
                                            {admin.t('admin.sessions.summary.balance', 'Balance')}: {formatUsd(balance)}
                                        </Typography>
                                        {tip ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                                {admin.t('admin.sessions.summary.tip', 'Tip')}: {formatUsd(tip)}
                                            </Typography>
                                        ) : null}

                                        {!isEditing && (s as any).notes ? (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                title={String((s as any).notes)}
                                            >
                                                {String((s as any).notes)}
                                            </Typography>
                                        ) : null}
                                    </Box>

                                    <Box
                                        sx={{
                                            flex: '1 1 67%',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <TextField
                                            size="small"
                                            label={admin.t('admin.sessions.fields.group', 'Group')}
                                            type="number"
                                            value={isEditing ? currentDraft.groupSize : s.group_size ?? 1}
                                            onChange={(e) =>
                                                isEditing ? setDraftField(s.id, { groupSize: Number(e.target.value) || 1 }) : undefined
                                            }
                                            inputProps={{ min: 1 }}
                                            sx={{ width: 110 }}
                                            disabled={!isEditing || busy}
                                        />

                                        <TextField
                                            size="small"
                                            label={admin.t('admin.sessions.fields.paid', 'Paid')}
                                            type="number"
                                            value={isEditing ? currentDraft.paid : s.paid ?? 0}
                                            onChange={(e) =>
                                                isEditing ? setDraftField(s.id, { paid: Number(e.target.value) || 0 }) : undefined
                                            }
                                            sx={{ width: 120 }}
                                            disabled={!isEditing || busy}
                                        />

                                        <TextField
                                            size="small"
                                            label={admin.t('admin.sessions.fields.tip', 'Tip')}
                                            type="number"
                                            value={isEditing ? currentDraft.tip : s.tip ?? 0}
                                            onChange={(e) =>
                                                isEditing ? setDraftField(s.id, { tip: Number(e.target.value) || 0 }) : undefined
                                            }
                                            sx={{ width: 110 }}
                                            disabled={!isEditing || busy}
                                        />

                                        <FormControl sx={{ width: 240 }} size="small" disabled={busy || !isEditing}>
                                            <InputLabel id={`status-${s.id}`}>{admin.t('admin.sessions.fields.status', 'Status')}</InputLabel>
                                            <Select
                                                labelId={`status-${s.id}`}
                                                label={admin.t('admin.sessions.fields.status', 'Status')}
                                                value={(isEditing ? currentDraft.lessonStatus : ((s.lesson_status || 'booked_unpaid') as LessonStatus))}
                                                onChange={(e) =>
                                                    isEditing
                                                        ? setDraftField(s.id, { lessonStatus: e.target.value as LessonStatus })
                                                        : undefined
                                                }
                                            >
                                                {STATUSES.map((st) => (
                                                    <MenuItem key={st} value={st}>
                                                        {statusLabel(st)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl sx={{ width: 220 }} size="small" disabled={busy || !isEditing || !lessonTypeOptions.length}>
                                            <InputLabel id={`lesson-type-${s.id}`}>{admin.t('admin.sessions.fields.lessonType', 'Lesson type')}</InputLabel>
                                            <Select
                                                labelId={`lesson-type-${s.id}`}
                                                label={admin.t('admin.sessions.fields.lessonType', 'Lesson type')}
                                                value={isEditing ? currentDraft.lessonTypeKey : String((s as any).lesson_type_key || '')}
                                                onChange={(e) =>
                                                    isEditing
                                                        ? setDraftField(s.id, { lessonTypeKey: String(e.target.value || '') })
                                                        : undefined
                                                }
                                            >
                                                <MenuItem value="">{admin.t('admin.common.unknown', 'Unknown')}</MenuItem>
                                                {lessonTypeOptions.map((lt) => (
                                                    <MenuItem key={lt.key} value={lt.key}>
                                                        {lt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            size="small"
                                            label={admin.t('admin.sessions.fields.date', 'Date')}
                                            type="date"
                                            value={isEditing ? currentDraft.date : ymdFromSessionTime(s.session_time)}
                                            onChange={(e) => (isEditing ? setDraftField(s.id, { date: e.target.value }) : undefined)}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ width: 170 }}
                                            disabled={!isEditing || busy}
                                        />

                                        <FormControl
                                            sx={{ width: 200 }}
                                            size="small"
                                            disabled={!isEditing || busy || !(isEditing ? currentDraft.date : s.session_time)}
                                        >
                                            <InputLabel id={`time-${s.id}`}>{admin.t('admin.sessions.fields.time', 'Time')}</InputLabel>
                                            <Select
                                                labelId={`time-${s.id}`}
                                                label={admin.t('admin.sessions.fields.time', 'Time')}
                                                value={isEditing ? currentDraft.timeLabel : timeLabelFromSessionTime(s.session_time)}
                                                onChange={(e) =>
                                                    isEditing ? setDraftField(s.id, { timeLabel: String(e.target.value || '') }) : undefined
                                                }
                                            >
                                                {timeSlots.map((slot) => (
                                                    <MenuItem key={slot} value={slot}>
                                                        {slot}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {isEditing ? (
                                            <TextField
                                                size="small"
                                                label={admin.t('admin.sessions.fields.notes', 'Notes')}
                                                value={currentDraft.notes}
                                                onChange={(e) => setDraftField(s.id, { notes: e.target.value })}
                                                multiline
                                                minRows={2}
                                                sx={{ flex: '1 1 100%', minWidth: 260 }}
                                                disabled={busy}
                                            />
                                        ) : null}

                                        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                                            {isDeleted ? null : isEditing ? (
                                                <>
                                                    <Button variant="contained" onClick={saveEdit} disabled={busy || !drafts[s.id]}>
                                                        {admin.t('admin.common.save', 'Save')}
                                                    </Button>
                                                    <Button variant="outlined" onClick={cancelEdit} disabled={busy}>
                                                        {admin.t('admin.common.cancel', 'Cancel')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button variant="outlined" onClick={startEdit} disabled={busy}>
                                                    {admin.t('admin.common.edit', 'Edit')}
                                                </Button>
                                            )}

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
                                    </Box>
                                </Stack>
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}
