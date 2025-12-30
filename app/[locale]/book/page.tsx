'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, Alert } from '@mui/material';
import BookingCalendar, { type BookingData } from '../../../components/BookingCalendar';
import ContentBundleProvider from '@/components/content/ContentBundleContext';
import { useContentBundleContext } from '@/components/content/ContentBundleContext';

export default function BookPage() {
  return (
    <ContentBundleProvider prefix="page.book.">
      <BookInner />
    </ContentBundleProvider>
  );
}

function BookInner() {
  const searchParams = useSearchParams();
  const [bookingComplete, setBookingComplete] = useState(false);
  const initialLessonTypeId = searchParams.get('lesson') || undefined;
  const ctx = useContentBundleContext();
  const strings = ctx?.strings ?? {};
  const fallbackCopy = 'Content unavailable';
  const tDb = (key: string, fallback: string) => {
    const v = strings[key];
    return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
  };

  const title = tDb('page.book.title', fallbackCopy);
  const requestReceived = tDb('page.book.requestReceived', fallbackCopy);

  const handleBookingComplete = (booking: BookingData) => {
    console.log('Booking completed:', booking);
    // Admin follows up manually (no in-app payment processing)
    setBookingComplete(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          {title}
        </Typography>
      </Box>

      {bookingComplete ? (
        <Alert severity="success" sx={{ mb: 4 }}>
          {requestReceived}
        </Alert>
      ) : (
        <BookingCalendar onBookingComplete={handleBookingComplete} initialLessonTypeId={initialLessonTypeId} />
      )}
    </Container>
  );
}
