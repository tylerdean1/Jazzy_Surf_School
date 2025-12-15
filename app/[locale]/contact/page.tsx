"use client";

import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import { Instagram, Facebook, YouTube, LocationOn } from '@mui/icons-material';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          {t('title')}
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={6} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ p: 6 }}>
              <LocationOn sx={{ fontSize: 60, color: '#20B2AA', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {t('location')}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom color="#20B2AA" sx={{ mb: 4, textAlign: 'center' }}>
                  {t('followUs')}
                </Typography>

                {/* OnlyJazmine Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                    @onlyjazmine
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="primary"
                        size="large"
                        component="a"
                        href="https://instagram.com/onlyjazmine"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          backgroundColor: '#f8f9fa',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: '#e9ecef',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(32, 178, 170, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Instagram sx={{ color: '#20B2AA' }} />
                      </IconButton>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                        Instagram
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="primary"
                        size="large"
                        component="a"
                        href="https://facebook.com/jazmine.dean.77"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          backgroundColor: '#f8f9fa',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: '#e9ecef',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(32, 178, 170, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Facebook sx={{ color: '#20B2AA' }} />
                      </IconButton>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                        Facebook
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="primary"
                        size="large"
                        component="a"
                        href="https://youtube.com/@Onlyjazminee"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          backgroundColor: '#f8f9fa',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: '#e9ecef',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(32, 178, 170, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <YouTube sx={{ color: '#20B2AA' }} />
                      </IconButton>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                        YouTube
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Unlimited Time Travelers Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                    Unlimited Time Travelers
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="primary"
                        size="large"
                        component="a"
                        href="https://www.instagram.com/unlimitedtimetravelers/"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          backgroundColor: '#f8f9fa',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: '#e9ecef',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(32, 178, 170, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Instagram sx={{ color: '#20B2AA' }} />
                      </IconButton>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                        Instagram
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="primary"
                        size="large"
                        component="a"
                        href="https://www.facebook.com/unlimitedtimetravelers"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          backgroundColor: '#f8f9fa',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: '#e9ecef',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(32, 178, 170, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Facebook sx={{ color: '#20B2AA' }} />
                      </IconButton>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                        Facebook
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                component="img"
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mt: 4,
                  mx: 'auto',
                  display: 'block'
                }}
                src="/palmTree.png"
                alt="Rincón, Puerto Rico"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}