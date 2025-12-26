'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Box, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import Hero from '@/components/Hero';
import GalleryCarousel from '@/components/GalleryCarousel';
import CmsRichTextRenderer from '@/components/CmsRichTextRenderer';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';
import { parseHomeSections, type CardGroupSourceKey, type HomeSectionMetaRow } from '@/lib/sections/parseHomeSections';
import useCmsPageBody from '@/hooks/useCmsPageBody';
import useContentBundle from '@/hooks/useContentBundle';

const TARGET_AUDIENCE_FALLBACK_IMAGES: string[] = [];

export default function HomeSectionsRenderer({ sections }: { sections: HomeSectionMetaRow[] }) {
    const parsed = React.useMemo(() => parseHomeSections(sections), [sections]);

    // Once we're in sections mode, bad rows are skipped and do NOT fall back to legacy.
    if (!parsed.length) return null;

    return (
        <ContentBundleProvider prefix="home.">
            <HomeSectionsInner sections={parsed} />
        </ContentBundleProvider>
    );
}

function HomeSectionsInner({
    sections,
}: {
    sections: Array<ReturnType<typeof parseHomeSections>[number]>;
}) {
    const locale = useLocale();
    const ctx = useContentBundleContext();
    const strings = ctx?.strings || {};
    const media = ctx?.media || [];

    const tDb = (key: string, fallback?: string) => {
        const v = strings[key];
        return typeof v === 'string' && v.trim().length > 0 ? v : fallback ?? '';
    };

    const mediaByKey = (slotKey: string) => media.find((m) => m?.slot_key === slotKey) || null;
    const mediaList = (slotKeyPrefix: string) =>
        [...media]
            .filter((m) => String(m?.slot_key || '').startsWith(slotKeyPrefix))
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

    const targetAudienceImages = (() => {
        const fromDb = mediaList('home.target_audience.').map((m) => m.url).filter(Boolean);
        return fromDb.length ? fromDb : TARGET_AUDIENCE_FALLBACK_IMAGES;
    })();

    const galleryCardImages = (() => {
        return mediaList('home.cards.gallery.images.').map((m) => m.url).filter(Boolean);
    })();

    const heroBg = mediaByKey('home.hero')?.url || '';
    const teamCardImage = mediaByKey('home.cards.team.image')?.url || '';
    const teamImageAlt = tDb('home.cards.team.imageAlt', 'Meet the team');

    const out: React.ReactNode[] = [];
    let i = 0;
    while (i < sections.length) {
        const s = sections[i];

        if (s.kind === 'hero') {
            out.push(
                <Hero
                    key={s.page_key}
                    title={tDb('home.hero.title', 'Learn to Surf at Sunset Surf Academy')}
                    subtitle={tDb(
                        'home.hero.subtitle',
                        'Professional surf instruction in the beautiful waters of Rincón, Puerto Rico'
                    )}
                    backgroundUrl={heroBg || undefined}
                    primaryAction={tDb('home.hero.primaryAction', 'Book Your Lesson')}
                    secondaryAction={tDb('home.hero.secondaryAction', 'Learn More')}
                    primaryHref={`/${locale}/book`}
                    secondaryHref={`/${locale}/mission_statement`}
                    cmsKeyBase="home.hero"
                />
            );
            i += 1;
            continue;
        }

        if (s.kind === 'card_group') {
            const group: Array<{ page_key: string; sourceKey: CardGroupSourceKey }> = [];
            while (i < sections.length && sections[i].kind === 'card_group') {
                const s2 = sections[i];
                if (s2.kind === 'card_group') {
                    group.push({ page_key: s2.page_key, sourceKey: s2.sourceKey });
                }
                i += 1;
            }

            if (group.length) {
                out.push(
                    <Container key={group[0].page_key} maxWidth="lg" sx={{ py: 8 }}>
                        <Grid container spacing={4}>
                            {group.map((g) => (
                                <Grid key={g.page_key} item xs={12} md={4}>
                                    <CardGroupCard
                                        locale={locale}
                                        sourceKey={g.sourceKey}
                                        tDb={tDb}
                                        targetAudienceImages={targetAudienceImages}
                                        galleryCardImages={galleryCardImages}
                                        teamCardImage={teamCardImage}
                                        teamImageAlt={teamImageAlt}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                );
            }

            continue;
        }

        if (s.kind === 'rich_text') {
            out.push(<HomeRichTextBlock key={s.page_key} bodyKey={s.bodyKey} locale={locale} />);
            i += 1;
            continue;
        }

        if (s.kind === 'media') {
            out.push(<HomeMediaBlock key={s.page_key} sectionId={s.id} slotKey={s.slotKey} />);
            i += 1;
            continue;
        }

        i += 1;
    }

    return <>{out}</>;
}

function HomeMediaBlock({ sectionId, slotKey }: { sectionId: string; slotKey: string }) {
    // Pull section-scoped media via the existing public content bundle route.
    const b = useContentBundle(`section.${sectionId}.`);
    if (b.loading) return null;

    const item = b.mediaByKey(slotKey);
    if (!item?.url) return null;

    const isVideo = item.asset_type === 'video';

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            {isVideo ? (
                <Box
                    component="video"
                    controls
                    sx={{ width: '100%', borderRadius: 2, background: 'hsl(var(--background))' }}
                    src={item.url}
                />
            ) : (
                <Box
                    component="img"
                    sx={{ width: '100%', height: 'auto', borderRadius: 2 }}
                    src={item.url}
                    alt={item.title || ''}
                />
            )}
        </Container>
    );
}

function HomeRichTextBlock({ bodyKey, locale }: { bodyKey: string; locale: string }) {
    const { body, loading } = useCmsPageBody(bodyKey, locale, true);
    if (loading) return null;
    if (!body) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <CmsRichTextRenderer json={body} />
        </Container>
    );
}

function CardGroupCard(props: {
    locale: string;
    sourceKey: CardGroupSourceKey;
    tDb: (key: string, fallback?: string) => string;
    targetAudienceImages: string[];
    galleryCardImages: string[];
    teamCardImage: string;
    teamImageAlt: string;
}) {
    const { locale, sourceKey, tDb, targetAudienceImages, galleryCardImages, teamCardImage, teamImageAlt } = props;

    const href =
        sourceKey === 'home.cards.lessons'
            ? `/${locale}/lessons`
            : sourceKey === 'home.cards.gallery'
                ? `/${locale}/gallery`
                : `/${locale}/team`;

    const fallbackTitle =
        sourceKey === 'home.cards.lessons'
            ? 'Surf Lessons'
            : sourceKey === 'home.cards.gallery'
                ? 'Experience the Journey'
                : 'Meet the Team';

    const fallbackDescription =
        sourceKey === 'home.cards.lessons'
            ? 'From beginner-friendly sessions to advanced coaching'
            : sourceKey === 'home.cards.gallery'
                ? 'Watch videos and see photos from our surf adventures'
                : 'Get to know the coaches who make Sunset Surf Academy special';

    const mediaBlock =
        sourceKey === 'home.cards.lessons' ? (
            <GalleryCarousel images={targetAudienceImages} mode="ordered" />
        ) : sourceKey === 'home.cards.gallery' ? (
            <GalleryCarousel images={galleryCardImages} mode="ordered" />
        ) : teamCardImage ? (
            <Box
                component="img"
                sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 3,
                }}
                src={teamCardImage}
                alt={teamImageAlt}
            />
        ) : (
            <Box sx={{ height: 200, borderRadius: 2, mb: 3, background: 'hsl(var(--background))' }} />
        );

    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <Card
                sx={{
                    height: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(32, 178, 170, 0.3)',
                    },
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 3 }}>{mediaBlock}</Box>

                    <Typography variant="h5" gutterBottom color="#20B2AA">
                        {tDb(`${sourceKey}.title`, fallbackTitle)}
                    </Typography>

                    <Typography variant="body1">{tDb(`${sourceKey}.description`, fallbackDescription)}</Typography>
                </CardContent>
            </Card>
        </Link>
    );
}
