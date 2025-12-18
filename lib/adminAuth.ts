import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_ACCESS_TOKEN_COOKIE = 'admin_at';

function getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        path: '/',
        sameSite: 'lax' as const,
        secure: isProd,
    };
}

function isMutationMethod(method: string) {
    return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
}

function sameOrigin(req: Request): boolean {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (!host) return false;

    const allowedHttp = `http://${host}`;
    const allowedHttps = `https://${host}`;

    const value = origin || referer;
    if (!value) return false;

    return value.startsWith(allowedHttp) || value.startsWith(allowedHttps);
}

export function setAdminAccessTokenCookie(res: NextResponse, accessToken: string) {
    // Access tokens expire quickly; keep cookie lifetime aligned.
    res.cookies.set({ name: ADMIN_ACCESS_TOKEN_COOKIE, value: accessToken, maxAge: 60 * 60, ...getCookieOptions() });
}

export function clearAdminAuthCookies(res: NextResponse) {
    res.cookies.set({ name: ADMIN_ACCESS_TOKEN_COOKIE, value: '', maxAge: 0, ...getCookieOptions() });
    // Back-compat: clear the legacy cookie if it exists.
    res.cookies.set({ name: 'admin', value: '', maxAge: 0, ...getCookieOptions() });
}

export async function requireAdminApi(req: Request): Promise<
    | { ok: true; userId: string }
    | { ok: false; response: NextResponse }
> {
    if (isMutationMethod(req.method) && !sameOrigin(req)) {
        return {
            ok: false,
            response: NextResponse.json({ ok: false, message: 'Bad origin' }, { status: 403 }),
        };
    }

    const token = cookies().get(ADMIN_ACCESS_TOKEN_COOKIE)?.value || '';
    if (!token) {
        return {
            ok: false,
            response: NextResponse.json({ ok: false, message: 'Not authorized' }, { status: 401 }),
        };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user?.id) {
        return {
            ok: false,
            response: NextResponse.json({ ok: false, message: 'Invalid or expired session' }, { status: 401 }),
        };
    }

    const userId = data.user.id;
    const { data: adminRow, error: adminErr } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

    if (adminErr) {
        return {
            ok: false,
            response: NextResponse.json({ ok: false, message: 'Failed to validate admin user' }, { status: 500 }),
        };
    }

    if (!adminRow?.id) {
        return {
            ok: false,
            response: NextResponse.json({ ok: false, message: 'User is not an admin' }, { status: 403 }),
        };
    }

    return { ok: true, userId };
}

export async function isAdminRequest(): Promise<boolean> {
    const token = cookies().get(ADMIN_ACCESS_TOKEN_COOKIE)?.value || '';
    if (!token) return false;

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data?.user?.id) return false;

        const { data: adminRow, error: adminErr } = await supabaseAdmin
            .from('admin_users')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

        if (adminErr) return false;
        return !!adminRow?.id;
    } catch {
        return false;
    }
}
