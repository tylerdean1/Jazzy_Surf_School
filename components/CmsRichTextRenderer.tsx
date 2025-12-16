'use client';

import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { generateHTML } from '@tiptap/html';
import { safeParseJsonDoc } from '../lib/cmsRichText';

export default function CmsRichTextRenderer({ json }: { json: string | null | undefined }) {
    const html = useMemo(() => {
        const doc = safeParseJsonDoc(json);
        try {
            return generateHTML(doc as any, [StarterKit, TextStyle, Color]);
        } catch {
            return '';
        }
    }, [json]);

    return (
        <Box
            sx={{
                '& h1, & h2, & h3': { margin: '0.75rem 0 0.5rem' },
                '& p': { margin: '0.5rem 0' },
                '& ul, & ol': { paddingLeft: '1.25rem', margin: '0.5rem 0' },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
