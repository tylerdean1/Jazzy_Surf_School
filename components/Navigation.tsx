'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
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
    { key: 'about', href: `/${locale}/about` },
    { key: 'faq', href: `/${locale}/faq` },
    { key: 'contact', href: `/${locale}/contact` }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: '#20B2AA' }}>
        Jazmine Dean Surf
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemText 
                primary={t(item.key)} 
                sx={{ textAlign: 'center', py: 1 }}
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
              Jazmine Dean Surf
            </Link>
          </Typography>
          
          {isMobile ? (
            <>
              <LanguageToggle />
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
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                        } 
                      }}
                    >
                      {t(item.key)}
                    </Button>
                  </Link>
                ))}
                <LanguageToggle />
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