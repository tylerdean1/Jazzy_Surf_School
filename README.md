# Jazmine Dean Surf School

A bilingual (EN/ES) surf lesson booking site built with Next.js App Router, TypeScript, MUI, Supabase, and Stripe.

## Tech
- Next.js (App Router) + TypeScript + MUI
- i18n via `next-intl` with `/en` and `/es` locales
- Supabase (Postgres + Auth + RLS + Storage)
- Stripe (PaymentIntents + Webhooks)
- Deploy on Vercel

## Getting Started

1. Copy env and fill values:

```cmd
copy .env.example .env.local
```

Set:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET` (from Stripe CLI or dashboard)

2. Install deps:

```cmd
npm install
```

3. Run dev server:

```cmd
npm run dev
```

4. Supabase
- Run migrations in `supabase/migrations` (via Supabase Studio or CLI)
- Confirm RLS policies and seed data exist

5. Stripe webhook (local)

```cmd
stripe listen --events payment_intent.succeeded,payment_intent.payment_failed --forward-to http://localhost:3000/api/stripe/webhook
```

Set `STRIPE_WEBHOOK_SECRET` from the output.

## Booking Flow (MVP)
- Fetch lesson types and open time slots via API routes
- User selects slot, lesson type, party size
- Booking Create API: holds slot, inserts booking, creates PaymentIntent, persists payment row, returns `clientSecret`
- Stripe Payment Element confirms payment; webhook marks booking confirmed and slot booked

## Notes
- Replace social URLs and site URL in `[locale]/layout.tsx` JSON-LD
- Admin dashboard is UI-only; wire to Supabase as next iteration
- Gallery uses external images; connect to Supabase Storage later

## Deploy
- On Vercel, add all env vars in Project Settings
- Ensure Build Command uses `next build` and Output is dynamic (no static export)
