"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import TeamCard from '../../../components/TeamCard';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';

export default function TeamPage() {
    return (
        <ContentBundleProvider prefix="team.">
            <TeamInner />
        </ContentBundleProvider>
    );
}

function TeamInner() {
    const t = useTranslations('team');
    const locale = useLocale();
    const cms = useCmsPageBody('team', locale);
    const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

    const ctx = useContentBundleContext();
    const media = ctx?.media || [];
    const jazPhotos = [...media]
        .filter((m) => String(m?.slot_key || '').startsWith('team.jaz.photos.'))
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
        .map((m) => m.url)
        .filter(Boolean);
    const images = jazPhotos;
    const teamLogo = media.find((m) => m?.slot_key === 'team.logo')?.url || '';

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h2" gutterBottom color="#20B2AA">
                {t('title')}
            </Typography>
            <Typography variant="h5" gutterBottom color="text.secondary">
                {t('subtitle')}
            </Typography>
            {hasCms ? (
                <Box sx={{ mt: 2 }}>
                    <CmsRichTextRenderer json={cms.body} />
                </Box>
            ) : (
                <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                    {t('intro')}
                </Typography>
            )}
            <Grid container spacing={4} sx={{ mt: 6 }}>
                <Grid item xs={12} md={6}>
                    <TeamCard name="Jazmine Dean Perez" images={images} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ maxWidth: 700, mx: 'auto' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom color="#20B2AA">
                                More team details
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                More team details, bios, and highlights are coming soon.
                            </Typography>
                        </CardContent>
                        {teamLogo ? (
                            <Box
                                component="img"
                                src={teamLogo}
                                alt="SSA logo"
                                sx={{ width: '100%', height: 240, objectFit: 'contain', background: 'hsl(var(--background))' }}
                            />
                        ) : null}
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
