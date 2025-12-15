import { NextResponse } from 'next/server';

// Frontend-only mode: server-side booking pipeline is disabled.
export async function POST() {
  return NextResponse.json(
    { error: 'Bookings are frontend-only right now (no payment or database).' },
    { status: 501 }
  );
}
