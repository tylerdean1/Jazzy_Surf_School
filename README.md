# Jazmine Dean Surf School

A bilingual (EN/ES) surf lesson booking site built with Next.js App Router, TypeScript, and MUI. Bookings are **frontend-only**; an admin follows up manually via phone/email.

## Tech
- Next.js (App Router) + TypeScript + MUI
- i18n via `next-intl` with `/en` and `/es` locales
- Deploy on Vercel (no external DB/payment services required)

## Getting Started

1. Install deps:

```cmd
npm install
```

2. Run dev server:

```cmd
npm run dev
```

## Booking Flow (current)
- User selects preferred date/time blocks and lesson type from frontend-only options.
- Contact details are collected and sent to a stub `/api/notify` endpoint.
- Admin receives the payload (console/logging now) and will confirm slots and payment offline.

### Notification plan
- `/api/notify` and `lib/notifications.ts` are ready to plug in an email/SMS provider (e.g., SendGrid + Twilio).
- When ready, send the payload to the admin email/phone contained in the request and surface errors to the UI.

## Notes
- Replace social URLs and site URL in `[locale]/layout.tsx` JSON-LD
- Admin dashboard is UI-only; wire to data sources as a later iteration
- Gallery uses external images; replace with a storage source later

## Deploy
- On Vercel, set the project to use `npm run build`
- No third-party secrets are required for the current frontend-only flow
