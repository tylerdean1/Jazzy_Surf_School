"use client";

import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';
import usePageSections from '@/hooks/usePageSections';
import PageSectionsRenderer from '@/components/sections/PageSectionsRenderer';

export default function FAQPage() {
  const sections = usePageSections('faq');
  if (sections.sections.length > 0) {
    return <PageSectionsRenderer pageKey="faq" sections={sections.sections} />;
  }

  return (
    <ContentBundleProvider prefix="faq.">
      <FAQInner />
    </ContentBundleProvider>
  );
}

function FAQInner() {
  const locale = useLocale();
  const cms = useCmsPageBody('faq', locale);
  const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

  const ctx = useContentBundleContext();
  const strings = ctx?.strings ?? {};
  const tDb = (key: string, fallback: string) => {
    const v = strings[key];
    return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
  };

  const title = tDb('faq.title', 'Frequently Asked Questions');

  const fallbackQuestions = [
    {
      q: 'Where do we meet for lessons?',
      a: "We are based out of Rincón, Puerto Rico, and primarily conduct lessons at our local beach breaks. However, when conditions are favorable and upon request, we're happy to travel anywhere along the coast from Rincón up to Jobos and all the spots in between to find the perfect waves for your lesson.",
    },
    {
      q: "What's included in beginner lessons?",
      a: 'Beginner lessons include surfboard rental, comprehensive safety briefing, personalized coaching both on the beach and in the water, and photos of your surf session to capture your progress and memorable moments.',
    },
    {
      q: "What's included in advanced coaching?",
      a: "Advanced coaching is a comprehensive multi-session program that includes video analysis of your surfing. We start with a baseline session where we film your surfing, then review the footage together to identify areas for improvement. This is followed by a theory-to-practice session where you apply the techniques we've discussed, creating a complete learning cycle for advanced skill development.",
    },
    {
      q: 'Can I reschedule my lesson?',
      a: 'Yes, we offer flexible rescheduling options based on weather conditions and your availability.',
    },
    {
      q: 'Are lessons suitable for complete beginners?',
      a: 'Absolutely! Our beginner lessons are specifically designed for first-time surfers of all ages.',
    },
    {
      q: 'Do you offer group and family lessons?',
      a: 'Yes, we welcome groups and families. Contact us for special group rates and custom arrangements.',
    },
    {
      q: "What's your refund policy?",
      a: 'We offer full refunds for cancellations due to unsafe weather conditions. Other cancellations require 24-hour notice.',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          {title}
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
                {tDb(`faq.questions.${index}.question`, fallbackQuestions[index]?.q || '')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {tDb(`faq.questions.${index}.answer`, fallbackQuestions[index]?.a || '')}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}