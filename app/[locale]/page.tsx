"use client";

import * as React from 'react';
import { useLocale } from 'next-intl';
import Hero from '../../components/Hero';
import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import GalleryCarousel from '../../components/GalleryCarousel';
import Link from 'next/link';
import EditableInlineText from '@/components/admin/edit/EditableInlineText';
import ContentBundleProvider from '@/components/content/ContentBundleContext';
import { useContentBundleContext } from '@/components/content/ContentBundleContext';
import { useCmsStringValue } from '@/hooks/useCmsStringValue';
import { hasSectionsForPage } from '@/lib/sections/types';
import HomeSectionsRenderer from '@/components/sections/HomeSectionsRenderer';
import type { HomeSectionMetaRow } from '@/lib/sections/parseHomeSections';

const TARGET_AUDIENCE_FALLBACK_IMAGES: string[] = [];

type ParsedHomeSection = {
  id: string;
  page_key: string;
  sort: number;
  kind: string;
  meta: unknown;
};

type CardGroupSourceKey = 'home.cards.lessons' | 'home.cards.gallery' | 'home.cards.team';
type CardGroupVariant = 'default';

type CardGroupSectionMeta = {
  kind: 'card_group';
  sourceKey: CardGroupSourceKey;
  variant?: CardGroupVariant;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function safeJsonParse<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

function parseSectionIdFromMetaKey(pageKey: string): string | null {
  const m = /^section\.([^.]+)\.meta$/.exec(String(pageKey || ''));
  return m?.[1] ?? null;
}

function isCardGroupSourceKey(value: unknown): value is CardGroupSourceKey {
  return value === 'home.cards.lessons' || value === 'home.cards.gallery' || value === 'home.cards.team';
}

function isCardGroupVariant(value: unknown): value is CardGroupVariant {
  return value === 'default';
}

// Runtime guard + backward-compat parser.
// Accepts both:
// - New shape: { kind:'card_group', sourceKey, variant? }
// - Legacy shape: { kind:'card_group', fields:{ sourceKey, variant? } }
function parseCardGroupSectionMeta(meta: unknown): CardGroupSectionMeta | null {
  if (!isObject(meta)) return null;
  if (meta.kind !== 'card_group') return null;

  const sourceKeyRaw = (meta as any).sourceKey ?? (meta as any)?.fields?.sourceKey;
  if (!isCardGroupSourceKey(sourceKeyRaw)) return null;

  const variantRaw = (meta as any).variant ?? (meta as any)?.fields?.variant;
  const variant = isCardGroupVariant(variantRaw) ? variantRaw : undefined;

  return {
    kind: 'card_group',
    sourceKey: sourceKeyRaw,
    ...(variant ? { variant } : {}),
  };
}

function parseHomeSections(rows: HomeSectionMetaRow[]): ParsedHomeSection[] {
  const parsed: ParsedHomeSection[] = [];

  for (const row of rows) {
    const id = parseSectionIdFromMetaKey(row.page_key);
    if (!id) continue;

    const meta = safeJsonParse<unknown>(row.body_en);
    if (!meta || !isObject(meta)) continue;

    const kind = (meta as any).kind;
    if (typeof kind !== 'string' || !kind) continue;

    parsed.push({
      id,
      page_key: String(row.page_key || ''),
      sort: typeof row.sort === 'number' ? row.sort : 0,
      kind,
      meta,
    });
  }

  parsed.sort((a, b) => (a.sort - b.sort) || a.page_key.localeCompare(b.page_key));
  return parsed;
}

let cachedHomeSectionsMeta: HomeSectionMetaRow[] | null = null;
let inflightHomeSectionsMeta: Promise<HomeSectionMetaRow[]> | null = null;

async function fetchHomeSectionsMeta(): Promise<HomeSectionMetaRow[]> {
  if (cachedHomeSectionsMeta) return cachedHomeSectionsMeta;
  if (inflightHomeSectionsMeta) return inflightHomeSectionsMeta;

  inflightHomeSectionsMeta = (async () => {
    const res = await fetch('/api/home-sections-meta', { method: 'GET' });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) {
      cachedHomeSectionsMeta = [];
      return cachedHomeSectionsMeta;
    }

    const items = Array.isArray(body?.items) ? (body.items as any[]) : [];
    cachedHomeSectionsMeta = items.map((r) => ({
      page_key: String(r?.page_key || ''),
      body_en: r?.body_en ?? null,
      sort: typeof r?.sort === 'number' ? r.sort : null,
    }));
    return cachedHomeSectionsMeta;
  })().finally(() => {
    inflightHomeSectionsMeta = null;
  });

  return inflightHomeSectionsMeta;
}

