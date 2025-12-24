"use client";

import { Container, Typography, Grid, Box, Card, CardContent, IconButton, Link } from '@mui/material';
import { Instagram, Phone, Email } from '@mui/icons-material';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';
import { useCmsStringValue } from '@/hooks/useCmsStringValue';

export default function ContactPage() {
  return (
    <ContentBundleProvider prefix="contact.">
      <ContactInner />
    </ContentBundleProvider>
  );
}

function ContactInner() {
  const instagramUrl = useCmsStringValue('contact.instagramUrl', 'https://www.instagram.com/sunsetsurfacademy/').value;
  const instagramHandle = useCmsStringValue('contact.instagramHandle', '@sunsetsurfacademy').value;
  const phoneDisplay = useCmsStringValue('contact.phone', '939-525-0307').value;
  const emailAddress = useCmsStringValue('contact.email', 'sunsetsurfacademy@gmail.com').value;
  const linksIntro = useCmsStringValue('contact.linksIntro', 'Have questions or want to check our online presence? Check the links below.').value;
  const logoAlt = useCmsStringValue('contact.logoAlt', 'Sunset Surf Academy').value;

  const phoneHref = String(phoneDisplay).replace(/[^\d+]/g, '');
  const locale = useLocale();
  const cms = useCmsPageBody('contact', locale);
  const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

  const ctx = useContentBundleContext();
  const logoUrl = (ctx?.media || []).find((m) => m?.slot_key === 'contact.logo')?.url || '';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        {logoUrl ? (
          <Box component="img" src={logoUrl} alt={logoAlt} sx={{ mx: 'auto', width: 420, height: 180, objectFit: 'contain' }} />
        ) : null}
        <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
          {linksIntro}
        </Typography>
      </Box>

      {hasCms ? (
        <Box sx={{ mb: 4 }}>
          <CmsRichTextRenderer json={cms.body} />
        </Box>
      ) : null}

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={8}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  component="a"
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <Instagram />
                </IconButton>
                <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Typography variant="body1">{instagramHandle}</Typography>
                </Link>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton component="a" href={`tel:${phoneHref}`} color="primary">
                  <Phone />
                </IconButton>
                <Link href={`tel:${phoneHref}`}>
                  <Typography variant="body1">{phoneDisplay}</Typography>
                </Link>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton component="a" href={`mailto:${emailAddress}`} color="primary">
                  <Email />
                </IconButton>
                <Link href={`mailto:${emailAddress}`}>
                  <Typography variant="body1">{emailAddress}</Typography>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}