import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box, Card, CardMedia } from '@mui/material';
import styles from './Gallery.module.css';

export default function GalleryPage() {
  const t = useTranslations();

  const photos = [
    'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
    'https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg',
    'https://images.pexels.com/photos/1654698/pexels-photo-1654698.jpeg',
    'https://images.pexels.com/photos/1654684/pexels-photo-1654684.jpeg',
    'https://images.pexels.com/photos/1654693/pexels-photo-1654693.jpeg',
    'https://images.pexels.com/photos/1654697/pexels-photo-1654697.jpeg'
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
                alt={`Surf photo ${index + 1}`}
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
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Surf Lesson Highlights"
                className={styles.iframe}
                allowFullScreen
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className={styles.videoWrapper}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Advanced Surf Techniques"
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