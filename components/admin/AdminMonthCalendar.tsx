'use client';

import React, { useMemo, useState } from 'react';
import {
    Badge,
    Box,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function ymdFromParts(year: number, month1: number, day: number) {
    return `${year}-${pad2(month1)}-${pad2(day)}`;
}

function formatYmdToMdy(ymd: string) {
    const m = String(ymd || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return String(ymd || '');
    return `${m[2]}-${m[3]}-${m[1]}`;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type AdminMonthCalendarProps<T> = {
    title?: string;
    legendItems?: Array<{ label: string; color: string }>;
    items: T[];
    getItemDateYmd: (item: T) => string | null | undefined;
    getItemStatusKey: (item: T) => string;
    getStatusPriority: (statusKey: string) => number;
    getStatusColor: (statusKey: string) => string; // e.g. 'success.main'
    getItemTitle: (item: T) => string;
    getItemSubtitle?: (item: T) => string;

    selectedDateYmd?: string;
    onSelectDateYmd?: (ymd: string) => void;

    initialYear?: number;
    initialMonthIndex?: number; // 0-11
};

export default function AdminMonthCalendar<T>(props: AdminMonthCalendarProps<T>) {
    const now = new Date();
    const [year, setYear] = useState<number>(props.initialYear ?? now.getFullYear());
    const [monthIndex, setMonthIndex] = useState<number>(props.initialMonthIndex ?? now.getMonth());

    const dateMap = useMemo(() => {
        const map = new Map<string, T[]>();
        for (const item of props.items) {
            const d = props.getItemDateYmd(item);
            if (!d) continue;
            const key = String(d);
            const arr = map.get(key);
            if (arr) arr.push(item);
            else map.set(key, [item]);
        }
        return map;
    }, [props.items, props.getItemDateYmd]);

    const yearOptions = useMemo(() => {
        const years = new Set<number>();
        years.add(now.getFullYear() - 1);
        years.add(now.getFullYear());
        years.add(now.getFullYear() + 1);

        for (const item of props.items) {
            const d = props.getItemDateYmd(item);
            if (!d) continue;
            const m = String(d).match(/^(\d{4})-/);
            if (m) years.add(Number(m[1]));
        }

        return Array.from(years).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
    }, [props.items, props.getItemDateYmd]);

    const firstDayIndex = useMemo(() => {
        const first = new Date(year, monthIndex, 1);
        return first.getDay();
    }, [year, monthIndex]);

    const daysInMonth = useMemo(() => {
        return new Date(year, monthIndex + 1, 0).getDate();
    }, [year, monthIndex]);

    const cells: Array<{ ymd: string; day: number; items: T[] }> = useMemo(() => {
        const out: Array<{ ymd: string; day: number; items: T[] }> = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const ymd = ymdFromParts(year, monthIndex + 1, d);
            out.push({ ymd, day: d, items: dateMap.get(ymd) || [] });
        }
        return out;
    }, [daysInMonth, year, monthIndex, dateMap]);

    const goPrevMonth = () => {
        setMonthIndex((prev) => {
            if (prev === 0) {
                setYear((y) => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };

    const goNextMonth = () => {
        setMonthIndex((prev) => {
            if (prev === 11) {
                setYear((y) => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };

    const renderTooltip = (ymd: string, list: T[]) => {
        if (!list.length) return null;
        const enriched = list
            .map((item) => {
                const status = props.getItemStatusKey(item);
                return {
                    item,
                    status,
                    priority: props.getStatusPriority(status),
                    color: props.getStatusColor(status),
                    title: props.getItemTitle(item),
                    subtitle: props.getItemSubtitle?.(item) || '',
                };
            })
            .sort((a, b) => a.priority - b.priority);

        return (
            <Box sx={{ minWidth: 260, maxWidth: 360, maxHeight: 280, overflow: 'auto', p: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatYmdToMdy(ymd)}
                </Typography>
                <Stack spacing={0.75}>
                    {enriched.map((x, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: 99, bgcolor: x.color, flex: '0 0 auto', mt: '5px' }} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ lineHeight: 1.25 }}>
                                    {x.title}
                                </Typography>
                                {x.subtitle ? (
                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                        {x.subtitle}
                                    </Typography>
                                ) : null}
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    };

    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {props.title || 'Calendar'}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton aria-label="Previous month" onClick={goPrevMonth} size="small">
                        <ChevronLeft />
                    </IconButton>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="admin-calendar-month">Month</InputLabel>
                        <Select
                            labelId="admin-calendar-month"
                            label="Month"
                            value={monthIndex}
                            onChange={(e) => setMonthIndex(Number(e.target.value))}
                        >
                            {MONTH_NAMES.map((name, idx) => (
                                <MenuItem key={name} value={idx}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 110 }}>
                        <InputLabel id="admin-calendar-year">Year</InputLabel>
                        <Select labelId="admin-calendar-year" label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            {yearOptions.map((y) => (
                                <MenuItem key={y} value={y}>
                                    {y}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <IconButton aria-label="Next month" onClick={goNextMonth} size="small">
                        <ChevronRight />
                    </IconButton>
                </Stack>
            </Stack>

            {props.legendItems && props.legendItems.length ? (
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {props.legendItems.map((li) => (
                            <Box key={li.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: 99, bgcolor: li.color }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    {li.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            ) : null}

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {WEEKDAYS.map((w) => (
                    <Box key={w} sx={{ px: 1, pb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            {w}
                        </Typography>
                    </Box>
                ))}

                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <Box key={`pad-${idx}`} />
                ))}

                {cells.map((c) => {
                    const total = c.items.length;
                    const isSelected = Boolean(props.selectedDateYmd && props.selectedDateYmd === c.ymd);

                    const statusCounts = new Map<string, number>();
                    for (const item of c.items) {
                        const st = props.getItemStatusKey(item);
                        statusCounts.set(st, (statusCounts.get(st) || 0) + 1);
                    }

                    const orderedStatuses = Array.from(statusCounts.keys()).sort(
                        (a, b) => props.getStatusPriority(a) - props.getStatusPriority(b)
                    );
                    const topStatus = orderedStatuses[0];
                    const topColor = topStatus ? props.getStatusColor(topStatus) : 'transparent';

                    const tooltipContent = renderTooltip(c.ymd, c.items);
                    const click = () => {
                        if (props.onSelectDateYmd) props.onSelectDateYmd(c.ymd);
                    };

                    const cellBody = (
                        <Box
                            onClick={total ? click : undefined}
                            role={total ? 'button' : undefined}
                            tabIndex={total ? 0 : -1}
                            onKeyDown={
                                total
                                    ? (e) => {
                                        if (e.key === 'Enter' || e.key === ' ') click();
                                    }
                                    : undefined
                            }
                            sx={{
                                border: '1px solid',
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                minHeight: 84,
                                p: 1,
                                cursor: total ? 'pointer' : 'default',
                                position: 'relative',
                                bgcolor: total ? 'action.hover' : 'transparent',
                                '&:hover': total ? { bgcolor: 'action.selected' } : undefined,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    {c.day}
                                </Typography>

                                {total ? (
                                    <Badge
                                        color="primary"
                                        badgeContent={total}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: 10,
                                                height: 18,
                                                minWidth: 18,
                                            },
                                        }}
                                    />
                                ) : null}
                            </Box>

                            {total ? (
                                <Box sx={{ position: 'absolute', left: 6, top: 24, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {orderedStatuses.slice(0, 3).map((st) => (
                                        <Box
                                            key={st}
                                            sx={{ width: 8, height: 10, borderRadius: 1, bgcolor: props.getStatusColor(st) }}
                                        />
                                    ))}
                                </Box>
                            ) : null}

                            {total ? (
                                <Box sx={{ position: 'absolute', right: 8, bottom: 6, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: 99, bgcolor: topColor }} />
                                    {orderedStatuses.length > 1 ? (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                            +{orderedStatuses.length - 1}
                                        </Typography>
                                    ) : null}
                                </Box>
                            ) : null}
                        </Box>
                    );

                    return tooltipContent ? (
                        <Tooltip key={c.ymd} title={tooltipContent} placement="right" arrow enterDelay={250}>
                            <Box>{cellBody}</Box>
                        </Tooltip>
                    ) : (
                        <Box key={c.ymd}>{cellBody}</Box>
                    );
                })}
            </Box>
        </Box>
    );
}
