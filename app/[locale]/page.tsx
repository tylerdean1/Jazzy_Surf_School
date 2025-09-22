"use client";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Hero from '../../components/Hero';
import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material';

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
        secondaryHref={`/${locale}/about`}
      />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" gutterBottom color="#20B2AA">
            {t('aboutPreview')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
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
                  src="https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg"
                  alt="Surf lessons"
                />
                <Typography variant="h5" gutterBottom color="#20B2AA">
                  {t('lessonsTitle')}
                </Typography>
                <Typography variant="body1">
                  {t('lessonsDescription')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
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
                  src="https://images.pexels.com/photos/1654698/pexels-photo-1654698.jpeg"
                  alt="Surf gallery"
                />
                <Typography variant="h5" gutterBottom color="#20B2AA">
                  {t('galleryTitle')}
                </Typography>
                <Typography variant="body1">
                  {t('galleryDescription')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}