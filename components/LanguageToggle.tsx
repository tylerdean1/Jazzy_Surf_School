'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@mui/material';
import { Language } from '@mui/icons-material';

const LanguageToggle: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'es' : 'en';
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <Button
      onClick={switchLanguage}
      startIcon={<Language />}
      variant="outlined"
      size="small"
      sx={{ 
        color: 'white', 
        borderColor: 'white',
        '&:hover': {
          borderColor: '#20B2AA',
          backgroundColor: 'rgba(32, 178, 170, 0.1)'
        }
      }}
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </Button>
  );
};

export default LanguageToggle;