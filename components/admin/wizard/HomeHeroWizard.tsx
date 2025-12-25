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
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import Hero from '@/components/Hero';
import MediaPickerDialog, { type MediaSelection } from '@/components/admin/MediaPickerDialog';
import useContentBundle from '@/hooks/useContentBundle';

type CmsRow = {
    body_en: string | null;
    body_es_draft: string | null;
};

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

function clampSmallint(n: number, fallback: number) {
    if (!Number.isFinite(n)) return fallback;
    return Math.max(-32768, Math.min(32767, Math.floor(n)));
}

const POINTER_KEY = 'draft.page.home.hero.sectionId';
// Stable category naming (no draft prefix): sections.page.<pageKey>
const CATEGORY_KEY = 'sections.page.home';

export default function HomeHeroWizard() {
    const admin = useContentBundle('admin.');

    const [open, setOpen] = React.useState(false);
    const [tab, setTab] = React.useState<'en' | 'es'>('en');

    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [sectionId, setSectionId] = React.useState<string | null>(null);

    const [titleEn, setTitleEn] = React.useState('');
    const [subtitleEn, setSubtitleEn] = React.useState('');
    const [primaryLabelEn, setPrimaryLabelEn] = React.useState('');
    const [secondaryLabelEn, setSecondaryLabelEn] = React.useState('');

    const [titleEs, setTitleEs] = React.useState('');
    const [subtitleEs, setSubtitleEs] = React.useState('');
    const [primaryLabelEs, setPrimaryLabelEs] = React.useState('');
    const [secondaryLabelEs, setSecondaryLabelEs] = React.useState('');

    const [primaryHref, setPrimaryHref] = React.useState('/book');
    const [secondaryHref, setSecondaryHref] = React.useState('/mission_statement');

    const [sort, setSort] = React.useState('0');

    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [selection, setSelection] = React.useState<MediaSelection | null>(null);
    const [backgroundUrl, setBackgroundUrl] = React.useState<string>('');

    const keys = React.useMemo(() => {
        if (!sectionId) return null;
        return {
            meta: `section.${sectionId}.meta`,
            title: `section.${sectionId}.title`,
            subtitle: `section.${sectionId}.subtitle`,
            primaryLabel: `section.${sectionId}.primaryAction.label`,
            secondaryLabel: `section.${sectionId}.secondaryAction.label`,
            // Stable (non-draft) media slot key convention.
            mediaSlotKey: `section.${sectionId}.heroBackground`,
        };
    }, [sectionId]);

    const resetDraft = () => {
        setError(null);
        setSectionId(null);

        setTitleEn('');
        setSubtitleEn('');
        setPrimaryLabelEn('');
        setSecondaryLabelEn('');

        setTitleEs('');
        setSubtitleEs('');
        setPrimaryLabelEs('');
        setSecondaryLabelEs('');

        setPrimaryHref('/book');
        setSecondaryHref('/mission_statement');

        setSort('0');

        setSelection(null);
        setBackgroundUrl('');
    };

    const loadExistingDraft = async () => {
        setLoading(true);
        setError(null);
        try {
            const pointer = await adminGetCmsRow(POINTER_KEY);
            const maybeId = String(pointer?.body_en || '').trim();
            if (!maybeId) {
                // No saved draft yet; keep blank staged state.
                return;
            }

            setSectionId(maybeId);

            const k = {
                meta: `section.${maybeId}.meta`,
                title: `section.${maybeId}.title`,
                subtitle: `section.${maybeId}.subtitle`,
                primaryLabel: `section.${maybeId}.primaryAction.label`,
                secondaryLabel: `section.${maybeId}.secondaryAction.label`,
                mediaSlotKey: `section.${maybeId}.heroBackground`,
                legacyMediaSlotKey: `draft.section.${maybeId}.heroBackground`,
            };

            const [rTitle, rSubtitle, rPrimary, rSecondary, rMeta] = await Promise.all([
                adminGetCmsRow(k.title),
                adminGetCmsRow(k.subtitle),
                adminGetCmsRow(k.primaryLabel),
                adminGetCmsRow(k.secondaryLabel),
                adminGetCmsRow(k.meta),
            ]);

            setTitleEn(rTitle?.body_en ?? '');
            setTitleEs(rTitle?.body_es_draft ?? '');

            setSubtitleEn(rSubtitle?.body_en ?? '');
            setSubtitleEs(rSubtitle?.body_es_draft ?? '');

            setPrimaryLabelEn(rPrimary?.body_en ?? '');
            setPrimaryLabelEs(rPrimary?.body_es_draft ?? '');

            setSecondaryLabelEn(rSecondary?.body_en ?? '');
            setSecondaryLabelEs(rSecondary?.body_es_draft ?? '');

            // best-effort: hydrate href/sort from meta JSON
            const metaJson = (() => {
                const raw = rMeta?.body_en;
                if (!raw) return null;
                try {
                    return JSON.parse(raw);
                } catch {
                    return null;
                }
            })();

            const actions = metaJson?.actions;
            if (actions?.primary?.href) setPrimaryHref(String(actions.primary.href));
            if (actions?.secondary?.href) setSecondaryHref(String(actions.secondary.href));

            if (Number.isFinite(metaJson?.sort)) setSort(String(metaJson.sort));

            // best-effort background preview: if slot exists, resolve via admin slots GET
            try {
                // Prefer stable key; fall back to legacy draft-prefixed key for backwards compatibility.
                const prefixToFetch = k.mediaSlotKey;
                const res = await fetch(`/api/admin/media/slots?prefix=${encodeURIComponent(prefixToFetch)}`);
                const body = await res.json().catch(() => ({}));
                const items = (body?.items ?? []) as any[];
                const it = items.find((x) => x?.slot_key === k.mediaSlotKey) || null;
                const asset = it?.asset;
                if (asset?.bucket && asset?.path) {
                    const url = await fetchSignedUrl(String(asset.bucket), String(asset.path));
                    setBackgroundUrl(url);
                    setSelection({
                        id: String(asset.id),
                        assetKey: null,
                        bucket: String(asset.bucket),
                        path: String(asset.path),
                        previewUrl: url,
                    });
                } else {
                    const res2 = await fetch(`/api/admin/media/slots?prefix=${encodeURIComponent(k.legacyMediaSlotKey)}`);
                    const body2 = await res2.json().catch(() => ({}));
                    const items2 = (body2?.items ?? []) as any[];
                    const it2 = items2.find((x) => x?.slot_key === k.legacyMediaSlotKey) || null;
                    const asset2 = it2?.asset;
                    if (asset2?.bucket && asset2?.path) {
                        const url2 = await fetchSignedUrl(String(asset2.bucket), String(asset2.path));
                        setBackgroundUrl(url2);
                        setSelection({
                            id: String(asset2.id),
                            assetKey: null,
                            bucket: String(asset2.bucket),
                            path: String(asset2.path),
                            previewUrl: url2,
                        });
                    }
                }
            } catch {
                // ignore
            }
        } catch (e: any) {
            setError(e?.message || admin.t('admin.homeHeroWizard.errors.loadFailed', 'Failed to load draft'));
        } finally {
            setLoading(false);
        }
    };

    const openWizard = async () => {
        resetDraft();
        setOpen(true);
        await loadExistingDraft();
    };

    const closeWizard = () => {
        setOpen(false);
        resetDraft();
    };

    const onPickMedia = async (s: MediaSelection) => {
        setError(null);
        setSelection(s);
        try {
            const url = s.previewUrl || (s.bucket && s.path ? await fetchSignedUrl(s.bucket, s.path) : '');
            setBackgroundUrl(url);
        } catch (e: any) {
            setBackgroundUrl('');
            setError(e?.message || admin.t('admin.homeHeroWizard.errors.previewFailed', 'Failed to load preview'));
        }
    };

    const clearMedia = () => {
        setSelection(null);
        setBackgroundUrl('');
    };

    const saveAll = async () => {
        setSaving(true);
        setError(null);
        try {
            let id = sectionId;
            if (!id) {
                const created = await adminSaveCmsRow({
                    op: 'create_section',
                    category: CATEGORY_KEY,
                    kind: 'hero',
                    owner: { type: 'page', key: 'home' },
                    pointer_page_key: POINTER_KEY,
                });
                id = String(created?.sectionId || '').trim();
                if (!id) throw new Error('Failed to create section id');
                setSectionId(id);
            }

            const k = {
                meta: `section.${id}.meta`,
                title: `section.${id}.title`,
                subtitle: `section.${id}.subtitle`,
                primaryLabel: `section.${id}.primaryAction.label`,
                secondaryLabel: `section.${id}.secondaryAction.label`,
                mediaSlotKey: `section.${id}.heroBackground`,
            };

            // Persist field rows
            await adminSaveCmsRow({ op: 'save', page_key: k.title, body_en: titleEn ?? '', body_es_draft: titleEs ?? '' });
            await adminSaveCmsRow({ op: 'save', page_key: k.subtitle, body_en: subtitleEn ?? '', body_es_draft: subtitleEs ?? '' });
            await adminSaveCmsRow({
                op: 'save',
                page_key: k.primaryLabel,
                body_en: primaryLabelEn ?? '',
                body_es_draft: primaryLabelEs ?? '',
            });
            await adminSaveCmsRow({
                op: 'save',
                page_key: k.secondaryLabel,
                body_en: secondaryLabelEn ?? '',
                body_es_draft: secondaryLabelEs ?? '',
            });

            // Persist meta row (config only)
            const metaJson = {
                version: 1,
                kind: 'hero',
                owner: { type: 'page', key: 'home' },
                sort: clampSmallint(Number(sort), 0),
                fields: {
                    titleKey: k.title,
                    subtitleKey: k.subtitle,
                },
                actions: {
                    primary: { type: 'link', href: String(primaryHref || '').trim() || '/book', openInNewTab: false, labelKey: k.primaryLabel },
                    secondary: { type: 'link', href: String(secondaryHref || '').trim() || '/mission_statement', openInNewTab: false, labelKey: k.secondaryLabel },
                },
                media: {
                    heroBackground: { type: 'single', slotKey: k.mediaSlotKey },
                },
            };

            await adminSaveCmsRow({
                op: 'save',
                page_key: k.meta,
                category: CATEGORY_KEY,
                sort: clampSmallint(Number(sort), 0),
                body_en: JSON.stringify(metaJson),
            });

            // Persist media slot
            await adminSetMediaSlot(k.mediaSlotKey, selection?.id ?? null, 0);

            // Reload so the wizard shows the persisted draft.
            await loadExistingDraft();
        } catch (e: any) {
            setError(e?.message || admin.t('admin.homeHeroWizard.errors.saveFailed', 'Save failed'));
        } finally {
            setSaving(false);
        }
    };

    const previewTitle = tab === 'es' && titleEs.trim() ? titleEs : titleEn;
    const previewSubtitle = tab === 'es' && subtitleEs.trim() ? subtitleEs : subtitleEn;
    const previewPrimary = tab === 'es' && primaryLabelEs.trim() ? primaryLabelEs : primaryLabelEn;
    const previewSecondary = tab === 'es' && secondaryLabelEs.trim() ? secondaryLabelEs : secondaryLabelEn;

    return (
        <Box data-admin-edit-ui="1">
            <Button variant="outlined" onClick={openWizard}>
                {admin.t('admin.homeHeroWizard.open', 'Edit Home Hero (Wizard)')}
            </Button>

            <Dialog open={open} onClose={closeWizard} fullWidth maxWidth="lg">
                <DialogTitle>{admin.t('admin.homeHeroWizard.title', 'Home Hero Wizard')}</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={18} />
                            <Typography variant="body2">{admin.t('admin.common.loading', 'Loading…')}</Typography>
                        </Box>
                    ) : null}

                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab value="en" label={admin.t('admin.common.english', 'English')} />
                        <Tab value="es" label={admin.t('admin.common.spanish', 'Spanish (draft)')} />
                    </Tabs>

                    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                        <TextField
                            label={admin.t('admin.homeHeroWizard.fields.primaryHref', 'Primary Link (href)')}
                            size="small"
                            value={primaryHref}
                            onChange={(e) => setPrimaryHref(e.target.value)}
                        />
                        <TextField
                            label={admin.t('admin.homeHeroWizard.fields.secondaryHref', 'Secondary Link (href)')}
                            size="small"
                            value={secondaryHref}
                            onChange={(e) => setSecondaryHref(e.target.value)}
                        />
                        <TextField
                            label={admin.t('admin.homeHeroWizard.fields.sort', 'Section Sort')}
                            size="small"
                            value={sort}
                            onChange={(e) => setSort(e.target.value.replace(/[^0-9-]/g, ''))}
                        />
                        <Box />
                    </Box>

                    {tab === 'en' ? (
                        <Box sx={{ display: 'grid', gap: 1.5 }}>
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.title', 'Title')}
                                size="small"
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.subtitle', 'Subtitle')}
                                size="small"
                                value={subtitleEn}
                                onChange={(e) => setSubtitleEn(e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.primaryLabel', 'Primary Button Label')}
                                size="small"
                                value={primaryLabelEn}
                                onChange={(e) => setPrimaryLabelEn(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.secondaryLabel', 'Secondary Button Label')}
                                size="small"
                                value={secondaryLabelEn}
                                onChange={(e) => setSecondaryLabelEn(e.target.value)}
                                fullWidth
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gap: 1.5 }}>
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.title', 'Title')}
                                size="small"
                                value={titleEs}
                                onChange={(e) => setTitleEs(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.subtitle', 'Subtitle')}
                                size="small"
                                value={subtitleEs}
                                onChange={(e) => setSubtitleEs(e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.primaryLabel', 'Primary Button Label')}
                                size="small"
                                value={primaryLabelEs}
                                onChange={(e) => setPrimaryLabelEs(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={admin.t('admin.homeHeroWizard.fields.secondaryLabel', 'Secondary Button Label')}
                                size="small"
                                value={secondaryLabelEs}
                                onChange={(e) => setSecondaryLabelEs(e.target.value)}
                                fullWidth
                            />
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button variant="outlined" onClick={() => setPickerOpen(true)}>
                            {admin.t('admin.homeHeroWizard.media.choose', 'Choose Background Media')}
                        </Button>
                        <Button variant="outlined" color="inherit" onClick={clearMedia} disabled={!selection}>
                            {admin.t('admin.homeHeroWizard.media.clear', 'Clear')}
                        </Button>
                        {selection ? (
                            <Typography variant="body2" color="text.secondary">
                                {admin.t('admin.homeHeroWizard.media.selected', 'Selected')}: {selection.bucket}/{selection.path}
                            </Typography>
                        ) : null}
                    </Box>

                    <Box
                        onClickCapture={(e) => {
                            const target = e.target as HTMLElement | null;
                            if (!target) return;
                            const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
                            if (anchor) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }}
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}
                    >
                        <Hero
                            title={previewTitle || 'Hero Title'}
                            subtitle={previewSubtitle || 'Hero subtitle'}
                            backgroundUrl={backgroundUrl || undefined}
                            primaryAction={previewPrimary || 'Primary'}
                            secondaryAction={previewSecondary || 'Secondary'}
                            primaryHref={String(primaryHref || '').trim() || '/book'}
                            secondaryHref={String(secondaryHref || '').trim() || '/mission_statement'}
                        />
                    </Box>

                    <MediaPickerDialog
                        open={pickerOpen}
                        onClose={() => setPickerOpen(false)}
                        defaultCategory="hero"
                        onSelect={(s) => {
                            setPickerOpen(false);
                            void onPickMedia(s);
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
