"use client";

import { useLocale } from 'next-intl';
import { Container, Typography, Grid, Box } from '@mui/material';
import LessonCard from '../../../components/LessonCard';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import { useAdminEdit } from '@/components/admin/edit/AdminEditContext';
import EditableRichTextBlock from '@/components/admin/edit/EditableRichTextBlock';
import EditableInlineText from '@/components/admin/edit/EditableInlineText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';
import { useCmsStringValue } from '@/hooks/useCmsStringValue';

export default function LessonsPage() {
  return (
    <ContentBundleProvider prefix="lessons.">
      <LessonsInner />
    </ContentBundleProvider>
  );
}

function LessonsInner() {
  const locale = useLocale();
  const { enabled: adminEdit } = useAdminEdit();
  const cms = useCmsPageBody('lessons', locale);
  const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);
  const ctx = useContentBundleContext();
  const pricesUrl = (ctx?.media || []).find((m) => m?.slot_key === 'lessons.prices')?.url || '';
  const pricesAlt = useCmsStringValue('lessons.pricesAlt', 'Prices').value;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          <EditableInlineText cmsKey="lessons.title" fallback={'Surf Lessons'}>
            {(v) => <>{v}</>}
          </EditableInlineText>
        </Typography>
        <Typography variant="h5" color="text.secondary">
          <EditableInlineText
            cmsKey="lessons.subtitle"
            fallback={'Professional instruction tailored to your skill level'}
            multiline
            fullWidth
          >
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
            <Box component="img" src={pricesUrl} alt={pricesAlt} sx={{ width: '100%', height: 'auto', maxHeight: 600, objectFit: 'contain', borderRadius: 1 }} />
          ) : null}

          {/* Photo bar removed per request */}
        </Box>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <LessonCard
            title={'Lessons'}
            price={'$100'}
            duration={'2 hours'}
            location={'Rincón to Isabela/Jobos'}
            description={'The beginner lessons teach the fundamentals of surfing.'}
            includes={[
              'Surfboard rental',
              'Safety briefing',
              'Personalized beach & water coaching',
              'Photos of your session'
            ]}
            cmsKeyBase="lessons.beginner"
            bookLessonTypeId="beginner"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LessonCard
            title={'Advanced Coaching'}
            price={'$100'}
            duration={'2 hours'}
            location={'Rincón to Isabela/Jobos'}
            description={'Intermediate lessons teach how to read waves, interact in any lineup, and gain practical skills to surf more confidently.'}
            includes={[
              'Surfboard rental',
              'Wave reading & lineup etiquette',
              'Skills development',
              'Photos and short video clips'
            ]}
            cmsKeyBase="lessons.intermediate"
            bookLessonTypeId="intermediate"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LessonCard
            title={'Surf Guide'}
            price={'$100'}
            duration={'2 hours'}
            location={'Various locations'}
            description={'Advanced lessons cover advanced skills, video analysis, competition preparation, and custom programs.'}
            includes={[
              'Video review',
              'Technique analysis',
              'Competition prep',
              'Custom programs'
            ]}
            cmsKeyBase="lessons.advanced"
            bookLessonTypeId="advanced"
          />
        </Grid>
      </Grid>
    </Container>
  );
}