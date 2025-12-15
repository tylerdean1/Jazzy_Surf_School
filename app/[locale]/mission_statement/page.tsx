"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box } from '@mui/material';

export default function MissionStatementPage() {
    const t = useTranslations('mission');

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Grid container spacing={6} alignItems="flex-start">
                <Grid item xs={12} md={8}>
                    <Typography variant="h2" gutterBottom color="#20B2AA" sx={{ mt: { xs: 3, md: 4 } }}>
                        {t('title')}
                    </Typography>
                    <Typography variant="h5" gutterBottom color="text.secondary">
                        {t('subtitle')}
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                        {t('lead')}
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                        {t('body1')}
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                        {t('body2')}
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                        {t('conclusion')}
                    </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box
                        component="img"
                        sx={{ mt: { xs: 3, md: 4 }, width: '100%', borderRadius: 2, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}
                        src="/Logo/SSA_Orange_Logo.png"
                        alt="Sunset Surf Academy mission"
                    />
                </Grid>
            </Grid>
        </Container>
    );
}
