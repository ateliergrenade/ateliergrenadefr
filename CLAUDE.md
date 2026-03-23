# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atelier Grenade is a full-stack workshop booking platform for an artisanal leather workshop. Built with Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgreSQL), and Stripe for payments. All UI text is in French.

## Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
```

No test runner is configured.

## Architecture

### Data Flow

Public booking flow:
1. Homepage displays ateliers via carousel (`AteliersList` → `AtelierCarousel` → `AtelierCard`)
2. User opens `AtelierDetailDialog` → selects a session → fills `ReservationForm`
3. `POST /api/checkout` creates/finds client in Supabase, creates reservation (status: `en_attente`), creates Stripe Checkout session
4. After payment, Stripe webhook (`/api/webhooks/stripe`) updates reservation to `confirmee` and decrements available places

Admin flow:
- `/admin/login` → hardcoded password auth stored in localStorage
- Protected admin pages manage ateliers (CRUD), sessions (scheduling), and reservations (viewing)
- API routes check `x-admin-auth` header via `lib/auth.ts`

### Key Directories

- `/app` — Next.js App Router pages and API routes
- `/app/api` — REST API routes (ateliers CRUD, sessions, checkout, webhooks, admin endpoints)
- `/components` — React components; `/components/ui/` contains shadcn/ui primitives
- `/components/admin/` — Admin-specific components (AtelierForm, SessionManager, ImageUploader)
- `/lib` — Supabase clients (browser, server, admin), Stripe client, Zod validation schemas, auth helpers
- `/types` — TypeScript types including `database.types.ts` (auto-generated from Supabase)
- `/supabase/migrations/` — SQL migration files

### Database (Supabase)

Five core tables: `ateliers`, `atelier_images`, `sessions_ateliers`, `clients`, `reservations`. Ateliers sync with Stripe products/prices via `stripe_product_id` and `stripe_price_id` fields.

Three Supabase client variants:
- `lib/supabase.ts` — browser client (public anon key)
- `lib/supabase/server.ts` — server client with cookie-based auth
- `lib/supabase/admin.ts` — service role client for admin operations

### Styling

Tailwind CSS v4 with CSS custom properties. Color theme: pomegranate green (`#2d5a3d`), pomegranate red (`#c8102e`), cream (`#f8f5f2`), dark (`#2c2c2c`). Fonts: Playfair Display (headings) and Crimson Text (body).

### Validation

Zod schemas in `lib/validations.ts` (atelier CRUD) and `lib/validations-reservation.ts` (reservations) are used both client-side (with react-hook-form) and server-side in API routes.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_URL` (base URL, e.g., `http://localhost:3000`)

## Stripe Integration

Stripe product descriptions are truncated to 250 characters (API limit). Webhook signature verification is required. Test card: `4242 4242 4242 4242`.
