'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip
} from '@mui/material';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';

const dateDisplayFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric'
});

const timeDisplayFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit'
});

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date: Date) {
  return dateDisplayFormatter.format(date);
}

function formatTimeForDisplay(isoString: string) {
  const parsed = new Date(isoString);
  return Number.isNaN(parsed.getTime()) ? '' : timeDisplayFormatter.format(parsed);
}

function buildDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

interface BookingData {
  date: Date | null;
  timeSlot: string; // holds time_slot id
  lessonType: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface BookingCalendarProps {
  onBookingComplete: (booking: BookingData) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ onBookingComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: null,
    timeSlot: '',
    lessonType: '',
    partySize: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const steps = ['Select Date & Time', 'Choose Lesson', 'Customer Info', 'Payment'];

  type LessonType = { id: string; name: string; price: number };
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ id: string; start_time: string }[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  const selectedLesson = lessonTypes.find((lt) => lt.id === bookingData.lessonType) || null;
  const selectedSlot = availableSlots.find((slot) => slot.id === bookingData.timeSlot) || null;

  // Load lesson types once on mount
  useEffect(() => {
    // Load Stripe publishable key
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string;
    if (pk) setStripePromise(loadStripe(pk));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Load lesson types
    fetch('/api/lesson-types')
      .then((r) => r.json())
      .then((d) => {
        const types: LessonType[] = d.lessonTypes || [];
        setLessonTypes(types);
      })
      .catch(() => { });
  }, []);

  // When lesson types load, set a default lesson type if not already selected
  useEffect(() => {
    if (!lessonTypes.length) return;
    setBookingData((prev) => {
      if (prev.lessonType) return prev;
      return { ...prev, lessonType: lessonTypes[0]?.id || '' };
    });
  }, [lessonTypes]);

  useEffect(() => {
    if (!bookingData.date) {
      setAvailableSlots([]);
      return;
    }
    const { start, end } = buildDayRange(bookingData.date);
    const ltParam = bookingData.lessonType ? `&lessonTypeId=${encodeURIComponent(bookingData.lessonType)}` : '';
    fetch(`/api/availability?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}${ltParam}`)
      .then((r) => r.json())
      .then((d) => {
        const slots = (d.slots || []).map((s: any) => ({ id: s.id, start_time: s.start_time }));
        setAvailableSlots(slots);
      })
      .catch(() => setAvailableSlots([]));
  }, [bookingData.date, bookingData.lessonType]);

  const calculateTotal = () => {
    return selectedLesson ? Number(selectedLesson.price) * bookingData.partySize : 0;
  };

  const handleNext = () => {
    if (activeStep < steps.length - 2) {
      setActiveStep((step) => step + 1);
    } else if (activeStep === steps.length - 2) {
      // create booking and generate client secret
      // In a full implementation, we would use selected concrete time_slot id; here we mock by sending the time text
      fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_slot_id: bookingData.timeSlot,
          lesson_type_id: bookingData.lessonType,
          party_size: bookingData.partySize,
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setActiveStep((step) => step + 1);
          }
        });
    } else {
      onBookingComplete(bookingData);
    }
  };

  const handleBack = () => {
    setActiveStep((step) => step - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return bookingData.date && bookingData.timeSlot;
      case 1:
        return bookingData.lessonType && bookingData.partySize > 0;
      case 2:
        return bookingData.customerName && bookingData.customerEmail && bookingData.customerPhone;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Your Preferred Date and Time
              </Typography>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lesson Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={bookingData.date ? formatDateForInput(bookingData.date) : ''}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const value = event.target.value;
                      setBookingData((prev) => ({
                        ...prev,
                        date: value ? new Date(`${value}T00:00:00`) : null,
                        timeSlot: ''
                      }));
                    }}
                  />
                </Grid>
              </Grid>

              {bookingData.date && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Available Times for {formatDateForDisplay(bookingData.date)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {availableSlots.length ? (
                      availableSlots.map((slot: { id: string; start_time: string }) => (
                        <Chip
                          key={slot.id}
                          label={formatTimeForDisplay(slot.start_time)}
                          clickable
                          color={bookingData.timeSlot === slot.id ? 'primary' : 'default'}
                          onClick={() =>
                            setBookingData((prev) => ({
                              ...prev,
                              timeSlot: slot.id
                            }))
                          }
                          sx={{ mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No time slots available for this date.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Choose Your Lesson and Party Size
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Lesson Type</InputLabel>
                    <Select
                      value={bookingData.lessonType}
                      label="Lesson Type"
                    onChange={(e: any) =>
                      setBookingData((prev) => ({
                        ...prev,
                        lessonType: e.target.value
                      }))
                    }
                    >
                      {lessonTypes.map((type: LessonType) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name} - ${type.price}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Party Size"
                    type="number"
                    value={bookingData.partySize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBookingData((prev) => ({
                        ...prev,
                        partySize: parseInt(e.target.value, 10) || 1
                      }))
                    }
                    inputProps={{ min: 1, max: 8 }}
                  />
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6">
                  Total: ${calculateTotal()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookingData.partySize} person(s) × ${selectedLesson?.price || 0}
                </Typography>
              </Paper>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={bookingData.customerName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBookingData((prev) => ({
                        ...prev,
                        customerName: e.target.value
                      }))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={bookingData.customerEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBookingData((prev) => ({
                        ...prev,
                        customerEmail: e.target.value
                      }))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={bookingData.customerPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBookingData((prev) => ({
                        ...prev,
                        customerPhone: e.target.value
                      }))
                    }
                  />
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mt: 3, backgroundColor: '#e8f5e8' }}>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Typography variant="body1">
                  <strong>Date:</strong> {bookingData.date ? formatDateForDisplay(bookingData.date) : ''}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong> {selectedSlot ? formatTimeForDisplay(selectedSlot.start_time) : ''}
                </Typography>
                <Typography variant="body1">
                  <strong>Lesson:</strong> {selectedLesson?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Party Size:</strong> {bookingData.partySize}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  <strong>Total: ${calculateTotal()}</strong>
                </Typography>
              </Paper>
            </Box>
          )}

          {activeStep === 3 && clientSecret && stripePromise && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment
              </Typography>
              <Elements options={{ clientSecret }} stripe={stripePromise}>
                <StripeCheckoutForm onSuccess={() => onBookingComplete(bookingData)} />
              </Elements>
            </Box>
          )}

          {activeStep !== 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed()}
                sx={{
                  backgroundColor: '#20B2AA',
                  '&:hover': { backgroundColor: '#1A9A9A' }
                }}
              >
                {activeStep >= steps.length - 2 ? 'Proceed' : 'Next'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingCalendar;