'use client';

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

interface Props {
  onSuccess?: () => void;
}

export default function StripeCheckoutForm({ onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      redirect: 'if_required',
    });

    setLoading(false);
    if (error) {
      setErrorMessage(error.message || 'Payment failed');
    } else if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <PaymentElement />
      {errorMessage && (
        <Typography color="error" sx={{ mt: 2 }}>{errorMessage}</Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ mt: 2, backgroundColor: '#20B2AA' }}
      >
        {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Pay now'}
      </Button>
    </Box>
  );
}
