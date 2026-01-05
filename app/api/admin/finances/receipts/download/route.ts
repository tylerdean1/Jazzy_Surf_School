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

function sanitizeDownloadName(name: string): string {
    const justName = String(name || '').replace(/^.*[\\/]/, '');
    // Strip quotes and control chars to keep Content-Disposition safe.
    return justName.replace(/[\r\n\t\0\"\\]/g, '').trim() || 'download';
}

export async function GET(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    const url = new URL(req.url);
    const storagePath = String(url.searchParams.get('storagePath') || '').trim();

    if (!storagePath) {
        return NextResponse.json({ ok: false, message: 'Missing storagePath' }, { status: 400 });
    }

    const { bucket, path } = splitBucketPath(storagePath);
    if (!bucket || !path) {
        return NextResponse.json({ ok: false, message: 'Invalid storagePath' }, { status: 400 });
    }

    const fallbackName = path.split('/').pop() || 'download';
    const filename = sanitizeDownloadName(String(url.searchParams.get('filename') || fallbackName));

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error || !data) {
        return NextResponse.json({ ok: false, message: error?.message || 'Download failed' }, { status: 500 });
    }

    return new NextResponse(data as any, {
        status: 200,
        headers: {
            'Content-Type': (data as any).type || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-store',
        },
    });
}
