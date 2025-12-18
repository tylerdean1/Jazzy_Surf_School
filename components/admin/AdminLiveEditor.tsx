'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
    const router = useRouter();
    const locale = useLocale();
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

    const onChangePage = (next: string) => {
        router.push(`/${locale}/admin?page=${encodeURIComponent(next)}`);
    };

    const blockNavigationCapture = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('[data-admin-edit-ui="1"]')) return;

        const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
        if (anchor) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <AdminEditProvider enabled>
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 260 }}>
                        <InputLabel id="admin-edit-page-label">Page</InputLabel>
                        <Select
                            labelId="admin-edit-page-label"
                            label="Page"
                            value={page}
                            onChange={(e) => onChangePage(String(e.target.value))}
                        >
                            {ADMIN_PAGES.map((p) => (
                                <MenuItem key={p} value={p}>
                                    {p}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box
                    onClickCapture={blockNavigationCapture}
                    sx={{
                        mt: 3,
                        '& a[href]': {
                            pointerEvents: 'none',
                            cursor: 'default',
                        },
                    }}
                >
                    <Component />
                </Box>
            </Box>
        </AdminEditProvider>
    );
}
