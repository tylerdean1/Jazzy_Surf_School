import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdminApi } from '@/lib/adminAuth';
import type { Database } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LessonStatus = Database['public']['Enums']['lesson_status'];

type PostBody =
    | { op: 'create'; session: Omit<Database['public']['Functions']['admin_create_session']['Args'], never> }
    | { op: 'update'; session: Database['public']['Functions']['admin_update_session']['Args'] }
    | { op: 'soft_delete'; id: string }
    | { op: 'restore'; id: string }
    | { op: 'hard_delete'; id: string };

function asString(value: unknown): string {
    return String(value ?? '').trim();
}

function asBool(value: unknown): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeStatus(value: unknown): LessonStatus | undefined {
    const v = asString(value);
    if (
        v === 'booked_unpaid' ||
        v === 'booked_paid_in_full' ||
        v === 'completed' ||
        v === 'canceled_with_refund' ||
        v === 'canceled_without_refund'
    )
        return v;
    return undefined;
}

export async function GET(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    const url = new URL(req.url);
    const includeDeleted = asBool(url.searchParams.get('include_deleted'));

    const supabase = getSupabaseAdmin();

    // Always pass include_deleted to disambiguate overloaded RPC signatures.
    const { data, error } = await supabase.rpc('admin_list_sessions', { include_deleted: includeDeleted } as any);

    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let body: PostBody;
    try {
        body = (await req.json()) as PostBody;
    } catch {
        return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 });
    }

    if (!body || typeof (body as any).op !== 'string') {
        return NextResponse.json({ ok: false, message: 'Invalid body' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (body.op === 'soft_delete' || body.op === 'restore' || body.op === 'hard_delete') {
        const id = asString((body as any).id);
        if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });

        const rpc = body.op === 'soft_delete' ? 'admin_delete_session' : body.op === 'restore' ? 'admin_restore_session' : 'admin_hard_delete_session';
        const { error } = await supabase.rpc(rpc as any, { p_id: id } as any);
        if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }

    if (body.op === 'create') {
        const s: any = (body as any).session || {};

        const payload: Database['public']['Functions']['admin_create_session']['Args'] = {
            p_client_names: Array.isArray(s.p_client_names) ? s.p_client_names.map((x: any) => String(x)) : undefined,
            p_group_size: typeof s.p_group_size === 'number' ? s.p_group_size : undefined,
            // Always pass to avoid ambiguity if legacy overloads exist in DB.
            p_lesson_type_key: (s.p_lesson_type_key != null ? String(s.p_lesson_type_key) : null) as any,
            p_lesson_status: normalizeStatus(s.p_lesson_status),
            p_paid: typeof s.p_paid === 'number' ? s.p_paid : undefined,
            p_session_time: s.p_session_time != null ? String(s.p_session_time) : undefined,
            p_tip: typeof s.p_tip === 'number' ? s.p_tip : undefined,
        };

        const { data, error } = await supabase.rpc('admin_create_session', payload as any);
        if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, item: data ?? null });
    }

    if (body.op === 'update') {
        const s: any = (body as any).session || {};
        const id = asString(s.p_id);
        if (!id) return NextResponse.json({ ok: false, message: 'Missing p_id' }, { status: 400 });

        const payload: Database['public']['Functions']['admin_update_session']['Args'] = {
            p_id: id,
            p_client_names: Array.isArray(s.p_client_names) ? s.p_client_names.map((x: any) => String(x)) : undefined,
            p_group_size: typeof s.p_group_size === 'number' ? s.p_group_size : undefined,
            // Always pass to avoid ambiguity if legacy overloads exist in DB.
            p_lesson_type_key: (s.p_lesson_type_key != null ? String(s.p_lesson_type_key) : null) as any,
            p_lesson_status: normalizeStatus(s.p_lesson_status),
            p_paid: typeof s.p_paid === 'number' ? s.p_paid : undefined,
            p_session_time: s.p_session_time != null ? String(s.p_session_time) : undefined,
            p_tip: typeof s.p_tip === 'number' ? s.p_tip : undefined,
        };

        const { data, error } = await supabase.rpc('admin_update_session', payload as any);
        if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

        // Notes are stored on the sessions table; keep this RPC-only.
        if (s.p_notes !== undefined) {
            const notes = s.p_notes == null ? null : String(s.p_notes);
            const { error: notesErr } = await supabase.rpc('admin_update_session_v2' as any, {
                p_session_id: id,
                p_notes: notes,
            } as any);
            if (notesErr) return NextResponse.json({ ok: false, message: notesErr.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, item: data ?? null });
    }

    return NextResponse.json({ ok: false, message: 'Invalid op' }, { status: 400 });
}
