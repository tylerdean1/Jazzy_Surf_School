import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from '../../theme';
import Navigation from '../../components/Navigation';
import type { Metadata } from 'next';

const locales = ['en', 'es'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (!locales.includes(locale as any)) notFound();
  return {
    title: 'Jazmine Dean Surf School - Professional Surf Lessons in Rincón, PR',
    description: 'Learn to surf with 4x East Coast Champion Jazmine Dean in Rincón, Puerto Rico. Professional surf instruction for all levels.',
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
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navigation />
        <main className="pt-16">{children}</main>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}