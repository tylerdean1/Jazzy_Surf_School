'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { Database } from '@/lib/database.types';
import useContentBundle from '@/hooks/useContentBundle';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { rpc } from '@/lib/rpc';

type LessonStatus = Database['public']['Enums']['lesson_status'];
type LessonTypeRow = Database['public']['Tables']['lesson_types']['Row'];

type Mode = 'year' | 'month';

type ChartType = 'line' | 'bar';

type FinancePoint = {
    period: string; // YYYY-MM or YYYY-MM-DD
    revenue: number;
    tips: number;
    expenses: number;
    count: number;
};

type FinanceByStatus = {
    status: string;
    revenue: number;
    tips: number;
    count: number;
};

type FinanceResponse = {
    ok: true;
    mode: Mode;
    year: number;
    month: number;
    start: string;
    end: string;
    totals: {
        revenue: number;
        tips: number;
        expenses: number;
        net: number;
        sessionsCount: number;
        expenseReceiptsCount: number;
    };
    byStatus: FinanceByStatus[];
    points: FinancePoint[];
};

function formatMoney(n: number): string {
    if (!Number.isFinite(n)) return '$0.00';
    return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function formatXAxisLabel(mode: Mode, period: string): string {
    // period is YYYY-MM or YYYY-MM-DD
    if (mode === 'month') {
        const m = String(period || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return String(period || '');
        return `${m[2]}-${m[3]}`;
    }

    const m = String(period || '').match(/^(\d{4})-(\d{2})$/);
    if (!m) return String(period || '');

    const monthNum = Number(m[2]);
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[monthNum - 1] || m[2];
}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

function startOfNextMonth(year: number, month: number): { y: number; m: number } {
    if (month >= 12) return { y: year + 1, m: 1 };
    return { y: year, m: month + 1 };
}

function safeMoney(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100) / 100;
}

function centsToDollars(cents: unknown): number {
    const n = Number(cents);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n) / 100;
}

function parseDateKeyFromSessionTime(sessionTime: string | null): { y: number; m: number; d: number } | null {
    const s = String(sessionTime || '').trim();
    const [datePart] = s.split('T');
    const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
    return { y, m: mo, d };
}

function parseDateKeyFromYmd(value: string | null): { y: number; m: number; d: number } | null {
    const s = String(value || '').trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
    return { y, m: mo, d };
}

