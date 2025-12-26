import type * as React from 'react';

import type { SectionKind, SectionMeta } from '@/lib/sections/types';

export type SectionRenderer = (section: SectionMeta) => React.ReactNode;

// Phase 5: public-safe section registry (stub).
// IMPORTANT: Do not import admin registries or admin types here.
// TODO (Phase 5.2+): implement real renderers for each kind.

export const sectionRegistry: Record<SectionKind, SectionRenderer> = {
    hero: () => null,
    rich_text: () => null,
    media: () => null,
    card_group: () => null,
};
