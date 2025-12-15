import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sunset Surf Academy',
  description: 'Learn from some of the best surfers in the world at Sunset Surf Academy in Rincón, Puerto Rico.',
  icons: {
    icon: '/Logo/SSA_Orange_Logo.png',
    shortcut: '/Logo/SSA_Orange_Logo.png',
    apple: '/Logo/SSA_Orange_Logo.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
