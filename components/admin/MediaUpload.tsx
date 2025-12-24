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
import useContentBundle from '@/hooks/useContentBundle';

type AssetType = 'photo' | 'video';
type PhotoCategory = 'logo' | 'hero' | 'lessons' | 'web_content' | 'uncategorized';

type Mode = 'single' | 'bulk';

const CATEGORIES: PhotoCategory[] = ['logo', 'hero', 'lessons', 'web_content', 'uncategorized'];
const ASSET_TYPES: AssetType[] = ['photo', 'video'];
const BUCKETS = ['Lesson_Photos', 'Private_Photos'] as const;

export default function MediaUpload() {
    const admin = useContentBundle('admin.');
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

    const categoryLabel = (c: PhotoCategory) => {
        const key = `admin.media.category.${c}`;
        const fallback = c === 'web_content' ? 'Web content' : c === 'uncategorized' ? 'Uncategorized' : c;
        return admin.t(key, fallback);
    };

    const typeLabel = (t: AssetType) => {
        const key = `admin.media.type.${t}`;
        const fallback = t === 'photo' ? 'Photo' : t === 'video' ? 'Video' : t;
        return admin.t(key, fallback);
    };

    const bucketLabel = (b: (typeof BUCKETS)[number]) => {
        const key = `admin.upload.bucket.${b}`;
        const fallback = b;
        return admin.t(key, fallback);
    };

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
            setError(admin.t('admin.upload.errors.chooseFile', 'Choose at least one file.'));
            return;
        }

        if (mode === 'single' && !title.trim()) {
            setError(admin.t('admin.upload.errors.titleRequiredSingle', 'Title is required for single upload.'));
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
            setSuccess(admin.t('admin.upload.success', 'Uploaded {count} file(s).').replace('{count}', String(up.length)));
            setFiles(null);
            if (mode === 'single') {
                setTitle('');
                setAssetKey('');
            } else {
                setAssetKeyPrefix('');
            }
        } catch (e: any) {
            setError(e?.message || admin.t('admin.upload.errors.uploadFailed', 'Upload failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Typography variant="h5">{admin.t('admin.upload.title', 'Upload Media')}</Typography>
            <Typography variant="body2" color="text.secondary">
                {admin.t(
                    'admin.upload.subtitle',
                    'Upload to Supabase Storage and create matching rows in media_assets.'
                )}
            </Typography>

            <Tabs value={mode} onChange={(_, v) => setMode(v)}>
                <Tab value="single" label={admin.t('admin.upload.mode.single', 'Single')} />
                <Tab value="bulk" label={admin.t('admin.upload.mode.bulk', 'Bulk')} />
            </Tabs>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="upload-bucket">{admin.t('admin.upload.fields.bucket', 'Bucket')}</InputLabel>
                        <Select
                            labelId="upload-bucket"
                            label={admin.t('admin.upload.fields.bucket', 'Bucket')}
                            value={bucket}
                            onChange={(e) => onChangeBucket(e.target.value as any)}
                        >
                            {BUCKETS.map((b) => (
                                <MenuItem key={b} value={b}>
                                    {bucketLabel(b)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label={admin.t('admin.upload.fields.folder', 'Folder (optional)')}
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        helperText={admin.t('admin.upload.fields.folderHelp', 'Example: hero_shot or lessons/session_123')}
                        fullWidth
                    />
                </Box>

                {mode === 'single' ? (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                            label={admin.t('admin.upload.fields.title', 'Title')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label={admin.t('admin.upload.fields.assetKey', 'Asset Key (optional)')}
                            value={assetKey}
                            onChange={(e) => setAssetKey(e.target.value)}
                            helperText={admin.t('admin.upload.fields.assetKeyHelp', 'Stable pointer used by components, e.g. home.hero')}
                            fullWidth
                        />
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Alert severity="info">{admin.t('admin.upload.bulk.hint', 'Bulk titles are derived from the filename and a generated UUID.')}</Alert>
                        <TextField
                            label={admin.t('admin.upload.fields.assetKeyPrefix', 'Asset Key Prefix (optional)')}
                            value={assetKeyPrefix}
                            onChange={(e) => setAssetKeyPrefix(e.target.value)}
                            helperText={admin.t(
                                'admin.upload.fields.assetKeyPrefixHelp',
                                'If set, keys are auto-generated like prefix.001, prefix.002 (upload order).'
                            )}
                            fullWidth
                        />
                    </Box>
                )}

                <TextField
                    label={admin.t('admin.upload.fields.description', 'Description')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="upload-category">{admin.t('admin.upload.fields.category', 'Category')}</InputLabel>
                        <Select
                            labelId="upload-category"
                            label={admin.t('admin.upload.fields.category', 'Category')}
                            value={category}
                            onChange={(e) => setCategory(e.target.value as PhotoCategory)}
                        >
                            {CATEGORIES.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {categoryLabel(c)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="upload-type">{admin.t('admin.upload.fields.type', 'Type')}</InputLabel>
                        <Select
                            labelId="upload-type"
                            label={admin.t('admin.upload.fields.type', 'Type')}
                            value={assetType}
                            onChange={(e) => setAssetType(e.target.value as AssetType)}
                        >
                            {ASSET_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {typeLabel(t)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label={admin.t('admin.upload.fields.sort', 'Sort')}
                        type="number"
                        value={String(sort)}
                        onChange={(e) => setSort(parseInt(e.target.value || '0', 10))}
                        fullWidth
                    />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
                    <TextField
                        label={admin.t('admin.upload.fields.sessionId', 'Session ID (optional)')}
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                        <Typography>{admin.t('admin.upload.fields.publicFlag', 'Public (DB flag)')}</Typography>
                        {isPublic !== publicDefault ? (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                {publicDefault
                                    ? admin.t('admin.upload.publicDefault.public', 'Bucket default is public')
                                    : admin.t('admin.upload.publicDefault.private', 'Bucket default is private')}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>

                <Box>
                    <input
                        type="file"
                        aria-label={
                            mode === 'bulk'
                                ? admin.t('admin.upload.fileInput.bulkAria', 'Select files for bulk upload')
                                : admin.t('admin.upload.fileInput.singleAria', 'Select file for upload')
                        }
                        title={
                            mode === 'bulk'
                                ? admin.t('admin.upload.fileInput.bulkTitle', 'Select files for bulk upload')
                                : admin.t('admin.upload.fileInput.singleTitle', 'Select file for upload')
                        }
                        multiple={mode === 'bulk'}
                        onChange={(e) => setFiles(e.target.files)}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="contained" onClick={submit} disabled={loading}>
                        {loading ? admin.t('admin.upload.uploading', 'Uploading…') : admin.t('admin.upload.upload', 'Upload')}
                    </Button>
                </Box>

                {uploaded.length ? (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            {admin.t('admin.upload.uploadedTitle', 'Uploaded')}
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
