import { NextResponse } from 'next/server';
import { clearAdminAuthCookies } from '@/lib/adminAuth';

export function GET(req: Request) {
    const ref = req.headers.get('referer') || '';
    let locale = 'en';
    try {
        if (ref) {
            const u = new URL(ref);
            const seg = u.pathname.split('/').filter(Boolean)[0];
            if (seg === 'en' || seg === 'es') locale = seg;
        }
    } catch {
        // ignore
    }

    const res = NextResponse.redirect(new URL(`/${locale}/adminlogin`, req.url));
    clearAdminAuthCookies(res);
    return res;
}
