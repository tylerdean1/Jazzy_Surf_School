"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Link as MuiLink } from '@mui/material';
import { EmojiEvents, Instagram, Facebook } from '@mui/icons-material';

export default function AboutJazPage() {
    const t = useTranslations('about');

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Box
                        component="img"
                        sx={{
                            width: '100%',
                            height: 500,
                            objectFit: 'cover',
                            borderRadius: 3
                        }}
                        src="/profile_pics/palmTree.png"
                        alt="Jazmine Dean Perez surfing"
                    />

                    <Card sx={{ mt: 4, maxWidth: 480 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="#20B2AA">
                                Socials
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Instagram color="secondary" />
                                    </ListItemIcon>
                                    <ListItemText primary={<MuiLink href="https://www.instagram.com/onlyjazmine/" target="_blank" rel="noopener noreferrer">onlyjazmine</MuiLink>} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Facebook color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={<MuiLink href="https://www.facebook.com/jazmine.dean.77" target="_blank" rel="noopener noreferrer">Jazmine Dean Perez</MuiLink>} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Facebook color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={<MuiLink href="https://www.facebook.com/unlimitedtimetravelers" target="_blank" rel="noopener noreferrer">Unlimited Time Travelers</MuiLink>} />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h2" gutterBottom color="#20B2AA">
                        {t('title')}
                    </Typography>
                    <Typography variant="h5" gutterBottom color="text.secondary">
                        {t('subtitle')}
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                        {t('bio')}
                    </Typography>

                    <Card sx={{ mt: 4, backgroundColor: '#f8f9fa' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom color="#20B2AA">
                                {t('achievements')}
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmojiEvents color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('accolades.0')} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmojiEvents color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('accolades.1')} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmojiEvents color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('accolades.2')} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmojiEvents color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('accolades.3')} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <EmojiEvents color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('accolades.4')} />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
