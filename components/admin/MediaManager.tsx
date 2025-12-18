'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';

type AssetType = 'photo' | 'video';
type PhotoCategory = 'logo' | 'hero' | 'lessons' | 'web_content' | 'uncategorized';

type MediaAsset = {
    id: string;
    asset_key: string | null;
    title: string;
    description: string | null;
    public: boolean;
    bucket: string;
    path: string;
    category: PhotoCategory;
    asset_type: AssetType;
    sort: number;
    session_id: string | null;
    created_at: string | null;
    updated_at: string | null;
};

const CATEGORIES: PhotoCategory[] = ['logo', 'hero', 'lessons', 'web_content', 'uncategorized'];
const ASSET_TYPES: AssetType[] = ['photo', 'video'];

async function getSignedUrl(bucket: string, path: string): Promise<string> {
    const res = await fetch(
        `/api/admin/media/signed-url?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}&expiresIn=900`
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) throw new Error(body?.message || `Failed to get URL (${res.status})`);
    return String(body?.url || '');
}

export default function MediaManager() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<MediaAsset[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<MediaAsset | null>(null);

    const [title, setTitle] = useState('');
    const [assetKey, setAssetKey] = useState('');
    const [description, setDescription] = useState('');
    const [bucket, setBucket] = useState('');
    const [path, setPath] = useState('');
    const [category, setCategory] = useState<PhotoCategory>('web_content');
    const [assetType, setAssetType] = useState<AssetType>('photo');
    const [isPublic, setIsPublic] = useState(true);
    const [sort, setSort] = useState<number>(32767);
    const [sessionId, setSessionId] = useState('');

    const resetForm = () => {
        setEditing(null);
        setTitle('');
        setAssetKey('');
        setDescription('');
        setBucket('');
        setPath('');
        setCategory('web_content');
        setAssetType('photo');
        setIsPublic(true);
        setSort(32767);
        setSessionId('');
    };

    const openAdd = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEdit = (item: MediaAsset) => {
        setEditing(item);
        setTitle(item.title);
        setAssetKey(item.asset_key ?? '');
        setDescription(item.description ?? '');
        setBucket(item.bucket);
        setPath(item.path);
        setCategory(item.category);
        setAssetType(item.asset_type);
        setIsPublic(item.public);
        setSort(item.sort);
        setSessionId(item.session_id ?? '');
        setDialogOpen(true);
    };

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/media/assets', { method: 'GET' });
            const body = await res.json().catch(() => ({}));
            if (!res.ok || !body?.ok) throw new Error(body?.message || `Load failed (${res.status})`);
            setItems(((body?.items ?? []) as MediaAsset[]) ?? []);
        } catch (e: any) {
            setError(e?.message || 'Load failed');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const rows = useMemo(() => items, [items]);

    const save = async () => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                op: 'upsert',
                asset: {
                    id: editing?.id || undefined,
                    asset_key: assetKey.trim() ? assetKey.trim() : null,
                    title,
                    description: description || null,
                    public: isPublic,
                    bucket,
                    path,
                    category,
                    asset_type: assetType,
                    sort: Number.isFinite(sort) ? sort : 32767,
                    session_id: sessionId.trim() ? sessionId.trim() : null,
                },
            };

            const res = await fetch('/api/admin/media/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok || !body?.ok) throw new Error(body?.message || `Save failed (${res.status})`);

            setDialogOpen(false);
            resetForm();
            await load();
        } catch (e: any) {
            setError(e?.message || 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    const openPreview = async (b: string, p: string) => {
        try {
            const url = await getSignedUrl(b, p);
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
        } catch (e: any) {
            setError(e?.message || 'Preview failed');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6">Media</Typography>
                <Box sx={{ flex: 1 }} />
                <Button variant="outlined" onClick={load} disabled={loading}>
                    Refresh
                </Button>
                <Button variant="contained" onClick={openAdd} sx={{ backgroundColor: '#20B2AA' }}>
                    Add Media
                </Button>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            ) : null}

            <Box sx={{ mt: 2, overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Asset Key</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Public</TableCell>
                            <TableCell>Bucket / Path</TableCell>
                            <TableCell>Sort</TableCell>
                            <TableCell>Preview</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((i) => (
                            <TableRow key={i.id}>
                                <TableCell>
                                    <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>{i.asset_key || '—'}</Box>
                                </TableCell>
                                <TableCell>{i.title}</TableCell>
                                <TableCell>{i.category}</TableCell>
                                <TableCell>{i.asset_type}</TableCell>
                                <TableCell>{i.public ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                    <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                                        {i.bucket}/{i.path}
                                    </Box>
                                </TableCell>
                                <TableCell>{i.sort}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => openPreview(i.bucket, i.path)}>
                                        Open
                                    </Button>
                                </TableCell>
                                <TableCell align="right">
                                    <Button size="small" onClick={() => openEdit(i)}>
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!rows.length ? (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <Typography color="text.secondary">{loading ? 'Loading…' : 'No media yet.'}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editing ? 'Edit Media' : 'Add Media'}</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
                    <TextField
                        label="Asset Key (stable pointer)"
                        value={assetKey}
                        onChange={(e) => setAssetKey(e.target.value)}
                        fullWidth
                        helperText="Example: home.hero or home.photo_stream.001"
                    />
                    <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField label="Bucket" value={bucket} onChange={(e) => setBucket(e.target.value)} fullWidth />
                        <TextField label="Path" value={path} onChange={(e) => setPath(e.target.value)} fullWidth />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id="media-category">Category</InputLabel>
                            <Select
                                labelId="media-category"
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as PhotoCategory)}
                            >
                                {CATEGORIES.map((c) => (
                                    <MenuItem key={c} value={c}>
                                        {c}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="media-type">Type</InputLabel>
                            <Select
                                labelId="media-type"
                                label="Type"
                                value={assetType}
                                onChange={(e) => setAssetType(e.target.value as AssetType)}
                            >
                                {ASSET_TYPES.map((t) => (
                                    <MenuItem key={t} value={t}>
                                        {t}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="Sort"
                            type="number"
                            value={String(sort)}
                            onChange={(e) => setSort(parseInt(e.target.value || '0', 10))}
                            fullWidth
                        />
                        <TextField
                            label="Session ID (optional)"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                        <Typography>Public</Typography>
                    </Box>

                    {bucket && path ? (
                        <Typography variant="body2" color="text.secondary">
                            Preview uses a signed URL (works for private buckets).
                        </Typography>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={save} disabled={loading} sx={{ backgroundColor: '#20B2AA' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
