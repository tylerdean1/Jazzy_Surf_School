"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import TeamCard from '../../../components/TeamCard';

export default function TeamPage() {
    const t = useTranslations('team');

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h2" gutterBottom color="#20B2AA">
                {t('title')}
            </Typography>
            <Typography variant="h5" gutterBottom color="text.secondary">
                {t('subtitle')}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                {t('intro')}
            </Typography>
            <Grid container spacing={4} sx={{ mt: 6 }}>
                <Grid item xs={12} md={6}>
                    <TeamCard
                        name="Jazmine Dean Perez"
                        images={[
                            '/about_me/1.png',
                            '/about_me/2.png',
                            '/about_me/lbturn.png',
                            '/about_me/sbsnap.png',
                            '/about_me/isasilver.png'
                        ]}
                    />
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
                        <Box component="img" src="/Logo/SSA_BW_Logo.png" alt="SSA logo" sx={{ width: '100%', height: 240, objectFit: 'contain', background: 'hsl(var(--background))' }} />
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
