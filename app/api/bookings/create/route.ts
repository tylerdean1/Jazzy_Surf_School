import { NextResponse } from 'next/server';

// Frontend-only mode: Supabase + Stripe booking pipeline disabled.
export async function POST() {
  return NextResponse.json(
    { error: 'Bookings are frontend-only right now (no payment or database).' },
    { status: 501 }
  );
}
