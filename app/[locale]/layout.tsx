import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from '../../theme';
import Navigation from '../../components/Navigation';
import type { Metadata } from 'next';
import AppLoadingFrame from '@/components/AppLoadingFrame';
import { getPublicCmsString } from '@/lib/publicCms';

const locales = ['en', 'es'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (!locales.includes(locale as any)) notFound();
  const fallbackCopy = 'Content unavailable';
  const title = await getPublicCmsString('ui.meta.title', locale, fallbackCopy);
  const description = await getPublicCmsString('ui.meta.description', locale, fallbackCopy);
  return {
    title,
    description,
    icons: {
      icon: [{ url: '/SSA_Orange_Logo.png', type: 'image/png' }],
    },
    alternates: {
      languages: {
        en: '/en',
        es: '/es',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppLoadingFrame locale={locale}>
          <Navigation />
          <main className="pt-16">{children}</main>
        </AppLoadingFrame>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
