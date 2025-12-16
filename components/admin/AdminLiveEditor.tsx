'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { AdminEditProvider } from '@/components/admin/edit/AdminEditContext';

import { ADMIN_PAGES, type AdminPageKey } from './adminPages';

import HomePage from '@/app/[locale]/page';
import LessonsPage from '@/app/[locale]/lessons/page';
import MissionStatementPage from '@/app/[locale]/mission_statement/page';
import TeamPage from '@/app/[locale]/team/page';
import FaqPage from '@/app/[locale]/faq/page';
import ContactPage from '@/app/[locale]/contact/page';
import GalleryPage from '@/app/[locale]/gallery/page';
import AboutJazPage from '@/app/[locale]/about_jaz/page';
import BookPage from '@/app/[locale]/book/page';

export default function AdminLiveEditor() {
    const searchParams = useSearchParams();
    const page = (searchParams.get('page') || 'home') as AdminPageKey;

    const Component = useMemo(() => {
        switch (page) {
            case 'home':
                return HomePage;
            case 'lessons':
                return LessonsPage;
            case 'book':
                return BookPage;
            case 'gallery':
                return GalleryPage;
            case 'mission_statement':
                return MissionStatementPage;
            case 'about_jaz':
                return AboutJazPage;
            case 'team':
                return TeamPage;
            case 'faq':
                return FaqPage;
            case 'contact':
                return ContactPage;
            default:
                return null;
        }
    }, [page]);

    if (!Component) {
        return <Alert severity="error">Unknown page: {page}</Alert>;
    }

    return (
        <AdminEditProvider enabled>
            <Box sx={{ mt: 3 }}>
                <Component />
            </Box>
        </AdminEditProvider>
    );
}
