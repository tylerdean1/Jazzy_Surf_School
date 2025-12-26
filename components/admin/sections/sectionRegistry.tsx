/**
 * ADMIN-ONLY: do not import from public routes/components.
 */

'use client';

import * as React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import GalleryCarousel from '@/components/GalleryCarousel';
import { useContentBundleContext } from '@/components/content/ContentBundleContext';
import type { CardGroupSectionMeta, CardGroupSourceKey, CardGroupVariant } from './sectionMeta';

function isObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object';
}

function isCardGroupSourceKey(value: unknown): value is CardGroupSourceKey {
    return value === 'home.cards.lessons' || value === 'home.cards.gallery' || value === 'home.cards.team';
}

function isCardGroupVariant(value: unknown): value is CardGroupVariant {
    return value === 'default';
}

/**
 * Runtime guard + backward-compat parser.
 * Accepts both:
 * - New shape: { kind:'card_group', sourceKey, variant? }
 * - Legacy shape (Phase 4 commit 2): { kind:'card_group', fields:{ sourceKey, variant? } }
 */
export function parseCardGroupSectionMeta(meta: unknown): CardGroupSectionMeta | null {
    if (!isObject(meta)) return null;
    if (meta.kind !== 'card_group') return null;

    const sourceKeyRaw = (meta as any).sourceKey ?? (meta as any)?.fields?.sourceKey;
    if (!isCardGroupSourceKey(sourceKeyRaw)) return null;

    const variantRaw = (meta as any).variant ?? (meta as any)?.fields?.variant;
    const variant = isCardGroupVariant(variantRaw) ? variantRaw : undefined;

    const versionRaw = (meta as any).version;
    const sortRaw = (meta as any).sort;
    const ownerRaw = (meta as any).owner;

    return {
        version: typeof versionRaw === 'number' ? versionRaw : 1,
        kind: 'card_group',
        sourceKey: sourceKeyRaw,
        ...(variant ? { variant } : {}),
        ...(typeof sortRaw === 'number' ? { sort: sortRaw } : {}),
        ...(ownerRaw ? { owner: ownerRaw } : {}),
    };
}

export function AdminSectionPreview({ meta }: { meta: unknown }) {
    const parsed = parseCardGroupSectionMeta(meta);
    if (parsed) return <CardGroupSectionPreview meta={parsed} />;
    return null;
}

function CardGroupSectionPreview({ meta }: { meta: CardGroupSectionMeta }) {
    const ctx = useContentBundleContext();
    const strings = ctx?.strings || {};
    const media = ctx?.media || [];

    const tDb = (key: string, fallback: string) => {
        const v = strings[key];
        return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
    };

    const mediaByKey = (slotKey: string) => media.find((m) => m?.slot_key === slotKey) || null;
    const mediaList = (slotKeyPrefix: string) =>
        [...media]
            .filter((m) => String(m?.slot_key || '').startsWith(slotKeyPrefix))
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

    const titleKey = `${meta.sourceKey}.title`;
    const descKey = `${meta.sourceKey}.description`;

    const titleFallback =
        meta.sourceKey === 'home.cards.lessons'
            ? 'Surf Lessons'
            : meta.sourceKey === 'home.cards.gallery'
              ? 'Experience the Journey'
              : 'Meet the Team';

    const descFallback =
        meta.sourceKey === 'home.cards.lessons'
            ? 'From beginner-friendly sessions to advanced coaching'
            : meta.sourceKey === 'home.cards.gallery'
              ? 'Watch videos and see photos from our surf adventures'
              : 'Get to know the coaches who make Sunset Surf Academy special';

    const title = tDb(titleKey, titleFallback);
    const description = tDb(descKey, descFallback);

    const lessonsImages = mediaList('home.target_audience.').map((m) => m.url).filter(Boolean);
    const galleryImages = mediaList('home.cards.gallery.images.').map((m) => m.url).filter(Boolean);

    const teamImage = mediaByKey('home.cards.team.image')?.url || '';
    const teamAlt = tDb('home.cards.team.imageAlt', 'Meet the team');

    const mediaBlock =
        meta.sourceKey === 'home.cards.lessons' ? (
            <GalleryCarousel images={lessonsImages} mode="ordered" />
        ) : meta.sourceKey === 'home.cards.gallery' ? (
            <GalleryCarousel images={galleryImages} mode="ordered" />
        ) : teamImage ? (
            <Box
                component="img"
                src={teamImage}
                alt={teamAlt}
                sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 1 }}
            />
        ) : (
            <Box sx={{ width: '100%', height: 200, borderRadius: 1, bgcolor: 'background.default' }} />
        );

    return (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Typography variant="overline" color="text.secondary">
                Cards block ({meta.sourceKey})
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'grid', gap: 1.5 }}>
                            <Box sx={{ minHeight: 120 }}>{mediaBlock}</Box>
                            <Typography variant="h6">{title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {description}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
