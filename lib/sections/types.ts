export type SectionKind = 'hero' | 'rich_text' | 'media' | 'card_group';

// Phase 5: public-safe section meta types.
// These are intentionally defined outside of components/admin/** and do not import admin types.

export type CardGroupSourceKey = 'home.cards.lessons' | 'home.cards.gallery' | 'home.cards.team';
export type CardGroupVariant = 'default';

export type CardGroupConfig = {
    sourceKey: CardGroupSourceKey;
    variant?: CardGroupVariant;
};

export type HeroConfig = {
    // TODO (Phase 5.2+): define hero config shape.
};

export type RichTextConfig = {
    // Phase 5: minimal config for rich_text sections.
    // Canonical field storage: section.<uuid>.body
    fieldKey?: 'body';
};

export type MediaConfig = {
    // TODO (Phase 5.2+): define media config shape.
};

export type BaseSectionMeta<K extends SectionKind = SectionKind, C = unknown> = {
    id: string;
    kind: K;
    sort: number;
    config: C;
};

export type HeroSectionMeta = BaseSectionMeta<'hero', HeroConfig>;
export type RichTextSectionMeta = BaseSectionMeta<'rich_text', RichTextConfig>;
export type MediaSectionMeta = BaseSectionMeta<'media', MediaConfig>;
export type CardGroupSectionMeta = BaseSectionMeta<'card_group', CardGroupConfig>;

export type SectionMeta = HeroSectionMeta | RichTextSectionMeta | MediaSectionMeta | CardGroupSectionMeta;

export function hasSectionsForPage(sections: SectionMeta[] | null | undefined): boolean {
    return Array.isArray(sections) && sections.length > 0;
}
