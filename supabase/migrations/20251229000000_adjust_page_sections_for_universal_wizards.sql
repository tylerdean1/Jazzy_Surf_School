-- Adjust legacy CMS "section.<uuid>.meta" rows into the new universal page-sections system.
--
-- Goals:
-- - Normalize existing page_sections rows to the canonical kind/status expectations.
-- - Seed page_sections for pages that still store structure in cms_page_content under category 'sections.page.<pageKey>'.
--
-- Notes:
-- - This is written to be safe to re-run (idempotent-ish) via ON CONFLICT.
-- - It avoids JSON casting of cms_page_content.body_en (string) to prevent failures on malformed JSON;
--   instead it uses regex extraction for a few known keys.

begin;

-- 1) Normalize existing rows to match frontend expectations.
update public.page_sections
set
  kind = 'richText'
where kind in ('rich_text', 'richtext');

update public.page_sections
set
  status = 'published'
where status is null or btrim(status) = '';

update public.page_sections
set
  meta = coalesce(meta, '{}'::jsonb),
  content_source = coalesce(content_source, '{}'::jsonb),
  media_source = coalesce(media_source, '{}'::jsonb)
where meta is null or content_source is null or media_source is null;

-- 2) Seed page_sections from legacy structure rows stored in cms_page_content.
-- Legacy pattern:
-- - category:  sections.page.<pageKey>
-- - page_key:  section.<uuid>.meta
-- - body_en:   JSON-ish blob containing at least {"kind":"hero"|"media"|"rich_text"|"richText"|"card_group", ...}
with legacy as (
  select
    substring(c.page_key from '^section\\.([0-9a-fA-F-]{36})\\.meta$')::uuid as id,
    substring(c.category from '^sections\\.page\\.([a-z0-9_]+)$') as target_page_key,
    coalesce(c.sort, 0) as sort,
    substring(c.body_en from '"kind"\\s*:\\s*"([^"]+)"') as kind_raw,
    substring(c.body_en from '"sourceKey"\\s*:\\s*"([^"]+)"') as source_key_raw,
    substring(c.body_en from '"variant"\\s*:\\s*"([^"]+)"') as variant_raw
  from public.cms_page_content c
  where
    c.page_key ~* '^section\\.[0-9a-fA-F-]{36}\\.meta$'
    and c.category ~* '^sections\\.page\\.[a-z0-9_]+$'
),
normalized as (
  select
    id,
    target_page_key,
    sort,
    case
      when kind_raw = 'rich_text' then 'richText'
      when kind_raw = 'richText' then 'richText'
      when kind_raw = 'hero' then 'hero'
      when kind_raw = 'media' then 'media'
      when kind_raw = 'card_group' then 'card_group'
      else null
    end as kind,
    source_key_raw,
    variant_raw
  from legacy
  where target_page_key is not null and btrim(target_page_key) <> ''
)
insert into public.page_sections (
  id,
  page_key,
  kind,
  sort,
  status,
  anchor,
  meta,
  content_source,
  media_source
)
select
  n.id,
  n.target_page_key as page_key,
  n.kind,
  n.sort,
  'published' as status,
  null as anchor,
  '{}'::jsonb as meta,
  case
    when n.kind = 'hero' then
      jsonb_build_object(
        'titleKey', format('section.%s.title', n.id),
        'subtitleKey', format('section.%s.subtitle', n.id),
        'ctaPrimary', jsonb_build_object('labelKey', format('section.%s.primaryAction', n.id)),
        'ctaSecondary', jsonb_build_object('labelKey', format('section.%s.secondaryAction', n.id))
      )
    when n.kind = 'richText' then
      jsonb_build_object('bodyKey', format('section.%s.body', n.id))
    when n.kind = 'card_group' then
      (
        case
          when n.source_key_raw is not null and btrim(n.source_key_raw) <> '' then
            jsonb_strip_nulls(
              jsonb_build_object(
                'sourceKey', n.source_key_raw,
                'variant', case when n.variant_raw is not null and btrim(n.variant_raw) <> '' then n.variant_raw else null end
              )
            )
          else '{}'::jsonb
        end
      )
    else
      '{}'::jsonb
  end as content_source,
  case
    when n.kind = 'media' then
      jsonb_build_object('primarySlot', format('section.%s.media.0', n.id))
    else
      '{}'::jsonb
  end as media_source
from normalized n
where n.kind is not null
on conflict (id) do update
set
  page_key = excluded.page_key,
  kind = case
    when public.page_sections.kind in ('rich_text', 'richtext') then 'richText'
    else public.page_sections.kind
  end,
  status = coalesce(nullif(btrim(public.page_sections.status), ''), excluded.status),
  sort = case
    when public.page_sections.sort = 32767 and excluded.sort <> 32767 then excluded.sort
    else public.page_sections.sort
  end,
  meta = case
    when public.page_sections.meta = '{}'::jsonb then excluded.meta
    else public.page_sections.meta
  end,
  content_source = case
    when public.page_sections.content_source = '{}'::jsonb then excluded.content_source
    else public.page_sections.content_source
  end,
  media_source = case
    when public.page_sections.media_source = '{}'::jsonb then excluded.media_source
    else public.page_sections.media_source
  end;

commit;
