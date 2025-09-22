import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const lessonTypeId = searchParams.get('lessonTypeId');

    let query = supabase
      .from('time_slots')
      .select('*')
      .eq('status', 'available')
      .gte('start_time', start)
      .lte('end_time', end)
      .order('start_time', { ascending: true });

    if (lessonTypeId) {
      query = query.eq('lesson_type_id', lessonTypeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ slots: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load availability' }, { status: 500 });
  }
}
