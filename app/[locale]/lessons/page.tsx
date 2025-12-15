"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box } from '@mui/material';
import LessonCard from '../../../components/LessonCard';

export default function LessonsPage() {
  const t = useTranslations('lessons');

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          {t('title')}
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {t('subtitle')}
        </Typography>
        {/* Main prices image */}
        <Box sx={{ mt: 4 }}>
          <Box component="img" src="/target_audiance/prices.png" alt="Prices" sx={{ width: '100%', height: 'auto', maxHeight: 600, objectFit: 'contain', borderRadius: 1 }} />

          {/* Photo bar removed per request */}
        </Box>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <LessonCard
            title={t('beginner.title')}
            price={t('beginner.price')}
            duration={t('beginner.duration')}
            location={t('beginner.location')}
            description={t('beginner.description')}
            includes={[
              t('beginner.includes.0'),
              t('beginner.includes.1'),
              t('beginner.includes.2'),
              t('beginner.includes.3')
            ]}
            featured
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LessonCard
            title={t('intermediate.title')}
            price={t('intermediate.price')}
            duration={t('intermediate.duration')}
            location={t('intermediate.location')}
            description={t('intermediate.description')}
            includes={[
              t('intermediate.includes.0'),
              t('intermediate.includes.1'),
              t('intermediate.includes.2'),
              t('intermediate.includes.3')
            ]}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LessonCard
            title={t('advanced.title')}
            price={t('advanced.price')}
            duration={t('advanced.duration')}
            location={t('advanced.location')}
            description={t('advanced.description')}
            includes={[
              t('advanced.includes.0'),
              t('advanced.includes.1'),
              t('advanced.includes.2'),
              t('advanced.includes.3')
            ]}
          />
        </Grid>
      </Grid>
    </Container>
  );
}