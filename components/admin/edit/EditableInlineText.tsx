'use client';

import React, { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import Upload from '@mui/icons-material/Upload';
import { useAdminEdit } from './AdminEditContext';
import { publishCmsSpanish, saveCmsStringValue, useCmsStringValue } from '@/hooks/useCmsStringValue';

export default function EditableInlineText({
    cmsKey,
    fallback,
    children,
    multiline = false,
    fullWidth = false,
}: {
    cmsKey: string;
    fallback: string;
    children: (value: string) => React.ReactNode;
    multiline?: boolean;
    fullWidth?: boolean;
}) {
    const { enabled } = useAdminEdit();
    const locale = useLocale();
    const { value } = useCmsStringValue(cmsKey, fallback);

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canPublish = useMemo(() => enabled && locale === 'es', [enabled, locale]);

    const startEdit = () => {
        setError(null);
        setDraft(value);
        setEditing(true);
    };

    const cancelEdit = () => {
        setError(null);
        setEditing(false);
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            await saveCmsStringValue(cmsKey, locale, draft);
            setEditing(false);
        } catch (e: any) {
            setError(e?.message || 'Save failed');
        } finally {
            setSaving(false);
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
        return <>{children(value)}</>;
    }

    return (
        <Box sx={{ position: 'relative', display: 'inline-block', width: fullWidth ? '100%' : 'auto' }}>
            {editing ? (
                <Box sx={{ display: 'grid', gap: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}
                    <TextField
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        size="small"
                        multiline={multiline}
                        minRows={multiline ? 3 : undefined}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {canPublish ? (
                            <Button
                                variant="outlined"
                                onClick={publish}
                                disabled={saving}
                                startIcon={<Upload />}
                            >
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
                </Box>
            ) : (
                <>
                    {children(value)}
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={startEdit}
                            sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'background.paper' }}
                        >
                            <EditOutlined fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </Box>
    );
}
