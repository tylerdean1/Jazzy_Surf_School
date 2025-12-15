"use client";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Hero from '../../components/Hero';
import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import GalleryCarousel from '../../components/GalleryCarousel';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <>
      <Hero
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        primaryAction={t('bookNow')}
        secondaryAction={t('learnMore')}
        primaryHref={`/${locale}/book`}
        secondaryHref={`/${locale}/mission_statement`}
      />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom color="#20B2AA">
            {t('aboutPreview')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Link href={`/${locale}/book`} style={{ textDecoration: 'none' }}>
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
                      images={[
                        '/target_audiance/prices.png',
                        '/target_audiance/1.png',
                        '/target_audiance/2.png',
                        '/target_audiance/3.png',
                        '/target_audiance/4.png',
                        '/target_audiance/5.png'
                      ]}
                      height={200}
                    />
                  </Box>
                  <Typography variant="h5" gutterBottom color="#20B2AA">
                    {t('lessonsTitle')}
                  </Typography>
                  <Typography variant="body1">
                    {t('lessonsDescription')}
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
                    <GalleryCarousel />
                  </Box>
                  <Typography variant="h5" gutterBottom color="#20B2AA">
                    {t('galleryTitle')}
                  </Typography>
                  <Typography variant="body1">
                    {t('galleryDescription')}
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
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 3
                    }}
                    src="/about_me/isasilver.png"
                    alt="Meet the team"
                  />
                  <Typography variant="h5" gutterBottom color="#20B2AA">
                    {t('teamTitle')}
                  </Typography>
                  <Typography variant="body1">
                    {t('teamDescription')}
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