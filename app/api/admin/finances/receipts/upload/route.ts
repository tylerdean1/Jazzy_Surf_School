import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdminApi } from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FINANCES_BUCKET = 'Finances';

const FINANCES_FOLDERS_BY_CATEGORY: Record<string, string> = {
    fuel: 'Fuel',
    equipment: 'Equipment',
    advertising: 'Advertising',
    lessons: 'Lessons',
    food: 'Food',
    software: 'Software',
    payroll: 'Payroll',
    other: 'Other',
};

function sanitizeFileName(name: string): string {
    const justName = name.replace(/^.*[\\/]/, '');
    return justName.replace(/[\\/]/g, '').trim();
}

function categoryToFolder(category: string): string {
    const key = String(category || '').trim();
    const mapped = FINANCES_FOLDERS_BY_CATEGORY[key];
    return (mapped != null ? mapped : key) || 'Other';
}

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return NextResponse.json({ ok: false, message: 'Expected multipart/form-data' }, { status: 400 });
    }

    const expenseId = String(form.get('expense_id') || '').trim();
    const category = String(form.get('category') || '').trim();
    const file = form.get('file');

    if (!expenseId) return NextResponse.json({ ok: false, message: 'Missing expense_id' }, { status: 400 });
    if (!category) return NextResponse.json({ ok: false, message: 'Missing category' }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ ok: false, message: 'Missing file' }, { status: 400 });

    const folder = categoryToFolder(category);
    const safeName = sanitizeFileName(file.name || 'receipt');
    const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now());
    // Store directly under the category folder (no deep nesting).
    const objectPath = `${folder}/${Date.now()}_${id}_${safeName || 'receipt'}`;

    const supabase = getSupabaseAdmin();
    const { error: uploadErr } = await supabase.storage
        .from(FINANCES_BUCKET)
        .upload(objectPath, file, { upsert: false, contentType: file.type || undefined });

    if (uploadErr) {
        return NextResponse.json({ ok: false, message: uploadErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, bucket: FINANCES_BUCKET, path: objectPath, storagePath: `${FINANCES_BUCKET}/${objectPath}` });
}
