"use client";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Hero from '../../components/Hero';
import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import GalleryCarousel from '../../components/GalleryCarousel';
import Link from 'next/link';
import EditableInlineText from '@/components/admin/edit/EditableInlineText';
import ContentBundleProvider from '@/components/content/ContentBundleContext';
import { useContentBundleContext } from '@/components/content/ContentBundleContext';

const TARGET_AUDIENCE_FALLBACK_IMAGES: string[] = [];

export default function HomePage() {
  return (
    <ContentBundleProvider prefix="home.">
      <HomeInner />
    </ContentBundleProvider>
  );
}

function HomeInner() {
  const t = useTranslations('home');
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

  return (
    <>
      <Hero
        title={tDb('home.heroTitle', t('heroTitle'))}
        subtitle={tDb('home.heroSubtitle', t('heroSubtitle'))}
        backgroundUrl={heroBg || undefined}
        primaryAction={t('bookNow')}
        secondaryAction={t('learnMore')}
        primaryHref={`/${locale}/book`}
        secondaryHref={`/${locale}/mission_statement`}
        cmsKeyBase="home.hero"
      />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom color="#20B2AA">
            <EditableInlineText cmsKey="home.aboutPreview" fallback={t('aboutPreview')}>
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
                    <EditableInlineText cmsKey="home.cards.lessons.title" fallback={t('lessonsTitle')}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText cmsKey="home.cards.lessons.description" fallback={t('lessonsDescription')} multiline fullWidth>
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
                    <EditableInlineText cmsKey="home.cards.gallery.title" fallback={t('galleryTitle')}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText cmsKey="home.cards.gallery.description" fallback={t('galleryDescription')} multiline fullWidth>
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
                      alt="Meet the team"
                    />
                  ) : (
                    <Box sx={{ height: 200, borderRadius: 2, mb: 3, background: 'hsl(var(--background))' }} />
                  )}
                  <Typography variant="h5" gutterBottom color="#20B2AA">
                    <EditableInlineText cmsKey="home.cards.team.title" fallback={t('teamTitle')}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  </Typography>
                  <Typography variant="body1">
                    <EditableInlineText cmsKey="home.cards.team.description" fallback={t('teamDescription')} multiline fullWidth>
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