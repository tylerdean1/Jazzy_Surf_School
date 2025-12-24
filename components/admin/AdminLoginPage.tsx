"use client";

import React, { useState } from "react";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import supabaseClient from "@/lib/supabaseClient";
import useContentBundle from "@/hooks/useContentBundle";

export default function AdminLoginPage() {
    const admin = useContentBundle('admin.');
    const pathname = usePathname();
    const locale = (() => {
        const p = String(pathname || '/');
        const seg = p.split('/').filter(Boolean)[0];
        return seg === 'en' || seg === 'es' ? seg : 'en';
    })();

    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error || !data?.session) {
                setError(error?.message || admin.t('admin.login.errors.signInFailed', 'Sign-in failed'));
                return;
            }

            const accessToken = data.session.access_token;
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access_token: accessToken }),
            });

            if (res.ok) {
                window.location.href = `/${locale}/admin`;
                return;
            }

            const body = await res.json().catch(() => ({}));
            if (res.status === 403) {
                // They authenticated with Supabase, but are not an admin in our DB.
                await supabaseClient.auth.signOut();
            }
            setError(body?.message || admin.t('admin.login.errors.invalidCredentials', 'Invalid credentials'));
        } catch {
            setError(admin.t('admin.login.errors.network', 'Network error'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography variant="h4">{admin.t('admin.login.title', 'Admin Login')}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {admin.t(
                        'admin.login.subtitle',
                        'This page is not linked from the site — enter the direct URL to access it.'
                    )}
                </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    label={admin.t('admin.login.emailLabel', 'Email')}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label={admin.t('admin.login.passwordLabel', 'Password')}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                />

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? admin.t('admin.login.signingIn', 'Signing in…') : admin.t('admin.login.signIn', 'Sign in')}
                </Button>
            </Box>
        </Container>
    );
}
