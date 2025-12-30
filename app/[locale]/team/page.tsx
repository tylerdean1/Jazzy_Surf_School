"use client";

import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import TeamCard from '../../../components/TeamCard';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';
import { useCmsStringValue } from '@/hooks/useCmsStringValue';
import usePageSections from '@/hooks/usePageSections';
import PageSectionsRenderer from '@/components/sections/PageSectionsRenderer';

export default function TeamPage() {
    const sections = usePageSections('team');
    if (sections.sections.length > 0) {
        return <PageSectionsRenderer pageKey="team" sections={sections.sections} />;
    }

    return (
        <ContentBundleProvider prefix="team.">
            <TeamInner />
        </ContentBundleProvider>
    );
}

function TeamInner() {
    const locale = useLocale();
    const cms = useCmsPageBody('team', locale);
    const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

    const title = useCmsStringValue('team.title', 'Meet the Team').value;
    const subtitle = useCmsStringValue('team.subtitle', 'Learn from some of the best surfers in the world.').value;
    const intro = useCmsStringValue(
        'team.intro',
        'These are our top coaches who will take you to the next level in your surfing. Click on their profiles to learn a little about them!'
    ).value;
    const jazName = useCmsStringValue('team.jaz.name', 'Jazmine Dean Perez').value;
    const moreTitle = useCmsStringValue('team.moreDetailsTitle', 'More team details').value;
    const moreBody = useCmsStringValue('team.moreDetailsBody', 'More team details, bios, and highlights are coming soon.').value;
    const logoAlt = useCmsStringValue('team.logoAlt', 'SSA logo').value;

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
                {title}
            </Typography>
            <Typography variant="h5" gutterBottom color="text.secondary">
                {subtitle}
            </Typography>
            {hasCms ? (
                <Box sx={{ mt: 2 }}>
                    <CmsRichTextRenderer json={cms.body} />
                </Box>
            ) : (
                <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                    {intro}
                </Typography>
            )}
            <Grid container spacing={4} sx={{ mt: 6 }}>
                <Grid item xs={12} md={6}>
                    <TeamCard name={jazName} images={images} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ maxWidth: 700, mx: 'auto' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom color="#20B2AA">
                                {moreTitle}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {moreBody}
                            </Typography>
                        </CardContent>
                        {teamLogo ? (
                            <Box
                                component="img"
                                src={teamLogo}
                                alt={logoAlt}
                                sx={{ width: '100%', height: 240, objectFit: 'contain', background: 'hsl(var(--background))' }}
                            />
                        ) : null}
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
