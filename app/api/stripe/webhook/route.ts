import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient() as any;
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        const bookingId = pi.metadata?.booking_id;
        if (bookingId) {
          // Update booking -> confirmed
          await supabaseAdmin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
          // Update payment row with fees and net if available
          // Fetch charge to get fee details via balance transaction
          const charges = pi.charges?.data || [];
          const charge = charges[0];
          let stripe_fee = 0;
          let net_amount = 0;
          if (charge?.balance_transaction) {
            const bt = await stripe.balanceTransactions.retrieve(
              typeof charge.balance_transaction === 'string' ? charge.balance_transaction : charge.balance_transaction.id
            );
            stripe_fee = (bt.fee || 0) / 100;
            net_amount = (bt.net || 0) / 100;
          }
          await supabaseAdmin
            .from('payments')
            .update({ status: 'succeeded', stripe_fee, net_amount })
            .eq('stripe_payment_intent_id', pi.id);

          // Mark slot booked
          const time_slot_id = pi.metadata?.time_slot_id;
          if (time_slot_id) {
            await supabaseAdmin.from('time_slots').update({ status: 'booked' }).eq('id', time_slot_id);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any;
        await supabaseAdmin
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', pi.id);
        // release slot back to available
        const time_slot_id = pi.metadata?.time_slot_id;
        if (time_slot_id) {
          await supabaseAdmin
            .from('time_slots')
            .update({ status: 'available' })
            .eq('id', time_slot_id)
            .eq('status', 'held');
        }
        break;
      }
      default:
        break;
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ received: true, error: err?.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
export const runtime = 'nodejs';
