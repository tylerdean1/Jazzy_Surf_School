"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { useLocale } from 'next-intl';
import useCmsPageBody from '../../../hooks/useCmsPageBody';
import CmsRichTextRenderer from '../../../components/CmsRichTextRenderer';
import { isEmptyDoc } from '../../../lib/cmsRichText';

export default function AboutJazPage() {
    const t = useTranslations('about');
    const locale = useLocale();
    const cms = useCmsPageBody('about_jaz', locale);
    const hasCms = !cms.loading && !cms.error && !isEmptyDoc(cms.body);
    const accolades = t.raw('accolades');

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Typography variant="h2" gutterBottom color="#20B2AA">
                {t('title')}
            </Typography>
            <Typography variant="h5" gutterBottom color="text.secondary">
                {t('subtitle')}
            </Typography>

            <Box sx={{ mt: 4 }}>
                {hasCms ? (
                    <CmsRichTextRenderer json={cms.body} />
                ) : (
                    <>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                            {t('bio')}
                        </Typography>

                        <Typography variant="h5" gutterBottom color="#20B2AA" sx={{ mt: 4 }}>
                            {t('achievements')}
                        </Typography>

                        {Array.isArray(accolades) ? (
                            <List sx={{ pt: 0 }}>
                                {accolades.map((item) => (
                                    <ListItem key={String(item)} sx={{ py: 0.5 }}>
                                        <ListItemText primary={String(item)} />
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
