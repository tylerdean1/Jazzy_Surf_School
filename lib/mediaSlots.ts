export function normalizeGalleryImagesSlotKey(slotKey: string | null): string | null {
    if (!slotKey) return null;
    const key = String(slotKey).trim();
    const prefix = 'gallery.images.';
    if (!key.startsWith(prefix)) return key;
    const suffix = key.slice(prefix.length);
    if (/^[0-9]+$/.test(suffix)) {
        const n = parseInt(suffix, 10);
        if (Number.isFinite(n) && n >= 0) return `${prefix}${n}`;
    }
    return key;
}
