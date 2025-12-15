import { NextResponse } from 'next/server';

/**
 * Stub notification endpoint.
 *
 * Receives booking payloads from the frontend, builds a human-readable summary
 * for the site admin, and returns it. Replace the logging with email/SMS
 * delivery (e.g., SendGrid + Twilio) when ready.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const adminSummary = `New booking request from ${body.customerName} (${body.customerEmail}, ${body.customerPhone}).\n` +
            `Date: ${body.date}\n` +
            `Preferred times: ${(body.timeSlots || []).join(', ') || 'None provided'}\n` +
            `Lesson type: ${body.lessonType}\n` +
            `Party size: ${body.partySize}`;

        // TODO: integrate real SMS/email providers here (Twilio, SendGrid, etc.)
        // eslint-disable-next-line no-console
        console.log('[notify] send to admin:', adminSummary);

        return NextResponse.json({ ok: true, message: 'Notification stub received', adminSummary, payload: body });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
    }
}
