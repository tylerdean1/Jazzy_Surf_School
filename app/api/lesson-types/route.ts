import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('lesson_types')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true });
        if (error) throw error;
        return NextResponse.json({ lessonTypes: data });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to load lesson types' }, { status: 500 });
    }
}
