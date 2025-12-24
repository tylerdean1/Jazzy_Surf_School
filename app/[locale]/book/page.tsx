'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, Alert } from '@mui/material';
import BookingCalendar, { type BookingData } from '../../../components/BookingCalendar';
import ContentBundleProvider from '@/components/content/ContentBundleContext';
import { useCmsStringValue } from '@/hooks/useCmsStringValue';

export default function BookPage() {
  return (
    <ContentBundleProvider prefix="booking.">
      <BookInner />
    </ContentBundleProvider>
  );
}

function BookInner() {
  const searchParams = useSearchParams();
  const [bookingComplete, setBookingComplete] = useState(false);
  const initialLessonTypeId = searchParams.get('lesson') || undefined;

  const title = useCmsStringValue('booking.title', 'Book Your Lesson').value;
  const requestReceived = useCmsStringValue('booking.requestReceived', 'Booking request received!').value;

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