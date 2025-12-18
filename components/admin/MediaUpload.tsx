'use client';

import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';

type AssetType = 'photo' | 'video';
type PhotoCategory = 'logo' | 'hero' | 'lessons' | 'web_content' | 'uncategorized';

type Mode = 'single' | 'bulk';

const CATEGORIES: PhotoCategory[] = ['logo', 'hero', 'lessons', 'web_content', 'uncategorized'];
const ASSET_TYPES: AssetType[] = ['photo', 'video'];
const BUCKETS = ['Lesson_Photos', 'Private_Photos'] as const;

export default function MediaUpload() {
    const [mode, setMode] = useState<Mode>('single');
    const [bucket, setBucket] = useState<(typeof BUCKETS)[number]>('Lesson_Photos');
    const [folder, setFolder] = useState('');

    const [title, setTitle] = useState('');
    const [assetKey, setAssetKey] = useState('');
    const [assetKeyPrefix, setAssetKeyPrefix] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<PhotoCategory>('uncategorized');
    const [assetType, setAssetType] = useState<AssetType>('photo');
    const [isPublic, setIsPublic] = useState(true);
    const [sort, setSort] = useState<number>(32767);
    const [sessionId, setSessionId] = useState('');

    const [files, setFiles] = useState<FileList | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState<Array<{ bucket: string; path: string; id: string }>>([]);

    const publicDefault = useMemo(() => bucket === 'Lesson_Photos', [bucket]);

    const onChangeBucket = (b: (typeof BUCKETS)[number]) => {
        setBucket(b);
        // Keep it convenient: default public mirrors bucket intent.
        setIsPublic(b === 'Lesson_Photos');
    };

    const submit = async () => {
        setError(null);
        setSuccess(null);
        setUploaded([]);

        if (!files || files.length === 0) {
            setError('Choose at least one file.');
            return;
        }

        if (mode === 'single' && !title.trim()) {
            setError('Title is required for single upload.');
            return;
        }

        const fd = new FormData();
        fd.set('mode', mode);
        fd.set('bucket', bucket);
        fd.set('folder', folder);
        fd.set('public', String(isPublic));
        fd.set('category', category);
        fd.set('asset_type', assetType);
        fd.set('description', description);
        fd.set('sort', String(sort));
        fd.set('session_id', sessionId);
        if (mode === 'single') fd.set('title', title);
        if (mode === 'single' && assetKey.trim()) fd.set('asset_key', assetKey.trim());
        if (mode === 'bulk' && assetKeyPrefix.trim()) fd.set('asset_key_prefix', assetKeyPrefix.trim());

        const list = Array.from(files);
        if (mode === 'single') {
            fd.append('files', list[0]);
        } else {
            list.forEach((f) => fd.append('files', f));
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
            const body = await res.json().catch(() => ({}));
            if (!res.ok || !body?.ok) throw new Error(body?.message || `Upload failed (${res.status})`);

            const up = ((body?.uploaded ?? []) as Array<{ bucket: string; path: string; id: string }>) ?? [];
            setUploaded(up);
            setSuccess(`Uploaded ${up.length} file(s).`);
            setFiles(null);
            if (mode === 'single') {
                setTitle('');
                setAssetKey('');
            } else {
                setAssetKeyPrefix('');
            }
        } catch (e: any) {
            setError(e?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Typography variant="h5">Upload Media</Typography>
            <Typography variant="body2" color="text.secondary">
                Upload to Supabase Storage and create matching rows in <Box component="span" sx={{ fontFamily: 'monospace' }}>media_assets</Box>.
            </Typography>

            <Tabs value={mode} onChange={(_, v) => setMode(v)}>
                <Tab value="single" label="Single" />
                <Tab value="bulk" label="Bulk" />
            </Tabs>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="upload-bucket">Bucket</InputLabel>
                        <Select
                            labelId="upload-bucket"
                            label="Bucket"
                            value={bucket}
                            onChange={(e) => onChangeBucket(e.target.value as any)}
                        >
                            {BUCKETS.map((b) => (
                                <MenuItem key={b} value={b}>
                                    {b}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Folder (optional)"
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        helperText="Example: hero_shot or lessons/session_123"
                        fullWidth
                    />
                </Box>

                {mode === 'single' ? (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
                        <TextField
                            label="Asset Key (optional)"
                            value={assetKey}
                            onChange={(e) => setAssetKey(e.target.value)}
                            helperText="Stable pointer used by components, e.g. home.hero"
                            fullWidth
                        />
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Alert severity="info">Bulk titles are derived from the filename and a generated UUID.</Alert>
                        <TextField
                            label="Asset Key Prefix (optional)"
                            value={assetKeyPrefix}
                            onChange={(e) => setAssetKeyPrefix(e.target.value)}
                            helperText="If set, keys are auto-generated like prefix.001, prefix.002 (upload order)."
                            fullWidth
                        />
                    </Box>
                )}

                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="upload-category">Category</InputLabel>
                        <Select
                            labelId="upload-category"
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
                        <InputLabel id="upload-type">Type</InputLabel>
                        <Select
                            labelId="upload-type"
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

                    <TextField
                        label="Sort"
                        type="number"
                        value={String(sort)}
                        onChange={(e) => setSort(parseInt(e.target.value || '0', 10))}
                        fullWidth
                    />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Session ID (optional)"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                        <Typography>Public (DB flag)</Typography>
                        {isPublic !== publicDefault ? (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                Bucket default is {publicDefault ? 'public' : 'private'}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>

                <Box>
                    <input
                        type="file"
                        aria-label={mode === 'bulk' ? 'Select files for bulk upload' : 'Select file for upload'}
                        title={mode === 'bulk' ? 'Select files for bulk upload' : 'Select file for upload'}
                        multiple={mode === 'bulk'}
                        onChange={(e) => setFiles(e.target.files)}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="contained" onClick={submit} disabled={loading}>
                        {loading ? 'Uploading…' : 'Upload'}
                    </Button>
                </Box>

                {uploaded.length ? (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Uploaded
                        </Typography>
                        {uploaded.map((u) => (
                            <Box key={u.id} sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                                {u.bucket}/{u.path}
                            </Box>
                        ))}
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}
