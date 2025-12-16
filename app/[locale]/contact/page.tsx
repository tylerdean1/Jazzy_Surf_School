"use client";

import { Container, Typography, Grid, Box, Card, CardContent, IconButton, Link } from '@mui/material';
import { Instagram, Phone, Email } from '@mui/icons-material';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';

export default function ContactPage() {
  const INSTAGRAM = 'https://www.instagram.com/sunsetsurfacademy/';
  const PHONE = '939-525-0307';
  const EMAIL = 'sunsetsurfacademy@gmail.com';
  const locale = useLocale();
  const cms = useCmsPageBody('contact', locale);
  const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Box sx={{ mx: 'auto', width: 420, height: 180, position: 'relative' }}>
          <Image src="/Logo/SSA_Orange_Logo.png" alt="Sunset Surf Academy" fill style={{ objectFit: 'contain' }} />
        </Box>
        <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
          Have questions or want to check our online presence? Check the links below.
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
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <Instagram />
                </IconButton>
                <Link href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                  <Typography variant="body1">@sunsetsurfacademy</Typography>
                </Link>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton component="a" href={`tel:${PHONE}`} color="primary">
                  <Phone />
                </IconButton>
                <Link href={`tel:${PHONE}`}>
                  <Typography variant="body1">{PHONE}</Typography>
                </Link>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton component="a" href={`mailto:${EMAIL}`} color="primary">
                  <Email />
                </IconButton>
                <Link href={`mailto:${EMAIL}`}>
                  <Typography variant="body1">{EMAIL}</Typography>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}