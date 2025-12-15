import { NextResponse } from 'next/server';

// Frontend-only mode: Supabase integration disabled.
export async function GET() {
  // Provide a stable shape for any legacy callers.
  return NextResponse.json({
    slots: []
  });
}
