import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

export async function GET() {
    const isAdmin = await isAdminRequest();
    return NextResponse.json({ ok: true, isAdmin });
}
