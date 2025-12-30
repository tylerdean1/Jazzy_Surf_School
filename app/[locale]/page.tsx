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
import { hasSectionsForPage } from '@/lib/sections/types';
import HomeSectionsRenderer from '@/components/sections/HomeSectionsRenderer';
import type { HomeSectionMetaRow } from '@/lib/sections/parseHomeSections';
import PageSectionsRenderer from '@/components/sections/PageSectionsRenderer';
import usePageSections from '@/hooks/usePageSections';

const TARGET_AUDIENCE_FALLBACK_IMAGES: string[] = [];
const FALLBACK_COPY = 'Content unavailable';

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
  const pageSections = usePageSections('home');
  const sections = useHomeSectionsMeta();

  // Prefer the new universal system if we have published page_sections for home.
  if (Array.isArray(pageSections.sections) && pageSections.sections.length > 0) {
    return <PageSectionsRenderer pageKey="home" sections={pageSections.sections} />;
  }

  if (hasSectionsForPage(sections as any)) {
    return <HomeSectionsRenderer sections={sections as HomeSectionMetaRow[]} />;
  }

  return <LegacyHome />;
}

function LegacyHome() {
  return (
    <ContentBundleProvider prefix="page.home." mediaPrefix="home.">
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

  const teamImageAlt = tDb('page.home.cards.team.imageAlt', FALLBACK_COPY);

  const primaryHref = tDb('page.home.hero.primaryHref', '#');
  const secondaryHref = tDb('page.home.hero.secondaryHref', '#');

  return (
    <>
      <Hero
        title={tDb('page.home.hero.title', FALLBACK_COPY)}
        subtitle={tDb('page.home.hero.subtitle', FALLBACK_COPY)}
        backgroundUrl={heroBg || undefined}
        primaryAction={tDb('page.home.hero.primaryAction', FALLBACK_COPY)}
        secondaryAction={tDb('page.home.hero.secondaryAction', FALLBACK_COPY)}
        primaryHref={primaryHref}
        secondaryHref={secondaryHref}
        cmsKeyBase="page.home.hero"
      />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" gutterBottom color="#20B2AA">
            <EditableInlineText cmsKey="page.home.aboutPreview" fallback={FALLBACK_COPY}>
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
                    <EditableInlineText cmsKey="page.home.cards.lessons.title" fallback={FALLBACK_COPY}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText
                      cmsKey="page.home.cards.lessons.description"
                      fallback={FALLBACK_COPY}
                      multiline
                      fullWidth
                    >
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
                    <EditableInlineText cmsKey="page.home.cards.gallery.title" fallback={FALLBACK_COPY}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText
                      cmsKey="page.home.cards.gallery.description"
                      fallback={FALLBACK_COPY}
                      multiline
                      fullWidth
                    >
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
                    <EditableInlineText cmsKey="page.home.cards.team.title" fallback={FALLBACK_COPY}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText
                      cmsKey="page.home.cards.team.description"
                      fallback={FALLBACK_COPY}
                      multiline
                      fullWidth
                    >
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
