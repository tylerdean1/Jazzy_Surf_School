'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, Alert } from '@mui/material';
import BookingCalendar, { type BookingData } from '../../../components/BookingCalendar';

export default function BookPage() {
  const t = useTranslations('booking');
  const searchParams = useSearchParams();
  const [bookingComplete, setBookingComplete] = useState(false);
  const initialLessonTypeId = searchParams.get('lesson') || undefined;

  const handleBookingComplete = (booking: BookingData) => {
    console.log('Booking completed:', booking);
    // Admin follows up manually (no in-app payment processing)
    setBookingComplete(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom color="#20B2AA">
          {t('title')}
        </Typography>
      </Box>

      {bookingComplete ? (
        <Alert severity="success" sx={{ mb: 4 }}>
          Booking request received!
        </Alert>
      ) : (
        <BookingCalendar onBookingComplete={handleBookingComplete} initialLessonTypeId={initialLessonTypeId} />
      )}
    </Container>
  );
}