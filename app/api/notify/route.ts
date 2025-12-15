import { NextResponse } from 'next/server';

/**
 * Stub notification endpoint.
 *
 * Receives booking payloads from the frontend and returns a simple acknowledgement.
 * Replace the body with provider integrations (Twilio, SendGrid, or a message queue)
 * when ready.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // TODO: integrate real SMS/email providers here (Twilio, SendGrid, etc.)
        // For now, just acknowledge and return the payload for debugging.
        // eslint-disable-next-line no-console
        console.log('[notify] received booking payload:', JSON.stringify(body));

        return NextResponse.json({ ok: true, message: 'Notification stub received', payload: body });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
    }
}
