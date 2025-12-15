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
  Paper
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { sendBookingNotification } from '@/lib/notifications';

export type BookingData = {
  date: string; // yyyy-mm-dd
  timeSlots: string[]; // human-readable time blocks (30-min)
  lessonType: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

interface BookingCalendarProps {
  onBookingComplete: (booking: BookingData) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ onBookingComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: '',
    timeSlots: [],
    lessonType: '',
    partySize: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const steps = ['Select Date & Time', 'Choose Lesson', 'Customer Info'];

  type LessonType = { id: string; name: string; price: number };

  // Frontend-only placeholder data (no Supabase / no API dependency)
  const lessonTypes: LessonType[] = [
    { id: 'beginner', name: 'Beginner Lesson (2 hours)', price: 100 },
    { id: 'intermediate', name: 'Intermediate Lesson (2 hours)', price: 100 },
    { id: 'advanced', name: 'Advanced Coaching (2 hours)', price: 100 }
  ];

  // generate 30-minute slots from 07:00 to 15:30 (last slot ends at 16:00)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 7; hour <= 15; hour++) {
      const h12 = (hour % 12) === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      slots.push(`${h12}:00 ${ampm}`);
      slots.push(`${h12}:30 ${ampm}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    setBookingData((prev) => {
      if (prev.lessonType) return prev;
      return { ...prev, lessonType: lessonTypes[0]?.id || '' };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateTotal = () => {
    const lessonType = lessonTypes.find(lt => lt.id === bookingData.lessonType);
    return lessonType ? Number(lessonType.price) * bookingData.partySize : 0;
  };

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      return;
    }

    // Finalize: prepare payload and call stubbed notification API (TODO: integrate SMS/Email providers)
    const payload = {
      date: bookingData.date,
      timeSlots: bookingData.timeSlots,
      lessonType: bookingData.lessonType,
      partySize: bookingData.partySize,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      adminPhone: '939-525-0307',
      adminEmail: 'sunsetsurfacademy@gmail.com'
    };

    try {
      await sendBookingNotification(payload);
    } catch (err) {
      // log and continue; notification delivery is a best-effort for now
      // eslint-disable-next-line no-console
      console.error('sendBookingNotification error', err);
    }

    onBookingComplete(bookingData);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return Boolean(bookingData.date && bookingData.timeSlots && bookingData.timeSlots.length > 0);
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

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={bookingData.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBookingData({ ...bookingData, date: e.target.value, timeSlots: [] })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time</InputLabel>
                    <Select
                      multiple
                      value={bookingData.timeSlots}
                      label="Time"
                      onChange={(e: any) =>
                        setBookingData({ ...bookingData, timeSlots: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })
                      }
                      disabled={!bookingData.date}
                      renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot}>
                          <Checkbox checked={bookingData.timeSlots.indexOf(slot) > -1} />
                          <ListItemText primary={slot} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Pick one or more 30-minute time blocks that work for you; we will send these to the coach for confirmation.
              </Typography>
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
                  <strong>Date:</strong> {bookingData.date}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong> {bookingData.timeSlots?.length ? bookingData.timeSlots.join(', ') : ''}
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
              {activeStep === steps.length - 1 ? 'Submit Request' : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingCalendar;