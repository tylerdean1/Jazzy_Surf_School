-- Why this migration exists
-- -------------------------
-- The CMS historically accumulated multiple key variants for the same on-page copy
-- (e.g. camelCase message keys like `home.heroTitle` alongside dotted keys like
-- `home.hero.title`). The *current* Home page reads the dotted keys.
--
-- Goal
-- ----
-- Safely normalize legacy Home keys by ensuring the canonical dotted keys exist
-- and are populated, WITHOUT losing data and WITHOUT touching section-based rows.
--
-- Non-destructive / additive
-- -------------------------
-- This migration NEVER deletes or removes legacy rows. Cleanup/removal of legacy
-- keys, if desired, must happen in a later explicit migration.
--
-- Hard rules enforced here
-- -----------------------
-- - Idempotent: safe to run multiple times.
-- - Canonical keys are only filled when canonical is NULL/empty.
-- - Canonical approved becomes (canonical OR legacy).
-- - Canonical category/sort are only filled when canonical is NULL.
-- - Does NOT touch any `section.<id>.*` rows.

begin;

-- Map known legacy variants -> canonical dotted keys.
-- NOTE: Keep this list deterministic and explicit. Do NOT attempt to “auto-convert”
-- arbitrary keys in SQL; that can cause unintended merges.
create temporary table if not exists tmp_home_key_map (
  legacy_key text primary key,
  canonical_key text not null
) on commit drop;

truncate table tmp_home_key_map;

insert into tmp_home_key_map (legacy_key, canonical_key) values
  ('home.heroTitle', 'home.hero.title'),
  ('home.heroSubtitle', 'home.hero.subtitle'),
  ('home.bookNow', 'home.hero.primaryAction'),
  ('home.learnMore', 'home.hero.secondaryAction'),
  ('home.lessonsTitle', 'home.cards.lessons.title'),
  ('home.lessonsDescription', 'home.cards.lessons.description'),
  ('home.galleryTitle', 'home.cards.gallery.title'),
  ('home.galleryDescription', 'home.cards.gallery.description'),
  ('home.teamTitle', 'home.cards.team.title'),
  ('home.teamDescription', 'home.cards.team.description');

-- Safety checks
-- -------------
-- 1) Ensure we are NOT touching section.<id>.* keys.
do $$
begin
  if exists (
    select 1
    from tmp_home_key_map
    where legacy_key like 'section.%'
       or canonical_key like 'section.%'
  ) then
    raise exception 'tmp_home_key_map contains section.* keys; this migration must not touch section.<id>.* rows.';
  end if;
end $$;

-- 2) Assert `page_key` uniqueness for keys involved in this mapping.
-- The table has a UNIQUE constraint on page_key, so duplicates should never exist,
-- but this check fails loudly if the backend deviates.
do $$
begin
  if exists (
    select 1
    from public.cms_page_content c
    where c.page_key in (
      select legacy_key from tmp_home_key_map
      union
      select canonical_key from tmp_home_key_map
    )
    group by c.page_key
    having count(*) > 1
  ) then
    raise exception 'Duplicate cms_page_content.page_key rows detected for keys in tmp_home_key_map.';
  end if;
end $$;

-- Step 1: Ensure canonical keys exist (insert if missing) WHEN legacy exists.
-- This is additive and idempotent.
insert into public.cms_page_content (
  page_key,
  body_en,
  body_es_draft,
  body_es_published,
  approved,
  category,
  sort
)
select
  m.canonical_key,
  l.body_en,
  l.body_es_draft,
  l.body_es_published,
  coalesce(l.approved, false),
  l.category,
  l.sort
from tmp_home_key_map m
join public.cms_page_content l on l.page_key = m.legacy_key
left join public.cms_page_content c on c.page_key = m.canonical_key
where c.page_key is null;

-- Step 2: Merge legacy values into canonical ONLY when canonical is NULL/empty.
-- This is deterministic and will never overwrite populated canonical fields.
update public.cms_page_content c
set
  body_en = coalesce(nullif(c.body_en, ''), l.body_en),
  body_es_draft = coalesce(nullif(c.body_es_draft, ''), l.body_es_draft),
  body_es_published = coalesce(nullif(c.body_es_published, ''), l.body_es_published),
  approved = (c.approved or coalesce(l.approved, false)),
  category = coalesce(c.category, l.category),
  sort = coalesce(c.sort, l.sort)
from tmp_home_key_map m
join public.cms_page_content l on l.page_key = m.legacy_key
where c.page_key = m.canonical_key;

commit;

-- Verification queries (run manually)
-- ----------------------------------
-- 1) Canonical keys present and non-empty (spot check):
-- select page_key, category, sort, approved,
--        length(coalesce(body_en, '')) as len_en,
--        length(coalesce(body_es_draft, '')) as len_es_draft,
--        length(coalesce(body_es_published, '')) as len_es_pub
-- from public.cms_page_content
-- where page_key in (select canonical_key from tmp_home_key_map)
-- order by page_key;
--
-- 2) Legacy keys still present (they should be):
-- select page_key, category, sort, approved
-- from public.cms_page_content
-- where page_key in (select legacy_key from tmp_home_key_map)
-- order by page_key;
--
-- 3) Canonical rows created by this migration (approx):
-- select count(*)
-- from public.cms_page_content c
-- where c.page_key in (select canonical_key from tmp_home_key_map)
--   and c.created_at >= now() - interval '1 hour';
--
-- 4) “Would we lose anything?” diff-style check:
-- select m.legacy_key, m.canonical_key,
--        (l.body_en is not null and nullif(l.body_en, '') is not null) as legacy_has_en,
--        (c.body_en is not null and nullif(c.body_en, '') is not null) as canon_has_en,
--        (l.body_es_published is not null and nullif(l.body_es_published, '') is not null) as legacy_has_es_pub,
--        (c.body_es_published is not null and nullif(c.body_es_published, '') is not null) as canon_has_es_pub
-- from tmp_home_key_map m
-- left join public.cms_page_content l on l.page_key = m.legacy_key
-- left join public.cms_page_content c on c.page_key = m.canonical_key
-- order by m.legacy_key;
