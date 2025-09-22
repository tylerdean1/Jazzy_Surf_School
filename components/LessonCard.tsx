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

interface LessonCardProps {
  title: string;
  price: string;
  duration: string;
  location: string;
  description: string;
  includes: string[];
  featured?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({
  title,
  price,
  duration,
  location,
  description,
  includes,
  featured = false
}) => {
  const locale = useLocale();

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
      {featured && (
        <Chip
          label="Most Popular"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: '#FF6B6B',
            color: 'white',
            fontWeight: 600,
            zIndex: 1
          }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" color="#20B2AA" fontWeight={700}>
            {price}
          </Typography>
          {price !== "Contact for pricing" && (
            <Typography variant="body2" color="text.secondary">
              per person
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip icon={<AccessTime />} label={duration} size="small" />
          <Chip icon={<LocationOn />} label={location} size="small" />
        </Box>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          {description}
        </Typography>

        <Typography variant="h6" gutterBottom color="#20B2AA">
          What&apos;s Included:
        </Typography>
        <List dense>
          {includes.map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Link href={`/${locale}/book`} style={{ textDecoration: 'none', width: '100%' }}>
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
            Book This Lesson
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
};

export default LessonCard;