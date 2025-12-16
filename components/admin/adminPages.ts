export const ADMIN_PAGES = [
    'home',
    'lessons',
    'book',
    'gallery',
    'mission_statement',
    'about_jaz',
    'team',
    'faq',
    'contact',
] as const;

export type AdminPageKey = (typeof ADMIN_PAGES)[number];
