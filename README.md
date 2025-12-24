# Jazmine Dean Surf School

A bilingual (EN/ES) surf lesson booking site built with Next.js App Router, TypeScript, and MUI.

Content (pages + media) is managed via Supabase (Postgres + Storage). Bookings are currently **frontend-only**; an admin follows up manually via phone/email.

## Tech
- Next.js (App Router) + TypeScript + MUI
- i18n via `next-intl` with `/en` and `/es` locales
- Supabase: Auth, Postgres, Storage
- Deploy on Vercel

## Local setup

### 1) Install dependencies

```cmd
npm install
```

### 2) Configure environment

Create `.env.local` in the project root:

```bash
# Public (browser) Supabase client
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-side admin routes (DO NOT expose this to the browser)
SUPABASE_SERVICE_ROLE_KEY=

# Optional: used by `npm run typegen` / `npm run snapshot`
SUPABASE_PROJECT_REF=
# or
DATABASE_URL=
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is required for admin API routes under `app/api/admin/*`.
- `SUPABASE_PROJECT_REF` can be derived automatically from `NEXT_PUBLIC_SUPABASE_URL`, but you can set it explicitly.

### 3) Run dev server

```cmd
npm run dev
```

## Booking flow (current)
- Booking API is intentionally disabled right now: `POST /api/bookings/create` returns `501`.
- The UI still collects booking intent; confirmation/payment is handled offline.

## CMS + admin

### Admin login
- Login page: `/adminlogin` (not linked from the public nav)
- Admin dashboard: `/admin`

How it works:
- The login page signs in with Supabase Auth (email/password).
- `POST /api/admin/login` verifies the user exists in the `admin_users` table.
- On success it sets an httpOnly cookie `admin=1` used to gate admin pages/routes.

### CMS content
- Public pages fetch content from Supabase via RPCs (example: `get_page_content`).
- Admin editing is available in the admin dashboard.

## Media system

### Storage buckets
- `Lesson_Photos` (public)
- `Private_Photos` (private)

### Database
Media metadata lives in `public.media_assets` (includes `bucket`, `path`, `title`, `category`, `asset_type`, `public`, and `sort`).

Stable frontend pointers live in `public.media_slots` as `slot_key -> asset_id`.

### Stable pointer system (`slot_key`)
- Use `slot_key` as a stable frontend pointer (e.g. `home.hero`).
- Use a prefix namespace for streams/galleries (e.g. `home.photo_stream.001`, `home.photo_stream.002`, …).
- Public lookup RPCs:
	- `get_public_media_asset_by_key(p_slot_key)`
	- `get_public_media_assets_by_prefix(p_prefix)` (ordered by `sort`)

### Admin media endpoints
- `GET /api/admin/media/assets` — list `media_assets`
- `POST /api/admin/media/assets` — upsert metadata (optionally assigns a `slot_key` via the `asset_key` field)
- `POST /api/admin/media/upload` — upload file(s) + insert rows
- `POST /api/admin/media/signed-url` — generate signed URLs (including for `Private_Photos`)

### Upload rules
- Filename collisions are handled automatically: `name.ext`, `name(1).ext`, `name(2).ext`, …
- Bulk uploads derive titles from the original filename.
- Optional pointer assignment:
	- Single upload: set `asset_key` (stored as `media_slots.slot_key`)
	- Bulk upload: set `asset_key_prefix` to auto-generate `prefix.001`, `prefix.002`, … (stored as `media_slots.slot_key`)

## Useful scripts

```cmd
npm run lint
npm run build

REM Regenerate Supabase types into lib/database.types.ts
npm run typegen

REM Regenerate backend.snapshot.md (+ backend.snapshot.sql if possible)
npm run snapshot

REM Convenience: typegen + snapshot
npm run fulldb
```

## Deployment (Vercel)
- Set environment variables from the `.env.local` list above.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser (server-only).

## Notes
- Backend reference snapshots live at `backend.snapshot.md` / `backend.snapshot.sql`.
- Storage/media is admin-controlled: public users only see what pages/components reference.
