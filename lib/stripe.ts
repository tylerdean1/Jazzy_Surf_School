import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // Use the supported Stripe API version for this SDK typing
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (amount: number, currency = 'usd', metadata?: Record<string, string>) => {
  const amt = Math.round(amount * 100); // cents
  if (!amt || amt < 50) throw new Error('Invalid amount for PaymentIntent');
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amt,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
  return paymentIntent;
};

export default stripe;