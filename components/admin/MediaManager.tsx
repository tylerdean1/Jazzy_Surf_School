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
import supabaseClient from '../../lib/supabaseClient';
import type { Database } from '../../lib/database.types';

type AssetType = 'photo' | 'video';
type PhotoCategory = 'logo' | 'hero' | 'lessons' | 'web_content' | 'uncategorized';

type MediaAsset = {
    id: string;
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

function computePublicUrl(bucket: string, path: string): string {
    if (!bucket || !path) return '';
    try {
        const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    } catch {
        return '';
    }
}

export default function MediaManager() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<MediaAsset[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<MediaAsset | null>(null);

    const [title, setTitle] = useState('');
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
        const { data, error } = await supabaseClient.rpc('admin_list_media_assets');
        if (error) {
            setError(error.message);
            setItems([]);
            setLoading(false);
            return;
        }
        setItems(((data ?? []) as unknown as MediaAsset[]) ?? []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const rows = useMemo(() => {
        return items.map((i) => ({
            ...i,
            publicUrl: computePublicUrl(i.bucket, i.path),
        }));
    }, [items]);

    const save = async () => {
        setLoading(true);
        setError(null);

        const payload: Database['public']['Functions']['admin_upsert_media_asset']['Args'] = {
            p_bucket: bucket,
            p_path: path,
            p_title: title,
            p_public: isPublic,
            p_category: category,
            p_asset_type: assetType,
            p_description: description || undefined,
            p_session_id: sessionId.trim() ? sessionId.trim() : undefined,
            p_sort: Number.isFinite(sort) ? sort : 32767,
        };

        if (editing?.id) payload.p_id = editing.id;

        const { error } = await supabaseClient.rpc('admin_upsert_media_asset', payload);
        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setDialogOpen(false);
        resetForm();
        await load();
        setLoading(false);
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
                                    {i.publicUrl ? (
                                        <a href={i.publicUrl} target="_blank" rel="noreferrer">
                                            Open
                                        </a>
                                    ) : (
                                        <Box component="span" sx={{ color: 'text.disabled' }}>
                                            —
                                        </Box>
                                    )}
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
                                <TableCell colSpan={8}>
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
                            Public URL: {computePublicUrl(bucket, path) || '—'}
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
