'use client';

import * as React from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import Hero from '@/components/Hero';
import MediaPickerDialog, { type MediaSelection } from '@/components/admin/MediaPickerDialog';
import { RichTextEditor, RichTextRenderer } from '@/components/admin/RichText';
import useContentBundle from '@/hooks/useContentBundle';
import ContentBundleProvider from '@/components/content/ContentBundleContext';
import { AdminSectionPreview } from '@/components/admin/sections/sectionRegistry';
import type { CardGroupSourceKey, CardGroupVariant, SectionKind, SectionMeta } from '@/components/admin/sections/sectionMeta';

type CmsListRow = {
    id: string;
    page_key: string;
    category: string | null;
    sort: number;
    body_en: string | null;
    body_es_draft: string | null;
    updated_at: string;
};

type CmsRow = {
    body_en: string | null;
    body_es_draft: string | null;
};

type SectionDraft = {
    localId: string;
    sectionId: string | null;
    kind: SectionKind;
    sort: number;
    metaKey: string | null;
    metaJson: SectionMeta | null;

    // card_group
    cardGroupSourceKey: CardGroupSourceKey | '';
    cardGroupVariant: CardGroupVariant | '';

    // richText content (TipTap JSON string)
    richTextEn: string;
    richTextEs: string;

    // media block
    mediaSelection: MediaSelection | null;
    mediaUrl: string;

    deleted: boolean;
};

const PAGE_KEY = 'home';
const CANONICAL_CATEGORY = `sections.page.${PAGE_KEY}`;
const LEGACY_CATEGORY = `draft.page.${PAGE_KEY}.sections`;

const CARD_GROUP_OPTIONS: Array<{
    sourceKey: CardGroupSourceKey;
    label: string;
    fallbackTitle: string;
    fallbackDescription: string;
}> = [
    {
        sourceKey: 'home.cards.lessons',
        label: 'Lessons',
        fallbackTitle: 'Surf Lessons',
        fallbackDescription: 'From beginner-friendly sessions to advanced coaching',
    },
    {
        sourceKey: 'home.cards.gallery',
        label: 'Gallery',
        fallbackTitle: 'Experience the Journey',
        fallbackDescription: 'Watch videos and see photos from our surf adventures',
    },
    {
        sourceKey: 'home.cards.team',
        label: 'Team',
        fallbackTitle: 'Meet the Team',
        fallbackDescription: 'Get to know the coaches who make Sunset Surf Academy special',
    },
];

function isCardGroupSourceKey(v: unknown): v is CardGroupSourceKey {
    return CARD_GROUP_OPTIONS.some((o) => o.sourceKey === v);
}

function getCardGroupOption(sourceKey: CardGroupSourceKey | '') {
    const key = sourceKey && isCardGroupSourceKey(sourceKey) ? sourceKey : CARD_GROUP_OPTIONS[0].sourceKey;
    return CARD_GROUP_OPTIONS.find((o) => o.sourceKey === key) || CARD_GROUP_OPTIONS[0];
}

const CARD_GROUP_VARIANT_OPTIONS: Array<{ value: CardGroupVariant; label: string }> = [{ value: 'default', label: 'Default' }];

function clampSmallint(n: number, fallback: number) {
    if (!Number.isFinite(n)) return fallback;
    return Math.max(-32768, Math.min(32767, Math.floor(n)));
}

function safeJsonParse<T>(raw: string | null | undefined): T | null {
    if (!raw) return null;
    const trimmed = String(raw).trim();
    if (!trimmed) return null;
    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return null;
    }
}

async function adminListCmsRows(category: string, pageKeyLike?: string): Promise<CmsListRow[]> {
    const url = new URL('/api/admin/cms/page-content', window.location.origin);
    url.searchParams.set('category', category);
    if (pageKeyLike) url.searchParams.set('page_key_like', pageKeyLike);

    const res = await fetch(url.toString(), { method: 'GET' });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) throw new Error(body?.message || `Request failed (${res.status})`);

    const items = (body?.items ?? []) as any[];
    return items.map((r) => ({
        id: String(r.id || ''),
        page_key: String(r.page_key || ''),
        category: r.category ?? null,
        sort: Number(r.sort ?? 0),
        body_en: r.body_en ?? null,
        body_es_draft: r.body_es_draft ?? null,
        updated_at: String(r.updated_at || ''),
    }));
}

