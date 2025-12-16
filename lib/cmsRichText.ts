export const EMPTY_DOC = { type: 'doc', content: [] } as const;

export type TipTapDoc = Record<string, any>;

export function safeParseJsonDoc(value: string | null | undefined): TipTapDoc {
    if (!value) return { ...EMPTY_DOC };
    const trimmed = value.trim();
    if (!trimmed) return { ...EMPTY_DOC };
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') return parsed;
        return { ...EMPTY_DOC };
    } catch {
        return { ...EMPTY_DOC };
    }
}

export function serializeJsonDoc(doc: TipTapDoc): string {
    return JSON.stringify(doc ?? EMPTY_DOC);
}

export function isEmptyDoc(value: string | null | undefined): boolean {
    const doc = safeParseJsonDoc(value);
    const content = (doc as any)?.content;
    return !Array.isArray(content) || content.length === 0;
}
