'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container, Typography, Box, Alert } from '@mui/material';
import BookingCalendar from '../../../components/BookingCalendar';

interface BookingData {
  date: Date | null;
  timeSlot: string;
  lessonType: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function BookPage() {
  const t = useTranslations('booking');
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleBookingComplete = (booking: BookingData) => {
    console.log('Booking completed:', booking);
    // Here you would integrate with Stripe for payment processing
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
          Booking request received! You&apos;ll be redirected to payment processing.
        </Alert>
      ) : (
        <BookingCalendar onBookingComplete={handleBookingComplete} />
      )}
    </Container>
  );
}