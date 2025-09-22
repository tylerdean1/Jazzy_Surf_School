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
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';

const localizer = momentLocalizer(moment);

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
  const [stripePromise, setStripePromise] = useState<any>(null);

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
    if (!bookingData.date) return;
    const start = moment(bookingData.date).startOf('day').toISOString();
    const end = moment(bookingData.date).endOf('day').toISOString();
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
    const lessonType = lessonTypes.find(lt => lt.id === bookingData.lessonType);
    return lessonType ? Number(lessonType.price) * bookingData.partySize : 0;
  };

  const handleNext = () => {
    if (activeStep < steps.length - 2) {
      setActiveStep(activeStep + 1);
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
      }).then(res => res.json()).then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setActiveStep(activeStep + 1);
        }
      });
    } else {
      onBookingComplete(bookingData);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
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

              <Box sx={{ height: 400, mb: 3 }}>
                <Calendar
                  localizer={localizer}
                  events={[]}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  onSelectSlot={(slotInfo: { start: Date; end: Date }) => {
                    setBookingData({
                      ...bookingData,
                      date: slotInfo.start
                    });
                  }}
                  style={{ height: '100%' }}
                />
              </Box>

              {bookingData.date && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Available Times for {moment(bookingData.date).format('MMMM Do, YYYY')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {availableSlots.map((slot: { id: string; start_time: string }) => (
                      <Chip
                        key={slot.id}
                        label={moment(slot.start_time).format('h:mm A')}
                        clickable
                        color={bookingData.timeSlot === slot.id ? 'primary' : 'default'}
                        onClick={() => setBookingData({ ...bookingData, timeSlot: slot.id })}
                        sx={{ mb: 1 }}
                      />
                    ))}
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
                      onChange={(e: any) => setBookingData({
                        ...bookingData,
                        lessonType: e.target.value
                      })}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingData({
                      ...bookingData,
                      partySize: parseInt(e.target.value) || 1
                    })}
                    inputProps={{ min: 1, max: 8 }}
                  />
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6">
                  Total: ${calculateTotal()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookingData.partySize} person(s) × ${lessonTypes.find((lt: LessonType) => lt.id === bookingData.lessonType)?.price || 0}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingData({
                      ...bookingData,
                      customerName: e.target.value
                    })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={bookingData.customerEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingData({
                      ...bookingData,
                      customerEmail: e.target.value
                    })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={bookingData.customerPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingData({
                      ...bookingData,
                      customerPhone: e.target.value
                    })}
                  />
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mt: 3, backgroundColor: '#e8f5e8' }}>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Typography variant="body1">
                  <strong>Date:</strong> {bookingData.date ? moment(bookingData.date).format('MMMM Do, YYYY') : ''}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong> {availableSlots.find((s) => s.id === bookingData.timeSlot) ? moment(availableSlots.find((s) => s.id === bookingData.timeSlot)!.start_time).format('h:mm A') : ''}
                </Typography>
                <Typography variant="body1">
                  <strong>Lesson:</strong> {lessonTypes.find(lt => lt.id === bookingData.lessonType)?.name}
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