const STATUS_OPTIONS: Array<{ value: LessonStatus; label: string }> = [
    { value: 'booked_unpaid', label: 'Booked (unpaid)' },
    { value: 'booked_paid_in_full', label: 'Booked (paid in full)' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled_with_refund', label: 'Canceled (with refund)' },
    { value: 'canceled_without_refund', label: 'Canceled (without refund)' },
];

export default function FinancesManager() {
    const admin = useContentBundle('admin.');
    const theme = useTheme();

    const now = new Date();
    const [mode, setMode] = useState<Mode>('year');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [year, setYear] = useState<number>(now.getFullYear());
    const [month, setMonth] = useState<number>(now.getMonth() + 1);

    const [selectedLessonTypes, setSelectedLessonTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<LessonStatus[]>([]);

    const [lessonTypeOptions, setLessonTypeOptions] = useState<Array<{ key: string; label: string }>>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<FinanceResponse | null>(null);

    const yearOptions = useMemo(() => {
        const current = now.getFullYear();
        const out: number[] = [];
        for (let y = current - 4; y <= current + 1; y++) out.push(y);
        return out;
    }, [now]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Network error');

            const normalizedYear = clamp(Number(year), 2000, 2100);
            const normalizedMonth = clamp(Number(month), 1, 12);

            let start: string;
            let end: string;
            if (mode === 'month') {
                const next = startOfNextMonth(normalizedYear, normalizedMonth);
                start = `${normalizedYear}-${pad2(normalizedMonth)}-01T00:00:00`;
                end = `${next.y}-${pad2(next.m)}-01T00:00:00`;
            } else {
                start = `${normalizedYear}-01-01T00:00:00`;
                end = `${normalizedYear + 1}-01-01T00:00:00`;
            }

            const startDate = start.slice(0, 10);
            const endDate = end.slice(0, 10);

            const sessions = await rpc<
                Array<{
                    id: string;
                    session_time: string | null;
                    paid: number;
                    tip: number | null;
                    lesson_status: LessonStatus | null;
                    deleted_at: string | null;
                    lesson_type_key?: string | null;
                }>
            >(supabase, 'admin_list_sessions', { include_deleted: false });

            const lessonTypes = await rpc<LessonTypeRow[]>(supabase, 'admin_list_lesson_types');
            const activeLessonTypes = (lessonTypes || []).filter((lt) => lt.is_active);
            const labelByKey = new Map<string, string>();
            for (const lt of activeLessonTypes) {
                const key = String(lt.key || '').trim();
                if (!key) continue;
                labelByKey.set(key, String(lt.display_name || key));
            }

            const keys = activeLessonTypes
                .map((lt) => String(lt.key || '').trim())
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b));

            const inRange = (sessions || []).filter((s) => {
                if (!s.session_time) return false;
                if (s.deleted_at) return false;
                return String(s.session_time) >= start && String(s.session_time) < end;
            });

            const enriched = inRange.map((s) => {
                const k = String((s as any).lesson_type_key ?? '').trim();
                const lessonTypeKey = k ? k : 'unknown';
                return {
                    id: s.id,
                    session_time: s.session_time,
                    paid: safeMoney(s.paid),
                    tip: safeMoney(s.tip),
                    lesson_status: (s.lesson_status || 'unknown') as LessonStatus | 'unknown',
                    lesson_type_key: lessonTypeKey,
                };
            });

            const hasUnknown = enriched.some((s) => s.lesson_type_key === 'unknown');
            const options: Array<{ key: string; label: string }> = keys.map((k) => ({
                key: k,
                label: labelByKey.get(k) || k,
            }));
            if (hasUnknown) options.unshift({ key: 'unknown', label: 'Unknown' });
            setLessonTypeOptions(options);

            const filtered = enriched.filter((s) => {
                if (selectedStatuses.length) {
                    if (s.lesson_status === 'unknown') return false;
                    if (!selectedStatuses.includes(s.lesson_status as LessonStatus)) return false;
                }
                if (selectedLessonTypes.length) {
                    if (!selectedLessonTypes.includes(s.lesson_type_key)) return false;
                }
                return true;
            });

            const totalsIncome = filtered.reduce(
                (acc, s) => {
                    acc.revenue = Math.round((acc.revenue + s.paid) * 100) / 100;
                    acc.tips = Math.round((acc.tips + s.tip) * 100) / 100;
                    acc.count += 1;
                    return acc;
                },
                { revenue: 0, tips: 0, count: 0 }
            );

            const byStatusMap = new Map<string, FinanceByStatus>();
            for (const s of filtered) {
                const key = String(s.lesson_status);
                const prev = byStatusMap.get(key) || { status: key, revenue: 0, tips: 0, count: 0 };
                prev.revenue = Math.round((prev.revenue + s.paid) * 100) / 100;
                prev.tips = Math.round((prev.tips + s.tip) * 100) / 100;
                prev.count += 1;
                byStatusMap.set(key, prev);
            }
            const byStatus = Array.from(byStatusMap.values()).sort((a, b) => a.status.localeCompare(b.status));

            const pointsMap = new Map<string, FinancePoint>();
            for (const s of filtered) {
                const keyParts = parseDateKeyFromSessionTime(s.session_time);
                if (!keyParts) continue;

                const period =
                    mode === 'month'
                        ? `${keyParts.y}-${pad2(keyParts.m)}-${pad2(keyParts.d)}`
                        : `${keyParts.y}-${pad2(keyParts.m)}`;

                const prev = pointsMap.get(period) || { period, revenue: 0, tips: 0, expenses: 0, count: 0 };
                prev.revenue = Math.round((prev.revenue + s.paid) * 100) / 100;
                prev.tips = Math.round((prev.tips + s.tip) * 100) / 100;
                prev.count += 1;
                pointsMap.set(period, prev);
            }

            const expenses = await rpc<
                Array<{ id: string; expense_date: string; total_cents: number; is_refund: boolean }>
            >(supabase, 'admin_list_business_expenses_range', {
                p_start: startDate,
                p_end: endDate,
            });

            let expenseTotal = 0;
            let expenseCount = 0;

            for (const e of expenses || []) {
                const signed = (e.is_refund ? -1 : 1) * centsToDollars(e.total_cents);
                expenseTotal = Math.round((expenseTotal + signed) * 100) / 100;
                expenseCount += 1;

                const keyParts = parseDateKeyFromYmd(e.expense_date);
                if (!keyParts) continue;

                const period =
                    mode === 'month'
                        ? `${keyParts.y}-${pad2(keyParts.m)}-${pad2(keyParts.d)}`
                        : `${keyParts.y}-${pad2(keyParts.m)}`;

                const prev = pointsMap.get(period) || { period, revenue: 0, tips: 0, expenses: 0, count: 0 };
                prev.expenses = Math.round((prev.expenses + signed) * 100) / 100;
                pointsMap.set(period, prev);
            }

            const points = Array.from(pointsMap.values()).sort((a, b) => a.period.localeCompare(b.period));

            const totals = {
                revenue: totalsIncome.revenue,
                tips: totalsIncome.tips,
                expenses: expenseTotal,
                net: Math.round((totalsIncome.revenue + totalsIncome.tips - expenseTotal) * 100) / 100,
                sessionsCount: totalsIncome.count,
                expenseReceiptsCount: expenseCount,
            };

            const next: FinanceResponse = {
                ok: true,
                mode,
                year: normalizedYear,
                month: normalizedMonth,
                start,
                end,
                totals,
                byStatus,
                points,
            };

            setData(next);
        } catch (e: any) {
            setError(String(e?.message || 'Failed to load finances'));
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [mode, year, month, selectedLessonTypes, selectedStatuses]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const availableLessonTypes = lessonTypeOptions;

    const chartData = useMemo(() => {
        const pts = data?.points || [];
        return pts.map((p) => ({
            ...p,
            label: formatXAxisLabel(mode, p.period),
        }));
    }, [data, mode]);

    const revenueColor = theme.palette.primary.main;
    const tipsColor = theme.palette.success.main;
    const expensesColor = theme.palette.error.main;

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
                {admin.t('admin.finances.title', 'Finances')}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                {admin.t(
                    'admin.finances.subtitle',
                    'Revenue and tips from sessions, plus expenses from receipts.'
                )}
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {admin.t('admin.finances.mode', 'Range')}
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={mode}
                        onChange={(_, v) => {
                            const next = v as Mode | null;
                            if (next) setMode(next);
                        }}
                    >
                        <ToggleButton value="year">{admin.t('admin.finances.mode.year', 'Year')}</ToggleButton>
                        <ToggleButton value="month">{admin.t('admin.finances.mode.month', 'Month')}</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="fin-year-label">{admin.t('admin.finances.year', 'Year')}</InputLabel>
                    <Select
                        labelId="fin-year-label"
                        label={admin.t('admin.finances.year', 'Year')}
                        value={String(year)}
                        onChange={(e) => setYear(Number(e.target.value))}
                    >
                        {yearOptions.map((y) => (
                            <MenuItem key={y} value={String(y)}>
                                {y}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {mode === 'month' ? (
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="fin-month-label">{admin.t('admin.finances.month', 'Month')}</InputLabel>
                        <Select
                            labelId="fin-month-label"
                            label={admin.t('admin.finances.month', 'Month')}
                            value={String(month)}
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <MenuItem key={m} value={String(m)}>
                                    {String(m).padStart(2, '0')}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : null}

                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {admin.t('admin.finances.chartType', 'Chart')}
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={chartType}
                        onChange={(_, v) => {
                            const next = v as ChartType | null;
                            if (next) setChartType(next);
                        }}
                    >
                        <ToggleButton value="line">{admin.t('admin.finances.chartType.line', 'Line')}</ToggleButton>
                        <ToggleButton value="bar">{admin.t('admin.finances.chartType.bar', 'Bar')}</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel id="fin-lesson-type-label">{admin.t('admin.finances.lessonTypes', 'Lesson types')}</InputLabel>
                    <Select
                        multiple
                        labelId="fin-lesson-type-label"
                        label={admin.t('admin.finances.lessonTypes', 'Lesson types')}
                        value={selectedLessonTypes}
                        onChange={(e) => setSelectedLessonTypes(e.target.value as string[])}
                        renderValue={(selected) => {
                            if (!selected.length) return admin.t('admin.common.all', 'All');
                            const labelByKey = new Map(availableLessonTypes.map((o) => [o.key, o.label] as const));
                            return selected.map((k) => labelByKey.get(String(k)) || String(k)).join(', ');
                        }}
                    >
                        {availableLessonTypes.map((lt) => (
                            <MenuItem key={lt.key} value={lt.key}>
                                {lt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 280 }}>
                    <InputLabel id="fin-status-label">{admin.t('admin.finances.statuses', 'Statuses')}</InputLabel>
                    <Select
                        multiple
                        labelId="fin-status-label"
                        label={admin.t('admin.finances.statuses', 'Statuses')}
                        value={selectedStatuses}
                        onChange={(e) => setSelectedStatuses(e.target.value as LessonStatus[])}
                        renderValue={(selected) => {
                            if (!selected.length) return admin.t('admin.common.all', 'All');
                            const labelByValue = new Map(STATUS_OPTIONS.map((o) => [o.value, o.label] as const));
                            return selected.map((s) => labelByValue.get(s) || s).join(', ');
                        }}
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <MenuItem key={o.value} value={o.value}>
                                {o.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>{admin.t('admin.common.loading', 'Loading…')}</Typography>
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : data ? (
                <>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {admin.t('admin.finances.totalRevenue', 'Total revenue')}
                            </Typography>
                            <Typography variant="h6">{formatMoney(data.totals.revenue)}</Typography>
                        </Box>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {admin.t('admin.finances.totalTips', 'Total tips')}
                            </Typography>
                            <Typography variant="h6">{formatMoney(data.totals.tips)}</Typography>
                        </Box>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {admin.t('admin.finances.totalExpenses', 'Total expenses')}
                            </Typography>
                            <Typography variant="h6">{formatMoney(data.totals.expenses)}</Typography>
                        </Box>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {admin.t('admin.finances.net', 'Net')}
                            </Typography>
                            <Typography variant="h6">{formatMoney(data.totals.net)}</Typography>
                        </Box>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {admin.t('admin.finances.totalSessions', 'Sessions')}
                            </Typography>
                            <Typography variant="h6">{data.totals.sessionsCount}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {admin.t('admin.finances.expenseReceiptsCount', 'Expense receipts')}: {data.totals.expenseReceiptsCount}
                            </Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ height: 320, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1, mb: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' ? (
                                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: any, name: any) => {
                                            const n = Number(value);
                                            if (name === 'revenue' || name === 'tips' || name === 'expenses') return formatMoney(n);
                                            return String(value);
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Revenue" fill={revenueColor} />
                                    <Bar dataKey="tips" name="Tips" fill={tipsColor} />
                                    <Bar dataKey="expenses" name="Expenses" fill={expensesColor} />
                                </BarChart>
                            ) : (
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: any, name: any) => {
                                            const n = Number(value);
                                            if (name === 'revenue' || name === 'tips' || name === 'expenses') return formatMoney(n);
                                            return String(value);
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={revenueColor} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="tips" name="Tips" stroke={tipsColor} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke={expensesColor} strokeWidth={2} dot={false} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </Box>

                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            {admin.t('admin.finances.byStatus', 'Totals by status')}
                        </Typography>

                        {data.byStatus.length ? (
                            <Stack spacing={0.5}>
                                {data.byStatus.map((row) => (
                                    <Box
                                        key={row.status}
                                        sx={{
                                            display: 'flex',
                                            gap: 2,
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            borderTop: '1px solid',
                                            borderColor: 'divider',
                                            pt: 1,
                                        }}
                                    >
                                        <Typography sx={{ minWidth: 220 }}>{row.status}</Typography>
                                        <Typography sx={{ minWidth: 180 }}>{formatMoney(row.revenue)}</Typography>
                                        <Typography sx={{ minWidth: 160 }}>{formatMoney(row.tips)}</Typography>
                                        <Typography sx={{ minWidth: 120 }}>{row.count}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        ) : (
                            <Typography color="text.secondary">{admin.t('admin.finances.noData', 'No data for this range/filters.')}</Typography>
                        )}
                    </Box>
                </>
            ) : null}
        </Box>
    );
}
