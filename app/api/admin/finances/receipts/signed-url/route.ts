import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdminApi } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function splitBucketPath(storagePath: string): { bucket: string | null; path: string | null } {
    const raw = String(storagePath || '').trim();
    if (!raw) return { bucket: null, path: null };
    const idx = raw.indexOf('/');
    if (idx <= 0) return { bucket: null, path: raw };
    return { bucket: raw.slice(0, idx), path: raw.slice(idx + 1) };
}

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ ok: false, message: 'Expected JSON body' }, { status: 400 });
    }

    const storagePath = String(body?.storagePath || '').trim();
    const expiresIn = Number.isFinite(Number(body?.expiresIn)) ? Number(body.expiresIn) : 60;

    const { bucket, path } = splitBucketPath(storagePath);
    if (!bucket || !path) return NextResponse.json({ ok: false, message: 'Invalid storagePath' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, signedUrl: data?.signedUrl || null });
}
