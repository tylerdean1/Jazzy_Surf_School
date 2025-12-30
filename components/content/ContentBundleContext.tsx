'use client';

import React, { createContext, useContext, useMemo } from 'react';
import useContentBundle from '@/hooks/useContentBundle';
import type { ContentBundleMediaItem } from '@/types/contentBundle';

type Value = {
    prefix: string;
    mediaPrefix: string;
    locale: 'en' | 'es';
    strings: Record<string, string>;
    media: ContentBundleMediaItem[];
    loading: boolean;
    error: string | null;
};

const ContentBundleContext = createContext<Value | null>(null);

export function useContentBundleContext() {
    return useContext(ContentBundleContext);
}

export default function ContentBundleProvider({
    prefix,
    mediaPrefix,
    children,
}: {
    prefix: string;
    mediaPrefix?: string;
    children: React.ReactNode;
}) {
    const bundle = useContentBundle(prefix, mediaPrefix);

    const value = useMemo<Value>(
        () => ({
            prefix: bundle.prefix,
            mediaPrefix: bundle.mediaPrefix,
            locale: bundle.locale,
            strings: bundle.strings,
            media: bundle.media,
            loading: bundle.loading,
            error: bundle.error,
        }),
        [bundle.prefix, bundle.mediaPrefix, bundle.locale, bundle.strings, bundle.media, bundle.loading, bundle.error]
    );

    return <ContentBundleContext.Provider value={value}>{children}</ContentBundleContext.Provider>;
}
