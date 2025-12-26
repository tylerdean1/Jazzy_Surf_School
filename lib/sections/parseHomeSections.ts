export type HomeSectionMetaRow = {
    page_key: string;
    body_en: string | null;
    sort: number | null;
};

export type CardGroupSourceKey = 'home.cards.lessons' | 'home.cards.gallery' | 'home.cards.team';
export type CardGroupVariant = 'default';

export type HeroSection = {
    kind: 'hero';
    id: string;
    page_key: string;
    sort: number;
};

export type CardGroupSection = {
    kind: 'card_group';
    id: string;
    page_key: string;
    sort: number;
    sourceKey: CardGroupSourceKey;
    variant?: CardGroupVariant;
};

export type ParsedHomeSection = HeroSection | CardGroupSection;

function isObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object';
}

function safeJsonParse(raw: string | null | undefined): unknown | null {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    if (!trimmed) return null;
    try {
        return JSON.parse(trimmed);
    } catch {
        return null;
    }
}

function parseSectionIdFromMetaKey(pageKey: string): string | null {
    const m = /^section\.([^.]+)\.meta$/.exec(String(pageKey || ''));
    return m?.[1] ?? null;
}

function isCardGroupSourceKey(value: unknown): value is CardGroupSourceKey {
    return value === 'home.cards.lessons' || value === 'home.cards.gallery' || value === 'home.cards.team';
}

function isCardGroupVariant(value: unknown): value is CardGroupVariant {
    return value === 'default';
}

export function parseHomeSections(rows: HomeSectionMetaRow[]): ParsedHomeSection[] {
    const parsed: ParsedHomeSection[] = [];

    for (const row of rows) {
        const id = parseSectionIdFromMetaKey(row.page_key);
        if (!id) continue;

        const meta = safeJsonParse(row.body_en);
        if (!meta || !isObject(meta)) continue;

        const kind = (meta as any).kind;
        if (kind === 'hero') {
            parsed.push({
                kind: 'hero',
                id,
                page_key: String(row.page_key || ''),
                sort: typeof row.sort === 'number' ? row.sort : 0,
            });
            continue;
        }

        if (kind === 'card_group') {
            // Public renderer accepts ONLY canonical shape:
            // { kind:'card_group', sourceKey, variant? }
            const sourceKeyRaw = (meta as any).sourceKey;
            if (!isCardGroupSourceKey(sourceKeyRaw)) continue;

            const variantRaw = (meta as any).variant;
            const variant = isCardGroupVariant(variantRaw) ? variantRaw : undefined;

            parsed.push({
                kind: 'card_group',
                id,
                page_key: String(row.page_key || ''),
                sort: typeof row.sort === 'number' ? row.sort : 0,
                sourceKey: sourceKeyRaw,
                ...(variant ? { variant } : {}),
            });
            continue;
        }

        // Unknown kinds intentionally ignored for now.
    }

    parsed.sort((a, b) => (a.sort - b.sort) || a.page_key.localeCompare(b.page_key));
    return parsed;
}
