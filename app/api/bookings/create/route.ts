import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { stripe, createPaymentIntent } from '@/lib/stripe';
import type { Database } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdminClient() as any;
    const body = await req.json();
    const { time_slot_id, lesson_type_id, party_size, customer_name, customer_email, customer_phone } = body;

    if (!time_slot_id || !party_size || !customer_name || !customer_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch lesson type for pricing
    const { data: lessonType, error: ltErr } = await supabaseAdmin
      .from('lesson_types')
      .select('*')
      .eq('id', lesson_type_id)
      .single();
    if (ltErr) throw new Error(ltErr.message);
    if (!lessonType) throw new Error('Lesson type not found');

    const confirmedLessonType = lessonType as Database['public']['Tables']['lesson_types']['Row'];
    const total = Number(confirmedLessonType.price) * Number(party_size);

    // Hold slot (optimistic lock)
    const { data: slot, error: slotErr } = await supabaseAdmin
      .from('time_slots')
      .update({ status: 'held' })
      .eq('id', time_slot_id)
      .eq('status', 'available')
      .select()
      .single();
    if (slotErr || !slot) throw new Error('Time slot no longer available');

    // Create booking row (pending)
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from('bookings')
      .insert({
        time_slot_id,
        customer_name,
        customer_email,
        customer_phone,
        party_size,
        total_amount: total,
        status: 'pending',
      })
      .select()
      .single();
    if (bookingErr || !booking) throw new Error(bookingErr?.message || 'Failed to create booking');

    // Create PaymentIntent
    const pi = await createPaymentIntent(total, 'usd', {
      booking_id: booking.id,
      time_slot_id,
      customer_email,
    });

    // Persist payments row
    const { error: payErr } = await supabaseAdmin.from('payments').insert({
      booking_id: booking.id,
      stripe_payment_intent_id: pi.id,
      amount: total,
      status: 'pending',
      stripe_fee: 0,
      net_amount: 0,
    });
    if (payErr) throw new Error(payErr.message);

    // Attach PI to booking
    await supabaseAdmin
      .from('bookings')
      .update({ payment_intent_id: pi.id })
      .eq('id', booking.id);

    return NextResponse.json({ clientSecret: pi.client_secret, bookingId: booking.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create booking' }, { status: 500 });
  }
}
