import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box, Card, CardMedia } from '@mui/material';
import styles from './Gallery.module.css';

export default function GalleryPage() {
  const t = useTranslations();

  const photos = [
    '/Dress.png',
    '/dress2.png',
    '/hang10.png',
    '/isa.png',
    '/isasilver.png',
    '/lbturn.png',
    '/sbsnap.png'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          Gallery
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Surf adventures and lesson highlights
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {photos.map((photo, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="250"
                image={photo}
                alt={`Jazmine Dean Surf School - ${index + 1}`}
                sx={{
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="#20B2AA">
          Featured Videos
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube.com/embed/-TcWIezmvsw"
                title="Featured Video 1"
                className={styles.iframe}
                allowFullScreen
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube.com/embed/ogrZGiLpYWM"
                title="Featured Video 2"
                className={styles.iframe}
                allowFullScreen
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube.com/embed/3GwL6TAd1RM"
                title="Featured Video 3"
                className={styles.iframe}
                allowFullScreen
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube.com/embed/k2jw1l_kMxc"
                title="Featured Video 4"
                className={styles.iframe}
                allowFullScreen
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}