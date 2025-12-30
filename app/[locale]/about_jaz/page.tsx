"use client";

import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';
import ContentBundleProvider, { useContentBundleContext } from '@/components/content/ContentBundleContext';
import usePageSections from '@/hooks/usePageSections';
import PageSectionsRenderer from '@/components/sections/PageSectionsRenderer';

export default function AboutJazPage() {
    const sections = usePageSections('about_jaz');
    if (sections.sections.length > 0) {
        return <PageSectionsRenderer pageKey="about_jaz" sections={sections.sections} />;
    }

    return (
        <ContentBundleProvider prefix="about.">
            <AboutInner />
        </ContentBundleProvider>
    );
}

function AboutInner() {
    const locale = useLocale();
    const cms = useCmsPageBody('about_jaz', locale);
    const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);

    const ctx = useContentBundleContext();
    const strings = ctx?.strings ?? {};
    const tDb = (key: string, fallback: string) => {
        const v = strings[key];
        return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
    };

    const accolades = [
        tDb('about.accolades.0', '4x East Coast Champion'),
        tDb('about.accolades.1', 'Pan-American Games 2nd Place'),
        tDb('about.accolades.2', 'ISA World Surfing Games Competitor'),
        tDb('about.accolades.3', 'Team Puerto Rico Member'),
        tDb('about.accolades.4', 'Professional Surf Instructor'),
    ].filter((s) => !!String(s).trim());

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Typography variant="h2" gutterBottom color="#20B2AA">
                {tDb('about.title', 'About Jazmine Dean Perez')}
            </Typography>
            <Typography variant="h5" gutterBottom color="text.secondary">
                {tDb('about.subtitle', 'Professional Surfer & Instructor')}
            </Typography>

            <Box sx={{ mt: 4 }}>
                {hasCms ? (
                    <CmsRichTextRenderer json={cms.body} />
                ) : (
                    <>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                            {tDb(
                                'about.bio',
                                'Jazmine Dean is a professional surfer representing Team Puerto Rico with an impressive competitive record. Based in the world-renowned surf town of Rincón, she brings years of experience and passion to every lesson.'
                            )}
                        </Typography>

                        <Typography variant="h5" gutterBottom color="#20B2AA" sx={{ mt: 4 }}>
                            {tDb('about.achievements', 'Achievements')}
                        </Typography>

                        {accolades.length ? (
                            <List sx={{ pt: 0 }}>
                                {accolades.map((item, i) => (
                                    <ListItem key={`${i}:${String(item)}`} sx={{ py: 0.5 }}>
                                        <ListItemText primary={item} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : null}
                    </>
                )}
            </Box>
        </Container>
    );
}
