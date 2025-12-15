'use client';

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const HeroContainer = styled(Box)({
  height: '100vh',
  backgroundImage: 'url("/hero_shot/hero_shot.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  }
});

const ContentBox = styled(Box)({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  color: 'white'
});

interface HeroProps {
  title: string;
  subtitle: string;
  primaryAction: string;
  secondaryAction?: string;
  primaryHref: string;
  secondaryHref?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  primaryHref,
  secondaryHref
}) => {
  const locale = useLocale();

  return (
    <HeroContainer>
      <Container maxWidth="lg">
        <ContentBox>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              mb: 3
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            component="p"
            gutterBottom
            sx={{
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {subtitle}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={primaryHref} style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#FF6B6B',
                  '&:hover': { backgroundColor: '#FF5252' },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                }}
              >
                {primaryAction}
              </Button>
            </Link>
            {secondaryAction && secondaryHref && (
              <Link href={secondaryHref} style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: '#F5E6A3',
                      backgroundColor: 'rgba(245, 230, 163, 0.1)'
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {secondaryAction}
                </Button>
              </Link>
            )}
          </Box>
        </ContentBox>
      </Container>
    </HeroContainer>
  );
};

export default Hero;