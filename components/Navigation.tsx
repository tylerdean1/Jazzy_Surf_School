'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Menu, Waves } from '@mui/icons-material';
import LanguageToggle from './LanguageToggle';

const Navigation: React.FC = () => {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'home', href: `/${locale}` },
    { key: 'lessons', href: `/${locale}/lessons` },
    { key: 'schedule', href: `/${locale}/book` },
    { key: 'gallery', href: `/${locale}/gallery` },
    { key: 'about', href: `/${locale}/mission_statement` },
    { key: 'faq', href: `/${locale}/faq` },
    { key: 'contact', href: `/${locale}/contact` }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: '#20B2AA' }}>
        Sunset Surf Academy
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemText
                primary={t(item.key)}
                sx={{
                  textAlign: 'center',
                  py: 1,
                  '& .MuiTypography-root': {
                    color: '#20B2AA',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    '&:hover': {
                      color: '#1a9488'
                    }
                  }
                }}
              />
            </Link>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2 }}>
        <LanguageToggle />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'rgba(32, 178, 170, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar>
          <Waves sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            <Link
              href={`/${locale}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              Sunset Surf Academy
            </Link>
          </Typography>

          {isMobile ? (
            <>
              <LanguageToggle />
              <Link
                href={`/${locale}`}
                style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.5rem' }}
              >
                <Image
                  src="/Logo/SSA_Orange_Logo.png"
                  alt="Surf School orange logo"
                  width={40}
                  height={40}
                  priority
                  style={{ borderRadius: 8 }}
                />
              </Link>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ ml: 1 }}
              >
                <Menu />
              </IconButton>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {navItems.map((item) => (
                  <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
                    <Button
                      color="inherit"
                      sx={{
                        color: 'white',
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {t(item.key)}
                    </Button>
                  </Link>
                ))}
                <LanguageToggle />
                <Link
                  href={`/${locale}`}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <Image
                    src="/Logo/SSA_Orange_Logo.png"
                    alt="Surf School orange logo"
                    width={44}
                    height={44}
                    priority
                    style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  />
                </Link>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;