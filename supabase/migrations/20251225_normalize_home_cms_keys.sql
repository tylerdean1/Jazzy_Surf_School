-- Normalize legacy Home CMS keys to the canonical dot-path keys currently used by the Home page.
--
-- Snapshot shows duplicates like:
--   - home.heroTitle            vs home.hero.title
--   - home.bookNow              vs home.hero.primaryAction
--   - home.lessonsTitle         vs home.cards.lessons.title
--
-- This migration merges legacy values into canonical rows when canonical is blank,
-- then removes the legacy rows (or renames them if canonical is missing).

begin;

-- home.heroTitle -> home.hero.title
with legacy as (
  select * from public.cms_page_content where page_key = 'home.heroTitle'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.hero.title';

update public.cms_page_content
set page_key = 'home.hero.title'
where page_key = 'home.heroTitle'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.hero.title');

delete from public.cms_page_content
where page_key = 'home.heroTitle'
  and exists (select 1 from public.cms_page_content where page_key = 'home.hero.title');

-- home.heroSubtitle -> home.hero.subtitle
with legacy as (
  select * from public.cms_page_content where page_key = 'home.heroSubtitle'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.hero.subtitle';

update public.cms_page_content
set page_key = 'home.hero.subtitle'
where page_key = 'home.heroSubtitle'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.hero.subtitle');

delete from public.cms_page_content
where page_key = 'home.heroSubtitle'
  and exists (select 1 from public.cms_page_content where page_key = 'home.hero.subtitle');

-- home.bookNow -> home.hero.primaryAction
with legacy as (
  select * from public.cms_page_content where page_key = 'home.bookNow'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.hero.primaryAction';

update public.cms_page_content
set page_key = 'home.hero.primaryAction'
where page_key = 'home.bookNow'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.hero.primaryAction');

delete from public.cms_page_content
where page_key = 'home.bookNow'
  and exists (select 1 from public.cms_page_content where page_key = 'home.hero.primaryAction');

-- home.learnMore -> home.hero.secondaryAction
with legacy as (
  select * from public.cms_page_content where page_key = 'home.learnMore'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.hero.secondaryAction';

update public.cms_page_content
set page_key = 'home.hero.secondaryAction'
where page_key = 'home.learnMore'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.hero.secondaryAction');

delete from public.cms_page_content
where page_key = 'home.learnMore'
  and exists (select 1 from public.cms_page_content where page_key = 'home.hero.secondaryAction');

-- home.lessonsTitle -> home.cards.lessons.title
with legacy as (
  select * from public.cms_page_content where page_key = 'home.lessonsTitle'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.cards.lessons.title';

update public.cms_page_content
set page_key = 'home.cards.lessons.title'
where page_key = 'home.lessonsTitle'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.cards.lessons.title');

delete from public.cms_page_content
where page_key = 'home.lessonsTitle'
  and exists (select 1 from public.cms_page_content where page_key = 'home.cards.lessons.title');

-- home.lessonsDescription -> home.cards.lessons.description
with legacy as (
  select * from public.cms_page_content where page_key = 'home.lessonsDescription'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.cards.lessons.description';

update public.cms_page_content
set page_key = 'home.cards.lessons.description'
where page_key = 'home.lessonsDescription'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.cards.lessons.description');

delete from public.cms_page_content
where page_key = 'home.lessonsDescription'
  and exists (select 1 from public.cms_page_content where page_key = 'home.cards.lessons.description');

-- home.galleryTitle -> home.cards.gallery.title
with legacy as (
  select * from public.cms_page_content where page_key = 'home.galleryTitle'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.cards.gallery.title';

update public.cms_page_content
set page_key = 'home.cards.gallery.title'
where page_key = 'home.galleryTitle'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.cards.gallery.title');

delete from public.cms_page_content
where page_key = 'home.galleryTitle'
  and exists (select 1 from public.cms_page_content where page_key = 'home.cards.gallery.title');

-- home.galleryDescription -> home.cards.gallery.description
with legacy as (
  select * from public.cms_page_content where page_key = 'home.galleryDescription'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.cards.gallery.description';

update public.cms_page_content
set page_key = 'home.cards.gallery.description'
where page_key = 'home.galleryDescription'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.cards.gallery.description');

delete from public.cms_page_content
where page_key = 'home.galleryDescription'
  and exists (select 1 from public.cms_page_content where page_key = 'home.cards.gallery.description');

-- home.teamTitle -> home.cards.team.title
with legacy as (
  select * from public.cms_page_content where page_key = 'home.teamTitle'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.cards.team.title';

update public.cms_page_content
set page_key = 'home.cards.team.title'
where page_key = 'home.teamTitle'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.cards.team.title');

delete from public.cms_page_content
where page_key = 'home.teamTitle'
  and exists (select 1 from public.cms_page_content where page_key = 'home.cards.team.title');

-- home.teamDescription -> home.cards.team.description
with legacy as (
  select * from public.cms_page_content where page_key = 'home.teamDescription'
)
update public.cms_page_content canon
set
  body_en = coalesce(nullif(canon.body_en, ''), legacy.body_en),
  body_es_draft = coalesce(nullif(canon.body_es_draft, ''), legacy.body_es_draft),
  body_es_published = coalesce(nullif(canon.body_es_published, ''), legacy.body_es_published),
  approved = (canon.approved or legacy.approved)
from legacy
where canon.page_key = 'home.cards.team.description';

update public.cms_page_content
set page_key = 'home.cards.team.description'
where page_key = 'home.teamDescription'
  and not exists (select 1 from public.cms_page_content where page_key = 'home.cards.team.description');

delete from public.cms_page_content
where page_key = 'home.teamDescription'
  and exists (select 1 from public.cms_page_content where page_key = 'home.cards.team.description');

commit;