async function adminGetCmsRow(pageKey: string): Promise<CmsRow | null> {
    const res = await fetch(`/api/admin/cms/page-content?page_key=${encodeURIComponent(pageKey)}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) return null;
    const row = body?.row as any;
    if (!row) return null;
    return { body_en: row.body_en ?? null, body_es_draft: row.body_es_draft ?? null };
}

async function adminSaveCmsRow(payload: any): Promise<any> {
    const res = await fetch('/api/admin/cms/page-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) throw new Error(body?.message || `Request failed (${res.status})`);
    return body;
}

async function adminSetMediaSlot(slotKey: string, assetId: string | null, sort: number) {
    const res = await fetch('/api/admin/media/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'set', slot_key: slotKey, asset_id: assetId, sort }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.ok === false) throw new Error(body?.message || `Request failed (${res.status})`);
}

async function fetchSignedUrl(bucket: string, path: string): Promise<string> {
    const res = await fetch(
        `/api/admin/media/signed-url?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}&expiresIn=900`
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) throw new Error(body?.message || `Failed (${res.status})`);
    return String(body?.url || '');
}

async function loadMediaPreviewBySlotKey(slotKey: string): Promise<{ selection: MediaSelection | null; url: string } | null> {
    const res = await fetch(`/api/admin/media/slots?prefix=${encodeURIComponent(slotKey)}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.ok === false) return null;
    const items = (body?.items ?? []) as any[];
    const it = items.find((x) => x?.slot_key === slotKey) || null;
    const asset = it?.asset;
    if (!asset?.bucket || !asset?.path) return { selection: null, url: '' };

    const url2 = await fetchSignedUrl(String(asset.bucket), String(asset.path));
    return {
        selection: {
            id: String(asset.id),
            assetKey: null,
            bucket: String(asset.bucket),
            path: String(asset.path),
            previewUrl: url2,
        },
        url: url2,
    };
}

function makeTempId() {
    return `temp:${crypto.randomUUID()}`;
}

function nextSortForIndex(i: number) {
    // 10-step spacing for easier inserts
    return i * 10;
}

