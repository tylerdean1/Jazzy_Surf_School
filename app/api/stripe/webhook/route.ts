import { NextResponse } from 'next/server';

// Frontend-only mode: Stripe webhook processing disabled.
export async function POST() {
  return NextResponse.json({ received: true, mode: 'frontend-only' });
}

export const runtime = 'nodejs';
