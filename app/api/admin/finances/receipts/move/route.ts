import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdminApi } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ ok: false, message: 'Expected JSON body' }, { status: 400 });
    }

    const bucket = String(body?.bucket || '').trim();
    const fromPath = String(body?.fromPath || '').trim();
    const toPath = String(body?.toPath || '').trim();

    if (!bucket) return NextResponse.json({ ok: false, message: 'Missing bucket' }, { status: 400 });
    if (!fromPath) return NextResponse.json({ ok: false, message: 'Missing fromPath' }, { status: 400 });
    if (!toPath) return NextResponse.json({ ok: false, message: 'Missing toPath' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const storage = supabase.storage.from(bucket) as any;

    if (typeof storage.move === 'function') {
        const { error } = await storage.move(fromPath, toPath);
        if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }

    const { error: copyErr } = await storage.copy(fromPath, toPath);
    if (copyErr) return NextResponse.json({ ok: false, message: copyErr.message }, { status: 500 });

    const { error: removeErr } = await storage.remove([fromPath]);
    if (removeErr) return NextResponse.json({ ok: false, message: removeErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
