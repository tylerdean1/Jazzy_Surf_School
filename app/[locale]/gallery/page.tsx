import fs from 'fs/promises';
import path from 'path';
import Image from 'next/image';
import { Container, Typography, Grid, Box, Card } from '@mui/material';

type MediaKind = 'image' | 'video' | 'other';

function getMediaKind(fileName: string): MediaKind {
  const ext = path.extname(fileName).toLowerCase();
  if ([
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.avif',
    '.svg'
  ].includes(ext)) {
    return 'image';
  }

  if (['.mp4', '.webm'].includes(ext)) return 'video';
  return 'other';
}

export default async function GalleryPage() {
  const schoolContentDir = path.join(process.cwd(), 'public', 'school_content');
  const allEntries = await fs.readdir(schoolContentDir);

  const files = allEntries
    .filter((name) => !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          Gallery
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Check out some of the content from our past lessons :)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {files.map((fileName) => {
          const src = `/school_content/${fileName}`;
          const kind = getMediaKind(fileName);

          return (
            <Grid item xs={12} sm={6} md={4} key={fileName}>
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', height: 250, background: 'hsl(var(--background))' }}>
                  {kind === 'image' ? (
                    <Image
                      src={src}
                      alt={fileName}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : kind === 'video' ? (
                    <Box
                      component="video"
                      src={src}
                      controls
                      playsInline
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {fileName}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}