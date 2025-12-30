"use client";

import { useLocale } from 'next-intl';
import { Container, Typography, Grid, Box } from '@mui/material';
import LessonCard from '../../../components/LessonCard';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import { useAdminEdit } from '@/components/admin/edit/AdminEditContext';
import EditableRichTextBlock from '@/components/admin/edit/EditableRichTextBlock';
import EditableInlineText from '@/components/admin/edit/EditableInlineText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';

export default function LessonsPage() {
  return (
    <ContentBundleProvider prefix="page.lessons." mediaPrefix="lessons.">
      <LessonsInner />
    </ContentBundleProvider>
  );
}

function LessonsInner() {
  const locale = useLocale();
  const { enabled: adminEdit } = useAdminEdit();
  const cms = useCmsPageBody('page.lessons.body', locale);
  const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);
  const ctx = useContentBundleContext();
  const strings = ctx?.strings ?? {};
  const pricesUrl = (ctx?.media || []).find((m) => m?.slot_key === 'lessons.prices')?.url || '';
  const fallbackCopy = 'Content unavailable';
  const tDb = (key: string, fallback: string) => {
    const v = strings[key];
    return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
  };
  const pricesAlt = tDb('page.lessons.pricesAlt', fallbackCopy);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          <EditableInlineText cmsKey="page.lessons.title" fallback={fallbackCopy}>
            {(v) => <>{v}</>}
          </EditableInlineText>
        </Typography>
        <Typography variant="h5" color="text.secondary">
          <EditableInlineText
            cmsKey="page.lessons.subtitle"
            fallback={fallbackCopy}
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
            title={fallbackCopy}
            price={fallbackCopy}
            duration={fallbackCopy}
            location={fallbackCopy}
            description={fallbackCopy}
            includes={[fallbackCopy, fallbackCopy, fallbackCopy, fallbackCopy]}
            cmsKeyBase="page.lessons.beginner"
            bookLessonTypeId="beginner"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LessonCard
            title={fallbackCopy}
            price={fallbackCopy}
            duration={fallbackCopy}
            location={fallbackCopy}
            description={fallbackCopy}
            includes={[fallbackCopy, fallbackCopy, fallbackCopy, fallbackCopy]}
            cmsKeyBase="page.lessons.intermediate"
            bookLessonTypeId="intermediate"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LessonCard
            title={fallbackCopy}
            price={fallbackCopy}
            duration={fallbackCopy}
            location={fallbackCopy}
            description={fallbackCopy}
            includes={[fallbackCopy, fallbackCopy, fallbackCopy, fallbackCopy]}
            cmsKeyBase="page.lessons.advanced"
            bookLessonTypeId="advanced"
          />
        </Grid>
      </Grid>
    </Container>
  );
}
