import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box, Card, CardContent, IconButton } from '@mui/material';
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
                <Typography variant="h6" gutterBottom color="#20B2AA">
                  {t('followUs')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <IconButton 
                    color="primary" 
                    size="large"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      '&:hover': { backgroundColor: '#e9ecef' }
                    }}
                  >
                    <Instagram />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    size="large"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      '&:hover': { backgroundColor: '#e9ecef' }
                    }}
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    size="large"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      '&:hover': { backgroundColor: '#e9ecef' }
                    }}
                  >
                    <YouTube />
                  </IconButton>
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
                src="https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"
                alt="Rincón, Puerto Rico"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}