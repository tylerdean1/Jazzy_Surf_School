export type SectionKind = 'hero' | 'richText' | 'media' | 'card_group';

export type CardGroupSourceKey = 'home.cards.lessons' | 'home.cards.gallery' | 'home.cards.team';

export type CardGroupVariant = 'default';

export type SectionOwner = { type: 'page' | 'card'; key: string } | null;

export type SectionMetaBase = {
    version: number;
    kind: SectionKind;
    owner?: SectionOwner;
    sort?: number;
};

export type HeroSectionMeta = SectionMetaBase & {
    kind: 'hero';
    fields?: {
        titleKey?: string;
        subtitleKey?: string;
    };
    media?: {
        heroBackground?: { slotKey?: string };
    };
};

export type RichTextSectionMeta = SectionMetaBase & {
    kind: 'richText';
    fields?: {
        bodyKey?: string;
    };
};

export type MediaSectionMeta = SectionMetaBase & {
    kind: 'media';
    media?: {
        primary?: {
            type?: 'single';
            slotKey?: string;
        };
    };
};

export type CardGroupSectionMeta = SectionMetaBase & {
    kind: 'card_group';
    sourceKey: CardGroupSourceKey;
    variant?: CardGroupVariant;
};

export type SectionMeta = HeroSectionMeta | RichTextSectionMeta | MediaSectionMeta | CardGroupSectionMeta;
