# CMS content migration report

## Canonical CMS key scheme
- **UI/Chrome strings:** `ui.*`
- **Page content strings:** `page.<page_key>.*`
- **Repeaters:** numbered keys, e.g. `page.faq.items.0.question`, `page.lessons.beginner.includes.0`.

## Message JSON keys moved → CMS keys
### common
- `common.brandName` → `ui.brandName`
- `common.loading` → `ui.loading`
- `common.logoAlt` → `ui.nav.logoAlt`

### navigation
- `navigation.home` → `ui.nav.home`
- `navigation.lessons` → `ui.nav.lessons`
- `navigation.schedule` → `ui.nav.schedule`
- `navigation.gallery` → `ui.nav.gallery`
- `navigation.about` → `ui.nav.about`
- `navigation.faq` → `ui.nav.faq`
- `navigation.contact` → `ui.nav.contact`

### home
- `home.heroTitle` → `page.home.hero.title`
- `home.heroSubtitle` → `page.home.hero.subtitle`
- `home.bookNow` → `page.home.hero.primaryAction`
- `home.learnMore` → `page.home.hero.secondaryAction`
- `home.aboutPreview` → `page.home.aboutPreview`
- `home.lessonsTitle` → `page.home.cards.lessons.title`
- `home.lessonsDescription` → `page.home.cards.lessons.description`
- `home.galleryTitle` → `page.home.cards.gallery.title`
- `home.galleryDescription` → `page.home.cards.gallery.description`
- `home.teamTitle` → `page.home.cards.team.title`
- `home.teamDescription` → `page.home.cards.team.description`

### lessons
- `lessons.title` → `page.lessons.title`
- `lessons.subtitle` → `page.lessons.subtitle`
- `lessons.beginner.*` → `page.lessons.beginner.*`
- `lessons.intermediate.*` → `page.lessons.intermediate.*`
- `lessons.advanced.*` → `page.lessons.advanced.*`

### booking
- `booking.title` → `page.book.title`
- `booking.requestReceived` → `page.book.requestReceived`

### about
- `about.title` → `page.about_jaz.title`
- `about.subtitle` → `page.about_jaz.subtitle`
- `about.bio` → `page.about_jaz.bio`
- `about.achievements` → `page.about_jaz.achievements`
- `about.accolades[]` → `page.about_jaz.accolades.*`

### mission
- `mission.title` → `page.mission_statement.title`
- `mission.subtitle` → `page.mission_statement.subtitle`
- `mission.lead` → `page.mission_statement.lead`
- `mission.body1` → `page.mission_statement.body1`
- `mission.body2` → `page.mission_statement.body2`
- `mission.conclusion` → `page.mission_statement.conclusion`

### faq
- `faq.title` → `page.faq.title`
- `faq.questions[].question` → `page.faq.items.*.question`
- `faq.questions[].answer` → `page.faq.items.*.answer`

### contact
- `contact.title` → `page.contact.title`
- `contact.subtitle` → `page.contact.subtitle`
- `contact.location` → `page.contact.location`
- `contact.followUs` → `page.contact.followUs`
- `contact.linksIntro` → `page.contact.linksIntro`
- `contact.logoAlt` → `page.contact.logoAlt`

### team
- `team.title` → `page.team.title`
- `team.subtitle` → `page.team.subtitle`
- `team.intro` → `page.team.intro`
- `team.moreDetailsTitle` → `page.team.moreDetailsTitle`
- `team.moreDetailsBody` → `page.team.moreDetailsBody`

## Additional CMS keys seeded from hard-coded TSX
### UI/Chrome
- `ui.nav.aria.openDrawer`
- `ui.nav.langToggle.en`
- `ui.nav.langToggle.es`
- `ui.team.card.*` (noPhotos, browseHint, prevAria, nextAria)
- `ui.lessons.card.*` (perPersonLabel, includesLabel, bookCta, contactPricingValue)
- `ui.booking.*` (steps, labels, summary, actions, help text)
- `ui.meta.title`, `ui.meta.description` (metadata)

### Page content
- `page.home.hero.primaryHref`
- `page.home.hero.secondaryHref`
- `page.home.cards.team.imageAlt`
- `page.lessons.pricesAlt`
- `page.book.requestReceived`
- `page.mission_statement.logoAlt`
- `page.team.jaz.name`
- `page.team.logoAlt`
- `page.gallery.title`, `page.gallery.subtitle`, `page.gallery.empty`, `page.gallery.images.count`
- `page.contact.instagramUrl`, `page.contact.instagramHandle`, `page.contact.phone`, `page.contact.email`

## Hard-coded literals removed from public TSX
- Hero, home cards, lessons cards, and page titles/descriptions migrated to CMS keys.
- FAQ questions/answers migrated to CMS repeaters.
- Contact links/handles moved to CMS keys.
- Gallery titles, subtitles, empty state moved to CMS keys.
- Booking UI labels/steps/summary strings moved to `ui.booking.*` CMS keys.
- Navigation labels and language toggle strings moved to `ui.nav.*` CMS keys.
- Metadata title/description now sourced from `ui.meta.*` CMS keys.

## Seed source
- `supabase/migrations/20250315000000_seed_cms_from_messages.sql`
  - Idempotent UPSERT into `public.cms_page_content`
  - Seeds EN + ES values for all keys above.
