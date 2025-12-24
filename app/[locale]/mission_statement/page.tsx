"use client";

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
    const locale = useLocale();
    const cms = useCmsPageBody('mission_statement', locale);
    const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

    const ctx = useContentBundleContext();
    const strings = ctx?.strings ?? {};
    const logoUrl = (ctx?.media || []).find((m) => m?.slot_key === 'mission.logo')?.url || '';

    const tDb = (key: string, fallback: string) => {
        const v = strings[key];
        return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h2" gutterBottom color="#20B2AA">
                {tDb('mission.title', 'Our Mission')}
            </Typography>
            <Typography variant="h5" gutterBottom color="text.secondary">
                {tDb('mission.subtitle', 'Take Every Surfer To The Next Level')}
            </Typography>

            <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={12} md={8}>
                    <Box>
                        {hasCms ? (
                            <CmsRichTextRenderer json={cms.body} />
                        ) : (
                            <>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    {tDb(
                                        'mission.lead',
                                        'At Sunset Surf Academy our mission is simple: to help every surfer — from complete beginners to seasoned competitors — progress, have more fun, and get better results in the water.'
                                    )}
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    {tDb(
                                        'mission.body1',
                                        "We believe surfing is for everyone. For first-timers we focus on water safety, confidence-building and the fundamentals so your first waves are empowering and memorable. For intermediate and advanced surfers we offer technique work, video analysis and competition preparation that targets measurable improvement."
                                    )}
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    {tDb(
                                        'mission.body2',
                                        "Our coaches design lessons around your goals — whether that’s catching your first wave, improving your bottom turns, boosting aerials, or nailing contest-worthy maneuvers. We emphasize clear coaching, practical drills, and a supportive environment that accelerates learning while keeping the stoke alive."
                                    )}
                                </Typography>
                                <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.7, fontWeight: 600 }}>
                                    {tDb(
                                        'mission.conclusion',
                                        "Ultimately, success at Sunset Surf Academy isn’t just measured in scores; it’s measured in smiles, confidence and the endless pursuit of better surfing. Come surf with us and let’s take your surfing to the next level."
                                    )}
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
                                alt={tDb('mission.logoAlt', 'SSA Logo')}
                                sx={{ width: 180, height: 180, objectFit: 'contain' }}
                            />
                        ) : null}
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
