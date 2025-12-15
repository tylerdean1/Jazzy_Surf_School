export type NotificationPayload = {
    date: string;
    timeSlots: string[];
    lessonType: string;
    partySize: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    adminPhone?: string;
    adminEmail?: string;
};

/**
 * Send booking notification.
 *
 * Currently POSTS to `/api/notify` (a local stub). Replace or extend this
 * implementation to call your SMS/email providers (Twilio, SendGrid, etc.).
 */
export async function sendBookingNotification(payload: NotificationPayload) {
    try {
        const res = await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Notify API error: ${res.status} ${text}`);
        }

        return await res.json();
    } catch (err) {
        // In frontend-only/dev mode we swallow errors and log them. When integrating
        // a real provider you may want to surface errors to the UI or retry.
        // eslint-disable-next-line no-console
        console.warn('sendBookingNotification fallback:', err);
        return { ok: false, error: String(err) };
    }
}
