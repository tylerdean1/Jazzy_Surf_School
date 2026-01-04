'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import useContentBundle from '@/hooks/useContentBundle';
import LoadingOverlay from '@/components/LoadingOverlay';

const LOADING_TITLE = 'Sunset Surf Academy';
const LOADING_SUBTITLE = 'Loading...';

function normalizePathname(pathname: string) {
    // ensure no trailing slash (except root)
    if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
    return pathname;
}

export default function AppLoadingFrame({
    locale,
    children,
}: {
    locale: string;
    children: React.ReactNode;
}) {
    const pathnameRaw = usePathname() || '';
    const pathname = normalizePathname(pathnameRaw);

    // Always treat the nav bundle as critical (logo + nav media).
    const nav = useContentBundle('ui.');

    // Only gate on home bundle for the initial route (e.g. /en, /es).
    // This uses the same underlying fetch/cache as page-level providers, so it should not double-fetch.
    const isHome = pathname === `/${locale}`;
    const home = useContentBundle('page.home.', 'home.');

    const appReady = React.useMemo(() => {
        const navReady = !nav.loading;
        const homeReady = !home.loading;
        return navReady && (!isHome || homeReady);
    }, [nav.loading, home.loading, isHome]);

    return (
        <>
            <LoadingOverlay
                appReady={appReady}
                minMs={2000}
                maxMs={8000}
                title={LOADING_TITLE}
                subtitle={LOADING_SUBTITLE}
                videoSrc="/loading_video.mp4"
            />
            {children}
        </>
    );
}
