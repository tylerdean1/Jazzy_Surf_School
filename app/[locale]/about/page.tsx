import { useTranslations } from 'next-intl';
import { Container, Typography, Grid, Box, Card, CardContent, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

export default function AboutPage() {
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
            src="https://images.pexels.com/photos/1654684/pexels-photo-1654684.jpeg"
            alt="Jazmine Dean surfing"
          />
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
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
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