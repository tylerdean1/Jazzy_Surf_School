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

function collectText(node: any, out: string[]) {
    if (!node) return;
    if (typeof node.text === 'string') out.push(node.text);
    const content = node.content;
    if (Array.isArray(content)) {
        for (const child of content) collectText(child, out);
    }
}

export function docToPlainText(value: string | null | undefined): string {
    const doc = safeParseJsonDoc(value);
    const blocks = Array.isArray((doc as any)?.content) ? ((doc as any).content as any[]) : [];
    const lines: string[] = [];

    for (const block of blocks) {
        const buf: string[] = [];
        collectText(block, buf);
        const line = buf.join('');
        if (line.trim().length) lines.push(line);
    }

    return lines.join('\n\n');
}

export function plainTextToDocJson(text: string): string {
    const normalized = String(text ?? '').replace(/\r\n/g, '\n');
    const parts = normalized
        .split(/\n\s*\n/g)
        .map((p) => p.trim())
        .filter(Boolean);

    const doc: any = {
        type: 'doc',
        content: parts.length
            ? parts.map((p) => ({ type: 'paragraph', content: [{ type: 'text', text: p }] }))
            : [],
    };

    return serializeJsonDoc(doc);
}
