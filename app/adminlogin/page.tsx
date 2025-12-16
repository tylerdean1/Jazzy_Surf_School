"use client";

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import supabaseClient from '../../lib/supabaseClient';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // Sign in via Supabase client
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error || !data?.session) {
                setError(error?.message || 'Sign-in failed');
                setLoading(false);
                return;
            }

            const accessToken = data.session.access_token;
            // Send access token to server to validate and set admin cookie
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken })
            });

            if (res.ok) {
                window.location.href = '/admin';
                return;
            }

            const body = await res.json().catch(() => ({}));
            setError(body?.message || 'Invalid credentials');
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4">Admin Login</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    This page is not linked from the site — enter the direct URL to access it.
                </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                />

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </Button>
            </Box>
        </Container>
    );
}
