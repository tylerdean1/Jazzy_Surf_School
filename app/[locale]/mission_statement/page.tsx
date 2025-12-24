"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Box, Grid, Card } from '@mui/material';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';

export default function MissionStatementPage() {
    return (
        <ContentBundleProvider prefix="mission.">
            <MissionInner />
        </ContentBundleProvider>
    );
}

function MissionInner() {
    const t = useTranslations('mission');
    const locale = useLocale();
    const cms = useCmsPageBody('mission_statement', locale);
    const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

    const ctx = useContentBundleContext();
    const logoUrl = (ctx?.media || []).find((m) => m?.slot_key === 'mission.logo')?.url || '';

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h2" gutterBottom color="#20B2AA">
                {t('title')}
            </Typography>
            <Typography variant="h5" gutterBottom color="text.secondary">
                {t('subtitle')}
            </Typography>

            <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={12} md={8}>
                    <Box>
                        {hasCms ? (
                            <CmsRichTextRenderer json={cms.body} />
                        ) : (
                            <>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    {t('lead')}
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    {t('body1')}
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    {t('body2')}
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.7, fontWeight: 600 }}>
                                    {t('conclusion')}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, height: '100%' }}>
                        {logoUrl ? (
                            <Box
                                component="img"
                                src={logoUrl}
                                alt="SSA Logo"
                                sx={{ width: 180, height: 180, objectFit: 'contain' }}
                            />
                        ) : null}
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
