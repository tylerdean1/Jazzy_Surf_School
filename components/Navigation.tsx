'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Menu, Waves } from '@mui/icons-material';
import LanguageToggle from './LanguageToggle';
import useContentBundle from '@/hooks/useContentBundle';

const Navigation: React.FC = () => {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const bundle = useContentBundle('nav.');
  const logoUrl = bundle.mediaByKey('nav.logo')?.url || '';

  const onAdminPage = pathname === `/${locale}/admin`;
  const selectedAdminPage = searchParams.get('page') || 'home';

  React.useEffect(() => {
    let cancelled = false;
    if (!onAdminPage) {
      setIsAdmin(false);
      return;
    }

    (async () => {
      const res = await fetch('/api/admin/status');
      const body = await res.json().catch(() => ({}));
      if (cancelled) return;
      setIsAdmin(!!body?.isAdmin);
    })();

    return () => {
      cancelled = true;
    };
  }, [onAdminPage]);

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
            {onAdminPage && isAdmin ? (
              <ListItemText
                primary={t(item.key)}
                sx={{
                  textAlign: 'center',
                  py: 1,
                  '& .MuiTypography-root': {
                    color: '#20B2AA',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    opacity: 0.6,
                  }
                }}
              />
            ) : (
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
            )}
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
            {onAdminPage && isAdmin ? (
              <span>Sunset Surf Academy</span>
            ) : (
              <Link
                href={`/${locale}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                Sunset Surf Academy
              </Link>
            )}
          </Typography>

          {isMobile ? (
            <>
              <LanguageToggle />
              {onAdminPage && isAdmin ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.5rem', opacity: 0.85 }}>
                  {logoUrl ? (
                    <Box component="img" src={logoUrl} alt="Surf School logo" sx={{ width: 40, height: 40, borderRadius: 1 }} />
                  ) : null}
                </Box>
              ) : (
                <Link
                  href={`/${locale}`}
                  style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.5rem' }}
                >
                  {logoUrl ? (
                    <Box component="img" src={logoUrl} alt="Surf School logo" sx={{ width: 40, height: 40, borderRadius: 1 }} />
                  ) : null}
                </Link>
              )}
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
                  onAdminPage && isAdmin ? (
                    <Button
                      key={item.key}
                      color="inherit"
                      disabled
                      sx={{
                        color: 'white',
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '1rem',
                        opacity: 0.7,
                      }}
                    >
                      {t(item.key)}
                    </Button>
                  ) : (
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
                  )
                ))}
                <LanguageToggle />
                {onAdminPage && isAdmin ? (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', opacity: 0.9 }}>
                    {logoUrl ? (
                      <Box
                        component="img"
                        src={logoUrl}
                        alt="Surf School logo"
                        sx={{ width: 44, height: 44, borderRadius: 1.25, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                      />
                    ) : null}
                  </Box>
                ) : (
                  <Link
                    href={`/${locale}`}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    {logoUrl ? (
                      <Box
                        component="img"
                        src={logoUrl}
                        alt="Surf School logo"
                        sx={{ width: 44, height: 44, borderRadius: 1.25, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                      />
                    ) : null}
                  </Link>
                )}
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