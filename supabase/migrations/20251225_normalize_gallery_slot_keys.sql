-- Normalize legacy padded gallery slot keys (gallery.images.001) to non-padded (gallery.images.1)
-- Ordering is preserved via media_slots.sort; duplicates are resolved deterministically.

begin;

-- 1) Create any missing canonical (non-padded) keys when only padded exists.
with padded as (
  select
    id,
    slot_key,
    asset_id,
    sort,
    regexp_replace(slot_key, '^gallery\.images\.', '') as suffix
  from public.media_slots
  where slot_key like 'gallery.images.%'
    and regexp_replace(slot_key, '^gallery\.images\.', '') ~ '^0+[0-9]+$'
),
normalized as (
  select
    p.id as padded_id,
    p.slot_key as padded_key,
    p.asset_id as padded_asset_id,
    p.sort as padded_sort,
    ('gallery.images.' || (p.suffix::int)) as canonical_key
  from padded p
)
insert into public.media_slots (slot_key, asset_id, sort)
select
  n.canonical_key,
  n.padded_asset_id,
  n.padded_sort
from normalized n
left join public.media_slots canon on canon.slot_key = n.canonical_key
where canon.slot_key is null;

-- 2) Merge into canonical where both padded + canonical exist.
-- If canonical has no asset but padded does, copy asset over.
-- Preserve ordering by keeping the minimum sort.
with padded as (
  select
    slot_key,
    asset_id,
    sort,
    regexp_replace(slot_key, '^gallery\.images\.', '') as suffix
  from public.media_slots
  where slot_key like 'gallery.images.%'
    and regexp_replace(slot_key, '^gallery\.images\.', '') ~ '^0+[0-9]+$'
),
normalized as (
  select
    p.slot_key as padded_key,
    p.asset_id as padded_asset_id,
    p.sort as padded_sort,
    ('gallery.images.' || (p.suffix::int)) as canonical_key
  from padded p
)
update public.media_slots canon
set
  asset_id = case
    when canon.asset_id is null and n.padded_asset_id is not null then n.padded_asset_id
    else canon.asset_id
  end,
  sort = least(canon.sort, n.padded_sort)
from normalized n
where canon.slot_key = n.canonical_key;

-- 3) Delete all padded keys now that data is merged.
delete from public.media_slots
where slot_key like 'gallery.images.%'
  and regexp_replace(slot_key, '^gallery\.images\.', '') ~ '^0+[0-9]+$';

commit;
