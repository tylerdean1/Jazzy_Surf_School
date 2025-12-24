"use client";

import { useLocale, useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box } from '@mui/material';
import LessonCard from '../../../components/LessonCard';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import { useAdminEdit } from '@/components/admin/edit/AdminEditContext';
import EditableRichTextBlock from '@/components/admin/edit/EditableRichTextBlock';
import EditableInlineText from '@/components/admin/edit/EditableInlineText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';

export default function LessonsPage() {
  return (
    <ContentBundleProvider prefix="lessons.">
      <LessonsInner />
    </ContentBundleProvider>
  );
}

function LessonsInner() {
  const t = useTranslations('lessons');
  const locale = useLocale();
  const { enabled: adminEdit } = useAdminEdit();
  const cms = useCmsPageBody('lessons', locale);
  const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);
  const ctx = useContentBundleContext();
  const pricesUrl = (ctx?.media || []).find((m) => m?.slot_key === 'lessons.prices')?.url || '';

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          <EditableInlineText cmsKey="lessons.title" fallback={t('title')}>
            {(v) => <>{v}</>}
          </EditableInlineText>
        </Typography>
        <Typography variant="h5" color="text.secondary">
          <EditableInlineText cmsKey="lessons.subtitle" fallback={t('subtitle')} multiline fullWidth>
            {(v) => <>{v}</>}
          </EditableInlineText>
        </Typography>

        {hasCms || adminEdit ? (
          <Box sx={{ mt: 3, textAlign: 'left' }}>
            <EditableRichTextBlock cmsKey="lessons" value={cms.body || ''} emptyPlaceholder="Lessons page body" />
          </Box>
        ) : null}
        {/* Main prices image */}
        <Box sx={{ mt: 4 }}>
          {pricesUrl ? (
            <Box component="img" src={pricesUrl} alt="Prices" sx={{ width: '100%', height: 'auto', maxHeight: 600, objectFit: 'contain', borderRadius: 1 }} />
          ) : null}

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
            cmsKeyBase="lessons.beginner"
            bookLessonTypeId="beginner"
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
            cmsKeyBase="lessons.intermediate"
            bookLessonTypeId="intermediate"
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
            cmsKeyBase="lessons.advanced"
            bookLessonTypeId="advanced"
          />
        </Grid>
      </Grid>
    </Container>
  );
}