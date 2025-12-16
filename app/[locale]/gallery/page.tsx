"use client";

import { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Grid, Box, Card, Alert } from '@mui/material';
import supabaseClient from '../../../lib/supabaseClient';
import type { Database } from '../../../lib/database.types';

type AssetType = 'photo' | 'video';
type PhotoCategory = 'logo' | 'hero' | 'lessons' | 'web_content' | 'uncategorized';

type MediaAsset = {
  id: string;
  title: string;
  description: string | null;
  bucket: string;
  path: string;
  public: boolean;
  category: PhotoCategory;
  asset_type: AssetType;
  sort: number;
  created_at: string | null;
};

function publicUrl(bucket: string, path: string): string {
  try {
    return supabaseClient.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  } catch {
    return '';
  }
}

export default function GalleryPage() {
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MediaAsset[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      const { data, error } = await supabaseClient.rpc('get_public_media_assets', {
        p_category: 'web_content',
      });

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setItems([]);
        return;
      }

      const rows = (data ?? []) as Database['public']['Functions']['get_public_media_assets']['Returns'];
      setItems(rows as unknown as MediaAsset[]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return items
      .filter((i) => i.public)
      .map((i) => ({ ...i, url: publicUrl(i.bucket, i.path) }))
      .filter((i) => !!i.url);
  }, [items]);

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

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        {rows.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', height: 250, background: 'hsl(var(--background))' }}>
                {item.asset_type === 'photo' ? (
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box
                    component="video"
                    src={item.url}
                    controls
                    playsInline
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}