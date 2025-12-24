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

const locales = ['en', 'es'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (!locales.includes(locale as any)) notFound();
  return {
    title: 'Sunset Surf Academy - Professional Surf Lessons in Rincón, PR',
    description: 'Learn from some of the best surfers in the world at Sunset Surf Academy in Rincón, Puerto Rico. Professional surf instruction for all levels.',
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