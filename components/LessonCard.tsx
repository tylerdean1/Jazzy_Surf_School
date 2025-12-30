'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { CheckCircle, AccessTime, LocationOn, Group } from '@mui/icons-material';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import EditableInlineText from '@/components/admin/edit/EditableInlineText';
import useContentBundle from '@/hooks/useContentBundle';

const FALLBACK_COPY = 'Content unavailable';

interface LessonCardProps {
  title: string;
  price: string;
  duration: string;
  location: string;
  description: string;
  includes: string[];
  featured?: boolean;
  cmsKeyBase?: string;
  bookLessonTypeId?: string;
}

const LessonCard: React.FC<LessonCardProps> = ({
  title,
  price,
  duration,
  location,
  description,
  includes,
  featured = false,
  cmsKeyBase,
  bookLessonTypeId
}) => {
  const locale = useLocale();
  const bookHref = bookLessonTypeId ? `/${locale}/book?lesson=${encodeURIComponent(bookLessonTypeId)}` : `/${locale}/book`;

  const ui = useContentBundle('ui.');
  const perPersonLabel = ui.t('ui.lessons.card.perPersonLabel', FALLBACK_COPY);
  const includesLabel = ui.t('ui.lessons.card.includesLabel', FALLBACK_COPY);
  const bookCta = ui.t('ui.lessons.card.bookCta', FALLBACK_COPY);
  const contactPricingValue = ui.t('ui.lessons.card.contactPricingValue', FALLBACK_COPY);

  const durationLabel = cmsKeyBase ? (
            <EditableInlineText cmsKey={`${cmsKeyBase}.duration`} fallback={duration}>
              {(v) => <>{v}</>}
            </EditableInlineText>
  ) : (
    duration
  );

  const locationLabel = cmsKeyBase ? (
            <EditableInlineText cmsKey={`${cmsKeyBase}.location`} fallback={location}>
              {(v) => <>{v}</>}
            </EditableInlineText>
  ) : (
    location
  );

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: featured ? 'scale(1.05)' : 'scale(1)',
        boxShadow: featured ? '0 8px 32px rgba(32, 178, 170, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
        border: featured ? '2px solid #20B2AA' : 'none',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: featured ? 'scale(1.05)' : 'scale(1.02)',
          boxShadow: '0 8px 32px rgba(32, 178, 170, 0.2)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
          {cmsKeyBase ? (
            <EditableInlineText cmsKey={`${cmsKeyBase}.title`} fallback={title}>
              {(v) => <>{v}</>}
            </EditableInlineText>
          ) : (
            title
          )}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" color="#20B2AA" fontWeight={700}>
            {cmsKeyBase ? (
              <EditableInlineText cmsKey={`${cmsKeyBase}.price`} fallback={price}>
                {(v) => <>{v}</>}
              </EditableInlineText>
            ) : (
              price
            )}
          </Typography>
          {price !== contactPricingValue && (
            <Typography variant="body2" color="text.secondary">
              {perPersonLabel}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip icon={<AccessTime />} label={durationLabel} size="small" />
          <Chip icon={<LocationOn />} label={locationLabel} size="small" />
        </Box>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          {cmsKeyBase ? (
            <EditableInlineText cmsKey={`${cmsKeyBase}.description`} fallback={description} multiline fullWidth>
              {(v) => <>{v}</>}
            </EditableInlineText>
          ) : (
            description
          )}
        </Typography>

        <Typography variant="h6" gutterBottom color="#20B2AA">
          {includesLabel}
        </Typography>
        <List dense>
          {includes.map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  cmsKeyBase ? (
                    <EditableInlineText cmsKey={`${cmsKeyBase}.includes.${index}`} fallback={item}>
                      {(v) => <>{v}</>}
                    </EditableInlineText>
                  ) : (
                    item
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Link href={bookHref} style={{ textDecoration: 'none', width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{
              backgroundColor: featured ? '#FF6B6B' : '#20B2AA',
              '&:hover': {
                backgroundColor: featured ? '#FF5252' : '#1A9A9A'
              },
              py: 1.5,
              fontWeight: 600
            }}
          >
            {bookCta}
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
};

export default LessonCard;
