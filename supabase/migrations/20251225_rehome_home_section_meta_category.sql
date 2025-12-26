-- Phase 3.5: Re-home legacy Home section meta rows from draft category to canonical category.
--
-- Goal
-- ----
-- Move ONLY the section meta rows for Home that were previously saved under
-- `draft.page.home.sections` to the stable category `sections.page.home`.
--
-- Constraints
-- -----------
-- - Additive/reversible: no deletes, no key renames.
-- - Scoped: only page_key LIKE 'section.%.meta' AND exact legacy category.
-- - Safe to re-run.

begin;

-- Safety check: cms_page_content.page_key should be unique. Fail loudly if not.
do $$
begin
  if exists (
    select 1
    from public.cms_page_content
    where page_key like 'section.%.meta'
    group by page_key
    having count(*) > 1
  ) then
    raise exception 'Duplicate cms_page_content.page_key rows detected for section.*.meta keys.';
  end if;
end $$;

-- Re-home only legacy Home section meta rows.
update public.cms_page_content
set category = 'sections.page.home'
where category = 'draft.page.home.sections'
  and page_key like 'section.%.meta';

commit;

-- Verification queries (run manually)
-- ----------------------------------
-- 1) Count rows that WOULD be moved (run before migration):
-- select count(*) as legacy_meta_rows
-- from public.cms_page_content
-- where category = 'draft.page.home.sections'
--   and page_key like 'section.%.meta';
--
-- 2) Count rows moved (run after migration; should now be 0 legacy rows):
-- select count(*) as remaining_legacy_meta_rows
-- from public.cms_page_content
-- where category = 'draft.page.home.sections'
--   and page_key like 'section.%.meta';
--
-- 3) Confirm canonical category now holds those meta rows:
-- select count(*) as canonical_meta_rows
-- from public.cms_page_content
-- where category = 'sections.page.home'
--   and page_key like 'section.%.meta';
--
-- 4) Confirm no section.* keys outside meta scope were changed to canonical category:
-- select count(*) as non_meta_section_keys_in_canonical
-- from public.cms_page_content
-- where category = 'sections.page.home'
--   and page_key like 'section.%'
--   and page_key not like 'section.%.meta';
