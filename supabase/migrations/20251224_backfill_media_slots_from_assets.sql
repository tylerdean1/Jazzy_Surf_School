-- Backfill deterministic media slots from existing media_assets.
--
-- Goal: restore legacy site images under the new slot_key-based system.
-- Strategy: map known legacy filenames (from prior frontend hardcoded paths) -> slot_key.
-- Safety: does NOT overwrite existing slot_key assignments.

begin;

with desired(slot_key, filename, sort) as (
  values
    -- Navigation + page logos
    ('nav.logo', 'SSA_Orange_Logo.png', 0),
    ('site.favicon', 'SSA_Orange_Logo.png', 0),
    ('contact.logo', 'SSA_Orange_Logo.png', 0),
    ('mission.logo', 'SSA_Orange_Logo.png', 0),
    ('team.logo', 'SSA_BW_Logo.png', 0),

    -- Home
    ('home.hero', 'hero_shot.png', 0),
    ('home.cards.team.image', 'isasilver.png', 0),

    -- Lessons
    ('lessons.prices', 'prices.png', 0),

    -- Team (Jaz) photos carousel
    ('team.jaz.photos.001', 'isasilver.png', 1),
    ('team.jaz.photos.002', 'isa.png', 2),
    ('team.jaz.photos.003', 'sbsnap.png', 3),

    -- Home "Lessons" card carousel (legacy: /target_audiance/*)
    ('home.target_audience.001', '1.png', 1),
    ('home.target_audience.002', '2.png', 2),
    ('home.target_audience.003', '3.png', 3),
    ('home.target_audience.004', '4.png', 4),
    ('home.target_audience.005', '5.png', 5),
    ('home.target_audience.006', 'Dress.png', 6),
    ('home.target_audience.007', 'dress2.png', 7),
    ('home.target_audience.008', 'hang10.png', 8),
    ('home.target_audience.009', 'lbturn.png', 9),

    -- Home "Gallery" card carousel (legacy: /school_content/*)
    ('home.cards.gallery.images.001', 'IMG_3855.JPG', 1),
    ('home.cards.gallery.images.002', 'IMG_3856.JPG', 2),
    ('home.cards.gallery.images.003', 'IMG_2505.JPG', 3),
    ('home.cards.gallery.images.004', 'IMG_2505 2.JPG', 4),
    ('home.cards.gallery.images.005', 'IMG_3627.JPG', 5),
    ('home.cards.gallery.images.006', 'IMG_3629.JPG', 6),
    ('home.cards.gallery.images.007', 'IMG_3633.JPG', 7),
    ('home.cards.gallery.images.008', 'surfSchoolShot.png', 8)
),
resolved as (
  select
    d.slot_key,
    (
      select ma.id
      from public.media_assets ma
      where lower(ma.path) = lower(d.filename)
      order by ma.sort asc, ma.created_at asc
      limit 1
    ) as asset_id,
    d.sort::smallint as sort
  from desired d
)
insert into public.media_slots (slot_key, asset_id, sort)
select r.slot_key, r.asset_id, r.sort
from resolved r
where r.asset_id is not null
on conflict (slot_key) do nothing;

commit;

-- Optional verification:
-- select slot_key, asset_id, sort from public.media_slots where slot_key like 'home.%' or slot_key like 'nav.%' or slot_key like 'team.%' or slot_key like 'lessons.%' or slot_key like 'contact.%' or slot_key like 'mission.%' order by slot_key;
