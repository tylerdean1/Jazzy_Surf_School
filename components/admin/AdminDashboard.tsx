'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import supabaseClient from '../../lib/supabaseClient';
import { RichTextEditor, RichTextRenderer } from './RichText';
import MediaManager from './MediaManager';
import type { Database } from '../../lib/database.types';

type CmsRow = Pick<
    Database['public']['Tables']['cms_page_content']['Row'],
    'id' | 'page_key' | 'body_en' | 'body_es_draft' | 'body_es_published' | 'approved' | 'updated_at'
>;

const PAGE_KEYS = [
    'mission_statement',
    'about_jaz',
    'lessons',
    'team',
    'faq',
    'contact',
    'gallery',
] as const;

type PageKey = (typeof PAGE_KEYS)[number];

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
    if (value !== index) return null;
    return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function AdminDashboard() {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const [selectedKey, setSelectedKey] = useState<PageKey>('mission_statement');
    const [row, setRow] = useState<CmsRow | null>(null);
    const [bodyEn, setBodyEn] = useState<string>('');
    const [bodyEsDraft, setBodyEsDraft] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const canShowCms = useMemo(() => tab === 0, [tab]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setAuthError(null);

            const { data } = await supabaseClient.auth.getSession();
            if (!data.session) {
                setLoading(false);
                setAuthError('No Supabase session found. Please sign in again at /adminlogin.');
                return;
            }

            if (cancelled) return;
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadPage = async (pageKey: PageKey) => {
        setMessage(null);
        const { data, error } = await supabaseClient
            .from('cms_page_content')
            .select('id,page_key,body_en,body_es_draft,body_es_published,approved,updated_at')
            .eq('page_key', pageKey)
            .maybeSingle();

        if (error) {
            setRow(null);
            setBodyEn('');
            setBodyEsDraft('');
            setMessage({ type: 'error', text: error.message });
            return;
        }

        const next = (data as CmsRow | null) ?? null;
        setRow(next);
        setBodyEn(next?.body_en ?? '');
        setBodyEsDraft(next?.body_es_draft ?? '');
    };

    useEffect(() => {
        if (!canShowCms) return;
        loadPage(selectedKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedKey, canShowCms]);

    const saveCms = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabaseClient.rpc('admin_upsert_page_content', {
                p_page_key: selectedKey,
                p_body_en: bodyEn || undefined,
                p_body_es_draft: bodyEsDraft || undefined,
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
                return;
            }

            await loadPage(selectedKey);
            setMessage({ type: 'success', text: 'Saved.' });
        } finally {
            setSaving(false);
        }
    };

    const publishSpanish = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabaseClient.rpc('admin_publish_es', { p_page_key: selectedKey });
            if (error) {
                setMessage({ type: 'error', text: error.message });
                return;
            }

            await loadPage(selectedKey);
            setMessage({ type: 'success', text: 'Spanish published.' });
        } finally {
            setSaving(false);
        }
    };

    const deletePage = async () => {
        if (!confirm(`Delete CMS content for ${selectedKey}?`)) return;

        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabaseClient.rpc('admin_delete_page_content', { p_page_key: selectedKey });
            if (error) {
                setMessage({ type: 'error', text: error.message });
                return;
            }

            setRow(null);
            setBodyEn('');
            setBodyEsDraft('');
            setMessage({ type: 'success', text: 'Deleted.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
                Admin Dashboard
            </Typography>
            <Typography color="text.secondary">CMS bodies, sessions, and media.</Typography>

            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                    <CircularProgress size={22} />
                    <Typography>Loading…</Typography>
                </Box>
            ) : authError ? (
                <Alert severity="warning" sx={{ mt: 3 }}>
                    {authError}
                </Alert>
            ) : (
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
                        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                            <Tab label="Pages" />
                            <Tab label="Sessions" />
                            <Tab label="Media" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tab} index={0}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 260 }}>
                                <InputLabel id="page-key-label">Page</InputLabel>
                                <Select
                                    labelId="page-key-label"
                                    label="Page"
                                    value={selectedKey}
                                    onChange={(e) => setSelectedKey(e.target.value as PageKey)}
                                >
                                    {PAGE_KEYS.map((k) => (
                                        <MenuItem key={k} value={k}>
                                            {k}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Approved ES:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {row?.approved ? 'Yes' : 'No'}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1 }} />

                            <Button variant="outlined" color="error" onClick={deletePage} disabled={saving}>
                                Delete
                            </Button>
                            <Button variant="contained" onClick={saveCms} disabled={saving} sx={{ backgroundColor: '#20B2AA' }}>
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </Box>

                        {message ? (
                            <Alert severity={message.type} sx={{ mt: 2 }}>
                                {message.text}
                            </Alert>
                        ) : null}

                        <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                            <Box>
                                <RichTextEditor label="English body (source)" value={bodyEn} onChange={setBodyEn} />
                            </Box>
                            <Box>
                                <RichTextEditor label="Spanish body (draft)" value={bodyEsDraft} onChange={setBodyEsDraft} />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button variant="outlined" onClick={publishSpanish} disabled={saving}>
                                        Publish Spanish
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Public preview
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            English always shows; Spanish shows only after Publish.
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    EN
                                </Typography>
                                <RichTextRenderer json={row?.body_en ?? bodyEn} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    ES (published)
                                </Typography>
                                <RichTextRenderer json={row?.body_es_published ?? ''} />
                            </Box>
                        </Box>
                    </TabPanel>

                    <TabPanel value={tab} index={1}>
                        <Alert severity="info">Sessions tab next (wiring to admin_*_session RPCs).</Alert>
                    </TabPanel>

                    <TabPanel value={tab} index={2}>
                        <MediaManager />
                    </TabPanel>
                </>
            )}
        </Container>
    );
}
