export type ContentBundleMediaItem = {
    slot_key: string;
    sort: number;
    id: string;
    title: string;
    description: string | null;
    bucket: string;
    path: string;
    public: boolean;
    asset_type: 'photo' | 'video';
    category: string;
    created_at: string;
    updated_at: string;
    url: string;
};

export type ContentBundleResponse = {
    ok: true;
    locale: 'en' | 'es';
    prefix: string;
    strings: Record<string, string>;
    updatedAtByKey: Record<string, string>;
    media: ContentBundleMediaItem[];
};

export type ContentBundleError = {
    ok: false;
    message: string;
};
