'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Box, Container, Grid } from '@mui/material';
import Hero from '@/components/Hero';
import CmsRichTextRenderer from '@/components/CmsRichTextRenderer';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';
import { CardGroupCard } from '@/components/sections/HomeSectionsRenderer';

type LocaleTab = 'en' | 'es';

type CardGroupSourceKey = 'home.cards.lessons' | 'home.cards.gallery' | 'home.cards.team';

type StagedSection = {
    localId: string;
    sectionId: string | null;
    kind: 'hero' | 'richText' | 'card_group' | 'media';
    sort: number;

    // card_group
    cardGroupSourceKey: CardGroupSourceKey | '';

    // richText (TipTap JSON string)
    richTextEn: string;
    richTextEs: string;

    // media
    mediaUrl: string;
    mediaSelection: { bucket: string | null; path: string | null } | null;

    deleted: boolean;
};

const TARGET_AUDIENCE_FALLBACK_IMAGES: string[] = [];

function isProbablyVideoPath(path: string): boolean {
    const p = path.toLowerCase();
    return p.endsWith('.mp4') || p.endsWith('.webm') || p.endsWith('.ogg') || p.endsWith('.mov');
}

export default function HomeSectionsPreviewRenderer(props: { sections: StagedSection[]; localeTab: LocaleTab }) {
    const visible = React.useMemo(() => props.sections.filter((s) => !s.deleted), [props.sections]);

    if (!visible.length) return null;

    // Use the same Home prefix bundle as the public renderer, so card_groups + hero preview match.
    return (
        <ContentBundleProvider prefix="home.">
            <HomeSectionsPreviewInner sections={visible} localeTab={props.localeTab} />
        </ContentBundleProvider>
    );
}

function HomeSectionsPreviewInner({ sections, localeTab }: { sections: StagedSection[]; localeTab: LocaleTab }) {
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
                    key={s.sectionId || s.localId}
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
            const group: Array<{ key: string; sourceKey: CardGroupSourceKey }> = [];
            while (i < sections.length && sections[i].kind === 'card_group') {
                const s2 = sections[i];
                const key = String(s2.sectionId || s2.localId);
                const raw = s2.cardGroupSourceKey;
                if (raw === 'home.cards.lessons' || raw === 'home.cards.gallery' || raw === 'home.cards.team') {
                    group.push({ key, sourceKey: raw });
                }
                i += 1;
            }

            if (group.length) {
                out.push(
                    <Container key={group[0].key} maxWidth="lg" sx={{ py: 8 }}>
                        <Grid container spacing={4}>
                            {group.map((g) => (
                                <Grid key={g.key} item xs={12} md={4}>
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

        if (s.kind === 'richText') {
            const json = localeTab === 'es' && s.richTextEs.trim() ? s.richTextEs : s.richTextEn;
            out.push(
                <Container key={s.sectionId || s.localId} maxWidth="lg" sx={{ py: 8 }}>
                    {json ? <CmsRichTextRenderer json={json} /> : null}
                </Container>
            );
            i += 1;
            continue;
        }

        if (s.kind === 'media') {
            const url = s.mediaUrl || '';
            const path = String(s.mediaSelection?.path || '');
            const isVideo = !!url && !!path && isProbablyVideoPath(path);

            out.push(
                <Container key={s.sectionId || s.localId} maxWidth="lg" sx={{ py: 8 }}>
                    {url ? (
                        isVideo ? (
                            <Box
                                component="video"
                                controls
                                sx={{ width: '100%', borderRadius: 2, background: 'hsl(var(--background))' }}
                                src={url}
                            />
                        ) : (
                            <Box component="img" sx={{ width: '100%', height: 'auto', borderRadius: 2 }} src={url} alt="" />
                        )
                    ) : null}
                </Container>
            );
            i += 1;
            continue;
        }

        i += 1;
    }

    return <>{out}</>;
}
