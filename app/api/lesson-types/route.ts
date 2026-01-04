import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    // Use the service-role client so public lesson types are not accidentally hidden
    // by RLS policies on lesson_types.
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('lesson_types')
        .select('key, display_name, description, price_per_person_cents, is_active, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lessonTypes: data ?? [] });
}
