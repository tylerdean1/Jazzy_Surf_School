'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Tab, Tabs, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import MediaManager from './MediaManager';
import AdminLiveEditor from './AdminLiveEditor';
import SessionsManager from './SessionsManager';

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
    if (value !== index) return null;
    return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function AdminDashboard() {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const pathname = usePathname();

    const locale = (() => {
        const p = String(pathname || '/');
        const seg = p.split('/').filter(Boolean)[0];
        return seg === 'en' || seg === 'es' ? seg : 'en';
    })();

    useEffect(() => {
        // Auth is enforced by the server via the httpOnly `admin` cookie.
        // Keeping this client component usable even if a Supabase session expires.
        setLoading(false);
        setAuthError(null);
    }, []);


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
                            <Tab label="Edit" />
                            <Tab label="Sessions" />
                            <Tab label="Media" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tab} index={0}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            You are viewing the real site UI. Click the edit icons to change content inline.
                        </Typography>
                        <AdminLiveEditor />
                    </TabPanel>

                    <TabPanel value={tab} index={1}>
                        <SessionsManager />
                    </TabPanel>

                    <TabPanel value={tab} index={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button href={`/${locale}/admin/media-upload`} variant="outlined">
                                Go to Upload Page
                            </Button>
                        </Box>
                        <MediaManager />
                    </TabPanel>
                </>
            )}
        </Container>
    );
}
