import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminAuth';

type Body = {
    text: string;
    from?: string;
    to?: string;
};

export async function POST(req: Request) {
    const gate = await requireAdminApi(req);
    if (!gate.ok) return gate.response;

    let body: Body;
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const text = String(body?.text ?? '').trim();
    if (!text) {
        return NextResponse.json({ ok: false, message: 'Missing text' }, { status: 400 });
    }

    const from = String(body?.from || 'en');
    const to = String(body?.to || 'es');

    const providerRaw = (process.env.TRANSLATE_PROVIDER || '').trim().toLowerCase();
    const provider = providerRaw || (process.env.DEEPL_API_KEY ? 'deepl' : 'libretranslate');

    try {
        if (provider === 'deepl') {
            const apiKey = (process.env.DEEPL_API_KEY || '').trim();
            if (!apiKey) {
                return NextResponse.json({ ok: false, message: 'Missing DEEPL_API_KEY' }, { status: 500 });
            }

            const endpoint = (process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate').trim();
            const params = new URLSearchParams();
            params.set('auth_key', apiKey);
            params.set('text', text);
            params.set('source_lang', from.toUpperCase());
            params.set('target_lang', to.toUpperCase());

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: data?.message || data?.error || `Translate failed (${res.status})`,
                    },
                    { status: 502 }
                );
            }

            const translated = String(data?.translations?.[0]?.text ?? '').trim();
            if (!translated) {
                return NextResponse.json({ ok: false, message: 'Empty translation result' }, { status: 502 });
            }

            return NextResponse.json({ ok: true, text: translated });
        }

        // Fallback: LibreTranslate (public or self-hosted)
        const endpoint =
            process.env.LIBRETRANSLATE_URL?.trim() ||
            process.env.TRANSLATE_URL?.trim() ||
            'https://libretranslate.com/translate';
        const apiKey = process.env.LIBRETRANSLATE_API_KEY || process.env.TRANSLATE_API_KEY || '';

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return NextResponse.json(
                {
                    ok: false,
                    message: data?.error || data?.message || `Translate failed (${res.status})`,
                },
                { status: 502 }
            );
        }

        const translated = String(data?.translatedText ?? '').trim();
        if (!translated) {
            return NextResponse.json({ ok: false, message: 'Empty translation result' }, { status: 502 });
        }

        return NextResponse.json({ ok: true, text: translated });
    } catch (e: any) {
        return NextResponse.json({ ok: false, message: e?.message || 'Translate failed' }, { status: 502 });
    }
}
