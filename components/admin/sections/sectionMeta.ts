export type SectionKind = 'hero' | 'richText' | 'media' | 'card_group';

export type CardGroupSourceKey = 'home.cards.lessons' | 'home.cards.gallery' | 'home.cards.team';

export type SectionOwner = { type: 'page' | 'card'; key: string } | null;

export type SectionMetaBase = {
    version: number;
    kind: SectionKind;
    owner?: SectionOwner;
    sort?: number;
    fields?: Record<string, any>;
    actions?: any;
    media?: any;
};

export type CardGroupSectionMeta = SectionMetaBase & {
    kind: 'card_group';
    fields: {
        sourceKey: CardGroupSourceKey;
        variant?: string;
    } & Record<string, any>;
};

export type SectionMeta =
    | CardGroupSectionMeta
    | (SectionMetaBase & {
          // Other kinds keep flexible JSON for now.
      });
