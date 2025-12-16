import { NextResponse } from 'next/server';

export function GET(req: Request) {
    const url = new URL(req.url);
    const redirectTo = url.pathname.startsWith('/api') ? '/adminlogin' : '/adminlogin';
    const res = NextResponse.redirect(new URL(redirectTo, req.url));
    // clear cookie
    res.cookies.set({ name: 'admin', value: '', path: '/', maxAge: 0 });
    return res;
}
