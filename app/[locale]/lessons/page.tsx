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
      </Box>
      
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
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
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
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