export default function HomeSectionsWizard() {
    const admin = useContentBundle('admin.');

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [sections, setSections] = React.useState<SectionDraft[]>([]);

    const [addKind, setAddKind] = React.useState<SectionKind>('richText');
    const [pickerOpenFor, setPickerOpenFor] = React.useState<string | null>(null);

    const [tab, setTab] = React.useState<'list' | 'preview'>('list');
    const [localeTab, setLocaleTab] = React.useState<'en' | 'es'>('en');

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [canonRows, legacyRows] = await Promise.all([
                adminListCmsRows(CANONICAL_CATEGORY, 'section.%.meta'),
                adminListCmsRows(LEGACY_CATEGORY, 'section.%.meta'),
            ]);

            // Merge/dedupe by page_key. Prefer canonical if both exist.
            const byKey: Record<string, CmsListRow> = {};
            for (const r of canonRows) byKey[r.page_key] = r;
            for (const r of legacyRows) if (!byKey[r.page_key]) byKey[r.page_key] = r;

            const metaRows: CmsListRow[] = [];
            for (const k in byKey) metaRows.push(byKey[k]);

            const next: SectionDraft[] = metaRows.map((r) => {
                const metaRaw = safeJsonParse<any>(r.body_en);
                const kind = (metaRaw?.kind || 'richText') as SectionKind;
                const sectionId = String(r.id || '').trim() || null;

                let metaJson: SectionMeta | null = (metaRaw as SectionMeta) ?? null;

                // Normalize card_group meta (accept legacy `fields.sourceKey` but store as top-level for editing).
                let cardGroupSourceKey: CardGroupSourceKey | '' = '';
                let cardGroupVariant: CardGroupVariant | '' = '';
                if (kind === 'card_group') {
                    const sourceKeyRaw = metaRaw?.sourceKey ?? metaRaw?.fields?.sourceKey;
                    const sourceKey = isCardGroupSourceKey(sourceKeyRaw) ? sourceKeyRaw : CARD_GROUP_OPTIONS[0].sourceKey;
                    const variantRaw = metaRaw?.variant ?? metaRaw?.fields?.variant;
                    const variant = variantRaw === 'default' ? 'default' : '';

                    cardGroupSourceKey = sourceKey;
                    cardGroupVariant = variant;

                    metaJson = {
                        version: 1,
                        kind: 'card_group',
                        owner: metaRaw?.owner ?? { type: 'page', key: PAGE_KEY },
                        sort: Number.isFinite(r.sort) ? r.sort : 0,
                        sourceKey,
                        ...(variant ? { variant } : {}),
                    };
                }

                return {
                    localId: sectionId || makeTempId(),
                    sectionId,
                    kind,
                    sort: Number.isFinite(r.sort) ? r.sort : 0,
                    metaKey: r.page_key,
                    metaJson,

                    cardGroupSourceKey,
                    cardGroupVariant,

                    richTextEn: '',
                    richTextEs: '',
                    mediaSelection: null,
                    mediaUrl: '',
                    deleted: false,
                };
            });

            // Best-effort hydrate rich-text + media drafts for supported kinds.
            await Promise.all(
                next.map(async (s) => {
                    if (!s.sectionId) return;

                    if (s.kind === 'richText') {
                        const k = `section.${s.sectionId}.body`;
                        const row = await adminGetCmsRow(k);
                        s.richTextEn = row?.body_en ?? '';
                        s.richTextEs = row?.body_es_draft ?? '';
                    }

                    if (s.kind === 'media') {
                        const slotKey = `section.${s.sectionId}.media.0`;
                        const p = await loadMediaPreviewBySlotKey(slotKey);
                        if (p) {
                            s.mediaSelection = p.selection;
                            s.mediaUrl = p.url;
                        }
                    }

                    if (s.kind === 'hero') {
                        // Hero is edited via the dedicated HomeHeroWizard.
                        // Still preview minimal data if we can.
                        const titleKey = (s.metaJson as any)?.fields?.titleKey;
                        const subtitleKey = (s.metaJson as any)?.fields?.subtitleKey;
                        if (titleKey) {
                            const r1 = await adminGetCmsRow(String(titleKey));
                            // Store in the EN richText field just for preview fallback text.
                            s.richTextEn = r1?.body_en ?? '';
                            s.richTextEs = r1?.body_es_draft ?? '';
                        }
                        if (subtitleKey && !s.richTextEn) {
                            const r2 = await adminGetCmsRow(String(subtitleKey));
                            s.richTextEn = r2?.body_en ?? '';
                            s.richTextEs = r2?.body_es_draft ?? '';
                        }

                        const heroSlot = (s.metaJson as any)?.media?.heroBackground?.slotKey;
                        if (heroSlot) {
                            const p = await loadMediaPreviewBySlotKey(String(heroSlot));
                            if (p) {
                                s.mediaSelection = p.selection;
                                s.mediaUrl = p.url;
                            }
                        }
                    }
                })
            );

            next.sort((a, b) => a.sort - b.sort || String(a.metaKey || '').localeCompare(String(b.metaKey || '')));
            setSections(next);
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sectionsWizard.errors.loadFailed', 'Failed to load sections'));
            setSections([]);
        } finally {
            setLoading(false);
        }
    }, [admin]);

    const openWizard = async () => {
        setOpen(true);
        setTab('list');
        setLocaleTab('en');
        await load();
    };

    const closeWizard = () => {
        setOpen(false);
        setError(null);
        setSections([]);
        setPickerOpenFor(null);
    };

    const visibleSections = React.useMemo(() => sections.filter((s) => !s.deleted), [sections]);

    const move = (localId: string, dir: -1 | 1) => {
        setSections((prev) => {
            const next = [...prev];
            const vis = next.filter((s) => !s.deleted);
            const idx = vis.findIndex((s) => s.localId === localId);
            if (idx < 0) return prev;
            const swapIdx = idx + dir;
            if (swapIdx < 0 || swapIdx >= vis.length) return prev;

            const a = vis[idx];
            const b = vis[swapIdx];
            const ai = next.findIndex((s) => s.localId === a.localId);
            const bi = next.findIndex((s) => s.localId === b.localId);
            if (ai < 0 || bi < 0) return prev;

            next.splice(ai, 1);
            next.splice(bi, 0, a);

            // Recompute sorts deterministically.
            const reordered = next.filter((s) => !s.deleted);
            for (let i = 0; i < reordered.length; i++) {
                const s = reordered[i];
                s.sort = nextSortForIndex(i);
            }
            return [...next];
        });
    };

    const markDeleted = (localId: string) => {
        setSections((prev) => prev.map((s) => (s.localId === localId ? { ...s, deleted: true } : s)));
    };

    const addSection = () => {
        setError(null);
        const localId = makeTempId();
        const nextIndex = visibleSections.length;
        const sort = nextSortForIndex(nextIndex);

        const defaultCardSource = CARD_GROUP_OPTIONS[0].sourceKey;
        const nextCardSourceKey = addKind === 'card_group' ? defaultCardSource : '';
        const nextCardVariant: CardGroupVariant | '' = '';

        let meta: SectionMeta;
        switch (addKind) {
            case 'card_group':
                meta = {
                    version: 1,
                    kind: 'card_group',
                    owner: { type: 'page', key: PAGE_KEY },
                    sort,
                    sourceKey: defaultCardSource,
                };
                break;
            case 'hero':
                meta = {
                    version: 1,
                    kind: 'hero',
                    owner: { type: 'page', key: PAGE_KEY },
                    sort,
                };
                break;
            case 'media':
                meta = {
                    version: 1,
                    kind: 'media',
                    owner: { type: 'page', key: PAGE_KEY },
                    sort,
                };
                break;
            case 'richText':
            default:
                meta = {
                    version: 1,
                    kind: 'richText',
                    owner: { type: 'page', key: PAGE_KEY },
                    sort,
                };
                break;
        }

        const draft: SectionDraft = {
            localId,
            sectionId: null,
            kind: addKind,
            sort,
            metaKey: null,
            metaJson: meta,

            cardGroupSourceKey: nextCardSourceKey,
            cardGroupVariant: nextCardVariant,

            richTextEn: '',
            richTextEs: '',
            mediaSelection: null,
            mediaUrl: '',
            deleted: false,
        };

        setSections((prev) => [...prev, draft]);
    };

    const onPickMedia = async (localId: string, s: MediaSelection) => {
        setError(null);
        setSections((prev) =>
            prev.map((it) => (it.localId === localId ? { ...it, mediaSelection: s, mediaUrl: it.mediaUrl } : it))
        );
        try {
            const url = s.previewUrl || (s.bucket && s.path ? await fetchSignedUrl(s.bucket, s.path) : '');
            setSections((prev) => prev.map((it) => (it.localId === localId ? { ...it, mediaUrl: url } : it)));
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sectionsWizard.errors.previewFailed', 'Failed to load preview'));
        }
    };

    const saveAll = async () => {
        setSaving(true);
        setError(null);
        try {
            const desired = sections.filter((s) => !s.deleted);

            // 1) Create new sections (server-minted IDs) on final save.
            // We then write their meta + known kind-specific rows.
            for (let i = 0; i < desired.length; i++) {
                const s = desired[i];
                const sort = clampSmallint(nextSortForIndex(i), 0);

                if (!s.sectionId) {
                    const created = await adminSaveCmsRow({
                        op: 'create_section',
                        category: CANONICAL_CATEGORY,
                        kind: s.kind,
                        sort,
                        owner: { type: 'page', key: PAGE_KEY },
                    });
                    const id = String(created?.sectionId || '').trim();
                    if (!id) throw new Error('Failed to create section id');

                    s.sectionId = id;
                    s.metaKey = `section.${id}.meta`;
                }

                // 2) Persist meta row sort/category/body_en (keeping kind/owner).
                const metaKey = s.metaKey || `section.${s.sectionId}.meta`;
                const metaJson: any = {
                    ...((s.metaJson as any) || { version: 1, kind: s.kind }),
                    version: 1,
                    kind: s.kind,
                    owner: { type: 'page', key: PAGE_KEY },
                    sort,
                };

                // kind-specific pointers
                if (s.kind === 'richText') {
                    metaJson.fields = { bodyKey: `section.${s.sectionId}.body` };
                }
                if (s.kind === 'media') {
                    metaJson.media = { primary: { type: 'single', slotKey: `section.${s.sectionId}.media.0` } };
                }
                if (s.kind === 'card_group') {
                    const opt = getCardGroupOption(s.cardGroupSourceKey);
                    const nextCardMeta: SectionMeta = {
                        version: 1,
                        kind: 'card_group',
                        owner: { type: 'page', key: PAGE_KEY },
                        sort,
                        sourceKey: opt.sourceKey,
                        ...(s.cardGroupVariant ? { variant: s.cardGroupVariant } : {}),
                    };
                    await adminSaveCmsRow({
                        op: 'save',
                        page_key: metaKey,
                        category: CANONICAL_CATEGORY,
                        sort,
                        body_en: JSON.stringify(nextCardMeta),
                    });

                    // No legacy `home.cards.*` writes in Phase 4.
                    continue;
                }

                await adminSaveCmsRow({
                    op: 'save',
                    page_key: metaKey,
                    category: CANONICAL_CATEGORY,
                    sort,
                    body_en: JSON.stringify(metaJson),
                });

                // 3) Persist kind-specific rows.
                if (s.kind === 'richText') {
                    await adminSaveCmsRow({
                        op: 'save',
                        page_key: `section.${s.sectionId}.body`,
                        body_en: s.richTextEn ?? '',
                        body_es_draft: s.richTextEs ?? '',
                    });
                }

                if (s.kind === 'media') {
                    await adminSetMediaSlot(`section.${s.sectionId}.media.0`, s.mediaSelection?.id ?? null, 0);
                }
            }

            // 4) Delete removed sections (meta + known fields/media).
            const removed = sections.filter((s) => s.deleted && s.sectionId);
            for (const s of removed) {
                const id = s.sectionId;
                if (!id) continue;

                // Kind-specific cleanup (best-effort).
                if (s.kind === 'richText') {
                    await adminSaveCmsRow({ op: 'delete', page_key: `section.${id}.body` });
                }
                if (s.kind === 'media') {
                    await adminSetMediaSlot(`section.${id}.media.0`, null, 0);
                }
                if (s.kind === 'hero') {
                    // Clear hero background media (stable key) and the pointer used by the hero wizard.
                    await adminSetMediaSlot(`section.${id}.heroBackground`, null, 0);
                    await adminSaveCmsRow({ op: 'delete', page_key: 'draft.page.home.hero.sectionId' });
                    await adminSaveCmsRow({ op: 'delete', page_key: `section.${id}.title` });
                    await adminSaveCmsRow({ op: 'delete', page_key: `section.${id}.subtitle` });
                    await adminSaveCmsRow({ op: 'delete', page_key: `section.${id}.primaryAction.label` });
                    await adminSaveCmsRow({ op: 'delete', page_key: `section.${id}.secondaryAction.label` });
                }

                await adminSaveCmsRow({ op: 'delete', page_key: `section.${id}.meta` });
            }

            await load();
            setTab('preview');
        } catch (e: any) {
            setError(e?.message || admin.t('admin.sectionsWizard.errors.saveFailed', 'Save failed'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box data-admin-edit-ui="1">
            <Button variant="outlined" onClick={openWizard}>
                {admin.t('admin.sectionsWizard.open', 'Edit Home Sections (Wizard)')}
            </Button>

            <Dialog open={open} onClose={closeWizard} fullWidth maxWidth="lg">
                <DialogTitle>{admin.t('admin.sectionsWizard.title', 'Home: Page Sections')}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={18} />
                            <Typography variant="body2">{admin.t('admin.common.loading', 'Loading…')}</Typography>
                        </Box>
                    ) : null}

                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab value="list" label={admin.t('admin.sectionsWizard.tabs.structure', 'Structure')} />
                        <Tab value="preview" label={admin.t('admin.sectionsWizard.tabs.preview', 'Preview')} />
                    </Tabs>

                    {tab === 'list' ? (
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel id="add-kind">{admin.t('admin.sectionsWizard.add.kind', 'Add section')}</InputLabel>
                                    <Select
                                        labelId="add-kind"
                                        label={admin.t('admin.sectionsWizard.add.kind', 'Add section')}
                                        value={addKind}
                                        onChange={(e) => setAddKind(e.target.value as SectionKind)}
                                    >
                                        <MenuItem value="hero">Hero</MenuItem>
                                        <MenuItem value="richText">Rich text</MenuItem>
                                        <MenuItem value="card_group">Cards block</MenuItem>
                                        <MenuItem value="media">Media</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button variant="contained" onClick={addSection}>
                                    {admin.t('admin.sectionsWizard.add.action', 'Add')}
                                </Button>
                                <Box sx={{ flex: 1 }} />
                                <Button variant="outlined" onClick={load} disabled={loading}>
                                    {admin.t('admin.common.refresh', 'Refresh')}
                                </Button>
                            </Box>

                            <Divider />

                            {!visibleSections.length ? (
                                <Typography variant="body2" color="text.secondary">
                                    {admin.t('admin.sectionsWizard.empty', 'No sections yet. Add one.')}
                                </Typography>
                            ) : null}

                            <Box sx={{ display: 'grid', gap: 1.5 }}>
                                {visibleSections.map((s, idx) => {
                                    const title =
                                        s.kind === 'hero'
                                            ? admin.t('admin.sectionsWizard.kind.hero', 'Hero')
                                            : s.kind === 'richText'
                                                ? admin.t('admin.sectionsWizard.kind.richText', 'Rich text')
                                                : s.kind === 'card_group'
                                                    ? admin.t('admin.sectionsWizard.kind.cardGroup', 'Cards block')
                                                    : admin.t('admin.sectionsWizard.kind.media', 'Media');

                                    return (
                                        <Box
                                            key={s.localId}
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                p: 1.5,
                                                display: 'grid',
                                                gap: 1,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {idx + 1}. {title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                    {s.sectionId ? `section.${s.sectionId}` : '(new)'}
                                                </Typography>
                                                <Box sx={{ flex: 1 }} />
                                                <Button size="small" onClick={() => move(s.localId, -1)} disabled={idx === 0}>
                                                    {admin.t('admin.common.up', 'Up')}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => move(s.localId, 1)}
                                                    disabled={idx === visibleSections.length - 1}
                                                >
                                                    {admin.t('admin.common.down', 'Down')}
                                                </Button>
                                                <Button size="small" color="error" onClick={() => markDeleted(s.localId)}>
                                                    {admin.t('admin.common.delete', 'Delete')}
                                                </Button>
                                            </Box>

                                            {s.kind === 'hero' ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    {admin.t(
                                                        'admin.sectionsWizard.hero.note',
                                                        'Hero content (text/actions/media) is edited in the Home Hero Wizard; this wizard controls ordering + presence.'
                                                    )}
                                                </Typography>
                                            ) : null}

                                            {s.kind === 'richText' ? (
                                                <>
                                                    <Tabs
                                                        value={localeTab}
                                                        onChange={(_, v) => setLocaleTab(v)}
                                                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                                                    >
                                                        <Tab value="en" label={admin.t('admin.common.english', 'English')} />
                                                        <Tab value="es" label={admin.t('admin.common.spanish', 'Spanish (draft)')} />
                                                    </Tabs>
                                                    {localeTab === 'en' ? (
                                                        <RichTextEditor
                                                            label={admin.t('admin.sectionsWizard.richText.en', 'Rich text (EN)')}
                                                            value={s.richTextEn}
                                                            onChange={(v) =>
                                                                setSections((prev) =>
                                                                    prev.map((it) => (it.localId === s.localId ? { ...it, richTextEn: v } : it))
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <RichTextEditor
                                                            label={admin.t('admin.sectionsWizard.richText.es', 'Rich text (ES draft)')}
                                                            value={s.richTextEs}
                                                            onChange={(v) =>
                                                                setSections((prev) =>
                                                                    prev.map((it) => (it.localId === s.localId ? { ...it, richTextEs: v } : it))
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </>
                                            ) : null}

                                            {s.kind === 'card_group' ? (
                                                <Box sx={{ display: 'grid', gap: 1.5 }}>
                                                    <FormControl size="small" sx={{ maxWidth: 420 }}>
                                                        <InputLabel id={`card-group-${s.localId}`}>Cards group</InputLabel>
                                                        <Select
                                                            labelId={`card-group-${s.localId}`}
                                                            label="Cards group"
                                                            value={getCardGroupOption(s.cardGroupSourceKey).sourceKey}
                                                            onChange={(e) => {
                                                                const nextKey = String(e.target.value || '');
                                                                const sourceKey = isCardGroupSourceKey(nextKey) ? nextKey : CARD_GROUP_OPTIONS[0].sourceKey;
                                                                setSections((prev) =>
                                                                    prev.map((it) => {
                                                                        if (it.localId !== s.localId) return it;
                                                                        const nextMeta: SectionMeta = {
                                                                            version: 1,
                                                                            kind: 'card_group',
                                                                            owner: it.metaJson?.owner ?? { type: 'page', key: PAGE_KEY },
                                                                            sort: it.sort,
                                                                            sourceKey,
                                                                            ...(it.cardGroupVariant ? { variant: it.cardGroupVariant } : {}),
                                                                        };
                                                                        return { ...it, cardGroupSourceKey: sourceKey, metaJson: nextMeta };
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                            {CARD_GROUP_OPTIONS.map((o) => (
                                                                <MenuItem key={o.sourceKey} value={o.sourceKey}>
                                                                    {o.label} ({o.sourceKey})
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>

                                                    <FormControl size="small" sx={{ maxWidth: 420 }}>
                                                        <InputLabel id={`card-variant-${s.localId}`}>Variant (optional)</InputLabel>
                                                        <Select
                                                            labelId={`card-variant-${s.localId}`}
                                                            label="Variant (optional)"
                                                            value={s.cardGroupVariant || ''}
                                                            onChange={(e) => {
                                                                const raw = String(e.target.value || '');
                                                                const v = raw === 'default' ? 'default' : '';
                                                                setSections((prev) =>
                                                                    prev.map((it) => {
                                                                        if (it.localId !== s.localId) return it;
                                                                        const nextMeta: SectionMeta = {
                                                                            version: 1,
                                                                            kind: 'card_group',
                                                                            owner: it.metaJson?.owner ?? { type: 'page', key: PAGE_KEY },
                                                                            sort: it.sort,
                                                                            sourceKey: getCardGroupOption(it.cardGroupSourceKey).sourceKey,
                                                                            ...(v ? { variant: v } : {}),
                                                                        };
                                                                        return { ...it, cardGroupVariant: v, metaJson: nextMeta };
                                                                    })
                                                                );
                                                            }}
                                                        >
                                                            <MenuItem value="">(none)</MenuItem>
                                                            {CARD_GROUP_VARIANT_OPTIONS.map((o) => (
                                                                <MenuItem key={o.value} value={o.value}>
                                                                    {o.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>

                                                    <Typography variant="body2" color="text.secondary">
                                                        {admin.t(
                                                            'admin.sectionsWizard.cardGroup.note',
                                                            'This section bridges to existing legacy card keys (home.cards.*). Card content is not edited here in Phase 4.'
                                                        )}
                                                    </Typography>
                                                </Box>
                                            ) : null}

                                            {s.kind === 'media' ? (
                                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <Button variant="outlined" onClick={() => setPickerOpenFor(s.localId)}>
                                                        {admin.t('admin.sectionsWizard.media.choose', 'Choose Media')}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="inherit"
                                                        onClick={() =>
                                                            setSections((prev) =>
                                                                prev.map((it) =>
                                                                    it.localId === s.localId ? { ...it, mediaSelection: null, mediaUrl: '' } : it
                                                                )
                                                            )
                                                        }
                                                        disabled={!s.mediaSelection}
                                                    >
                                                        {admin.t('admin.sectionsWizard.media.clear', 'Clear')}
                                                    </Button>
                                                    {s.mediaSelection ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {admin.t('admin.sectionsWizard.media.selected', 'Selected')}: {s.mediaSelection.bucket}/
                                                            {s.mediaSelection.path}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            ) : null}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    ) : (
                        <ContentBundleProvider prefix="home.">
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {admin.t(
                                        'admin.sectionsWizard.preview.note',
                                        'Admin-only preview of the staged section order. This does not change public rendering yet.'
                                    )}
                                </Typography>

                                <Box sx={{ display: 'grid', gap: 2 }}>
                                    {visibleSections.map((s) => {
                                        if (s.kind === 'hero') {
                                            const title = localeTab === 'es' && s.richTextEs.trim() ? s.richTextEs : s.richTextEn;
                                            return (
                                                <Box
                                                    key={s.localId}
                                                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}
                                                    onClickCapture={(e) => {
                                                        const target = e.target as HTMLElement | null;
                                                        if (!target) return;
                                                        const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
                                                        if (anchor) {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }
                                                    }}
                                                >
                                                    <Hero
                                                        title={title || 'Hero'}
                                                        subtitle={admin.t('admin.sectionsWizard.preview.heroSubtitle', '(edited in Home Hero Wizard)')}
                                                        backgroundUrl={s.mediaUrl || undefined}
                                                        primaryAction={admin.t('admin.sectionsWizard.preview.heroPrimary', 'Primary')}
                                                        secondaryAction={admin.t('admin.sectionsWizard.preview.heroSecondary', 'Secondary')}
                                                        primaryHref={'/book'}
                                                        secondaryHref={'/mission_statement'}
                                                    />
                                                </Box>
                                            );
                                        }

                                        if (s.kind === 'richText') {
                                            const json = localeTab === 'es' && s.richTextEs.trim() ? s.richTextEs : s.richTextEn;
                                            return (
                                                <Box key={s.localId} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                                                    {json ? <RichTextRenderer json={json} /> : null}
                                                    {!json ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {admin.t('admin.sectionsWizard.preview.emptyRichText', 'Empty rich text')}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            );
                                        }

                                        if (s.kind === 'card_group') {
                                            return (
                                                <Box key={s.localId} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                                                    <AdminSectionPreview meta={s.metaJson} />
                                                </Box>
                                            );
                                        }

                                        // media
                                        return (
                                            <Box key={s.localId} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                                                {s.mediaUrl ? (
                                                    <Box component="img" src={s.mediaUrl} alt="" sx={{ width: '100%', borderRadius: 1 }} />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {admin.t('admin.sectionsWizard.preview.emptyMedia', 'No media selected')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </ContentBundleProvider>
                    )}

                    <MediaPickerDialog
                        open={!!pickerOpenFor}
                        onClose={() => setPickerOpenFor(null)}
                        defaultCategory="web_content"
                        onSelect={(s) => {
                            const id = pickerOpenFor;
                            setPickerOpenFor(null);
                            if (!id) return;
                            void onPickMedia(id, s);
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeWizard} disabled={saving}>
                        {admin.t('admin.common.cancel', 'Cancel')}
                    </Button>
                    <Button variant="contained" onClick={saveAll} disabled={saving || loading}>
                        {saving ? admin.t('admin.common.saving', 'Saving…') : admin.t('admin.common.save', 'Save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
