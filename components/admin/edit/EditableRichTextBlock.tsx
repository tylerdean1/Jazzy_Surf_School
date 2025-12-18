'use client';

import React, { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import Upload from '@mui/icons-material/Upload';
import Translate from '@mui/icons-material/Translate';
import { useAdminEdit } from './AdminEditContext';
import { publishCmsSpanish } from '@/hooks/useCmsStringValue';
import { RichTextEditor, RichTextRenderer } from '@/components/admin/RichText';
import { docToPlainText, plainTextToDocJson } from '@/lib/cmsRichText';

async function saveRich(pageKey: string, locale: string, json: string) {
    const payload: any = { op: 'save', page_key: pageKey };
    if (locale === 'es') payload.body_es_draft = json;
    else payload.body_en = json;

    const res = await fetch('/api/admin/cms/page-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) throw new Error(body?.message || `Save failed (${res.status})`);
}

export default function EditableRichTextBlock({
    cmsKey,
    value,
    emptyPlaceholder,
}: {
    cmsKey: string;
    value: string;
    emptyPlaceholder?: string;
}) {
    const { enabled } = useAdminEdit();
    const locale = useLocale();

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [showSpanishDraft, setShowSpanishDraft] = useState(false);
    const [spanishDraft, setSpanishDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [translating, setTranslating] = useState(false);
    const [translateError, setTranslateError] = useState<string | null>(null);

    const canPublish = useMemo(() => enabled && locale === 'es', [enabled, locale]);

    const startEdit = () => {
        setError(null);
        setTranslateError(null);
        setDraft(value || '');
        setShowSpanishDraft(false);
        setSpanishDraft('');
        setEditing(true);
    };

    const cancelEdit = () => {
        setError(null);
        setTranslateError(null);
        setEditing(false);
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            await saveRich(cmsKey, locale, draft);

            // If user generated/edited a Spanish draft while in EN, persist it too.
            if (locale !== 'es' && showSpanishDraft && spanishDraft.trim()) {
                await saveRich(cmsKey, 'es', spanishDraft);
            }

            setEditing(false);
        } catch (e: any) {
            setError(e?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const translateToSpanish = async () => {
        setTranslating(true);
        setTranslateError(null);
        try {
            const sourceText = docToPlainText(draft);
            if (!sourceText.trim()) {
                setTranslateError('Nothing to translate yet.');
                return;
            }

            const res = await fetch('/api/admin/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: sourceText, from: 'en', to: 'es' }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok || !body?.ok) {
                throw new Error(body?.message || `Translate failed (${res.status})`);
            }

            const translated = String(body?.text || '').trim();
            setSpanishDraft(plainTextToDocJson(translated));
            setShowSpanishDraft(true);
        } catch (e: any) {
            setTranslateError(e?.message || 'Translate failed');
        } finally {
            setTranslating(false);
        }
    };

    const publish = async () => {
        setSaving(true);
        setError(null);
        try {
            await publishCmsSpanish(cmsKey);
        } catch (e: any) {
            setError(e?.message || 'Publish failed');
        } finally {
            setSaving(false);
        }
    };

    if (!enabled) {
        if (!value) return null;
        return <RichTextRenderer json={value} />;
    }

    if (editing) {
        return (
            <Paper
                data-admin-edit-ui="1"
                elevation={3}
                sx={{
                    display: 'grid',
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                {error ? <Alert severity="error">{error}</Alert> : null}
                <RichTextEditor label={emptyPlaceholder || 'Content'} value={draft} onChange={setDraft} />

                {locale !== 'es' ? (
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        {translateError ? <Alert severity="warning">{translateError}</Alert> : null}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Button
                                variant="outlined"
                                onClick={translateToSpanish}
                                disabled={saving || translating}
                                startIcon={<Translate />}
                            >
                                {translating ? 'Translating…' : 'Translate to Spanish'}
                            </Button>
                        </Box>

                        {showSpanishDraft ? (
                            <RichTextEditor
                                label="Spanish (draft)"
                                value={spanishDraft}
                                onChange={setSpanishDraft}
                            />
                        ) : null}
                    </Box>
                ) : null}

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {canPublish ? (
                        <Button variant="outlined" onClick={publish} disabled={saving} startIcon={<Upload />}>
                            Publish
                        </Button>
                    ) : null}
                    <Button variant="outlined" onClick={cancelEdit} disabled={saving} startIcon={<Close />}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={save} disabled={saving} startIcon={<Check />}>
                        Save
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <Box sx={{ position: 'relative' }}>
            {value ? <RichTextRenderer json={value} /> : null}
            <Tooltip title="Edit">
                <IconButton
                    size="small"
                    onClick={startEdit}
                    sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'background.paper' }}
                >
                    <EditOutlined fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );
}
