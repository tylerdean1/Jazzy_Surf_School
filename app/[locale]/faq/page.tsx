"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';

export default function FAQPage() {
  const t = useTranslations('faq');
  const locale = useLocale();
  const cms = useCmsPageBody('faq', locale);
  const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          {t('title')}
        </Typography>
      </Box>

      {hasCms ? (
        <Box sx={{ mb: 4 }}>
          <CmsRichTextRenderer json={cms.body} />
        </Box>
      ) : null}

      <Box>
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <Accordion key={index} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ backgroundColor: '#f8f9fa' }}
            >
              <Typography variant="h6" color="#20B2AA">
                {t(`questions.${index}.question`)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t(`questions.${index}.answer`)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}