function useHomeSectionsMeta() {
  const [sections, setSections] = React.useState<HomeSectionMetaRow[] | null>(cachedHomeSectionsMeta);

  React.useEffect(() => {
    let cancelled = false;
    if (cachedHomeSectionsMeta) {
      setSections(cachedHomeSectionsMeta);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      const next = await fetchHomeSectionsMeta();
      if (cancelled) return;
      setSections(next);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return sections;
}

export default function HomePage() {
  const sections = useHomeSectionsMeta();

  if (hasSectionsForPage(sections as any)) {
    return <HomeSectionsRenderer sections={sections as HomeSectionMetaRow[]} />;
  }

  return <LegacyHome />;
}

function LegacyHome() {
  return (
    <ContentBundleProvider prefix="home.">
      <HomeInner />
    </ContentBundleProvider>
  );
}

function HomeInner() {
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

  const teamImageAlt = useCmsStringValue('home.cards.team.imageAlt', 'Meet the team').value;

  return (
    <>
      <Hero
        title={tDb('home.hero.title', 'Learn to Surf at Sunset Surf Academy')}
        subtitle={tDb('home.hero.subtitle', 'Professional surf instruction in the beautiful waters of Rincón, Puerto Rico')}
        backgroundUrl={heroBg || undefined}
        primaryAction={tDb('home.hero.primaryAction', 'Book Your Lesson')}
        secondaryAction={tDb('home.hero.secondaryAction', 'Learn More')}
        primaryHref={`/${locale}/book`}
        secondaryHref={`/${locale}/mission_statement`}
        cmsKeyBase="home.hero"
      />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom color="#20B2AA">
            <EditableInlineText cmsKey="home.aboutPreview" fallback={'Learn from some of the best surfers in the world.'}>
              {(v) => <>{v}</>}
            </EditableInlineText>
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Link href={`/${locale}/lessons`} style={{ textDecoration: 'none' }}>
              <Card sx={{
                height: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(32, 178, 170, 0.3)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Lessons card: show carousel of /target_audiance images */}
                  <Box sx={{ mb: 3 }}>
                    <GalleryCarousel
                      images={targetAudienceImages}
                      mode="ordered"
                    />
                  </Box>
                  <Typography variant="h5" gutterBottom color="#20B2AA">
                    <EditableInlineText cmsKey="home.cards.lessons.title" fallback={'Surf Lessons'}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText cmsKey="home.cards.lessons.description" fallback={'From beginner-friendly sessions to advanced coaching'} multiline fullWidth>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>

          <Grid item xs={12} md={4}>
            <Link href={`/${locale}/gallery`} style={{ textDecoration: 'none' }}>
              <Card sx={{
                height: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(32, 178, 170, 0.3)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    <GalleryCarousel images={galleryCardImages} mode="ordered" />
                  </Box>
                  <Typography variant="h5" gutterBottom color="#20B2AA">
                    <EditableInlineText cmsKey="home.cards.gallery.title" fallback={'Experience the Journey'}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText cmsKey="home.cards.gallery.description" fallback={'Watch videos and see photos from our surf adventures'} multiline fullWidth>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>

          <Grid item xs={12} md={4}>
            <Link href={`/${locale}/team`} style={{ textDecoration: 'none' }}>
              <Card sx={{
                height: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(32, 178, 170, 0.3)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  {teamCardImage ? (
                    <Box
                      component="img"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 2,
                        mb: 3
                      }}
                      src={teamCardImage}
                      alt={teamImageAlt}
                    />
                  ) : (
                    <Box sx={{ height: 200, borderRadius: 2, mb: 3, background: 'hsl(var(--background))' }} />
                  )}
                  <Typography variant="h5" gutterBottom color="#20B2AA">
                    <EditableInlineText cmsKey="home.cards.team.title" fallback={'Meet the Team'}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText cmsKey="home.cards.team.description" fallback={'Get to know the coaches who make Sunset Surf Academy special'} multiline fullWidth>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}