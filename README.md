# Fair Deal Logistics Gh

Enterprise e-commerce and logistics platform for **Fair Deal Logistics Gh** — retail and wholesale of perfumes, body sprays, cosmetics and body essentials, with end-to-end warehouse, inventory and shipment management.

- **Stack:** Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Paystack · Vercel

---

## 1. What's inside

### Public storefront
- `/` — Homepage (hero, collections, categories, featured products, trust, newsletter)
- `/shop` — Catalog with category / brand / collection / price / sort filters and pagination
- `/product/[slug]` — Gallery, variants, reviews, wishlist, share, related + recently viewed, JSON-LD
- `/cart` — Cart with coupon codes
- `/checkout` — 5-step checkout (contact, address, delivery, payment, review) + Paystack
- `/checkout/success` — Server-side payment verification
- `/wholesale` — Partner landing + application
- `/wholesale/dashboard` · `/catalog` · `/checkout` — Approved B2B portal (MOQ, tax ID, net terms)
- `/account` — Dashboard, orders, wishlist, profile, password reset
- `/policies/*` — Shipping, returns, privacy, terms

### Admin (role-gated)
- `/admin` — KPIs, sparkline, low stock, quick actions
- `/admin/products` — CRUD + CSV import
- `/admin/orders` — Workflow, create shipment, print invoice
- `/admin/customers` · `/inventory` · `/warehouses` · `/shipments` · `/reports`
- `/admin/settings` — Company, tax, free-shipping threshold

### API
- `POST /api/checkout` — Server-side price verification, coupons, shipping methods, Paystack channels
- `POST /api/paystack/webhook` — HMAC-SHA512 webhook + payment emails
- `POST /api/coupon` — Validate discount codes
- `POST /api/admin/products/import` — CSV product import
- `GET /api/cron/abandoned-cart` — 1h / 24h / 48h recovery emails (Vercel Cron)

---

## 2. Getting started

```bash
npm install
cp .env.example .env.local
# fill in Supabase + Paystack values
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser + SSR) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only.** Used by `/api/checkout` and Paystack webhook |
| `NEXT_PUBLIC_SITE_URL` | Base URL of the deployment (used in metadata + Paystack callback) |
| `NEXT_PUBLIC_SITE_NAME` | Brand name |
| `NEXT_PUBLIC_CURRENCY` | Defaults to `GHS` |
| `PAYSTACK_SECRET_KEY` | **Server-only.** Paystack secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Optional (for future inline payment) |
| `RESEND_API_KEY` | Order confirmation / recovery emails |
| `RESEND_FROM_EMAIL` | From address for Resend |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp sender phone id |
| `CRON_SECRET` | Protects `/api/cron/abandoned-cart` |

Never commit `.env.local`.

---

## 3. Database setup

1. Create a fresh Supabase project.
2. Open the SQL editor and paste `supabase/schema.sql`. Run it.
3. Then run `supabase/schema_v2.sql` (wishlists, settings, wholesale fields, notifications).
3. This creates all tables, enums, RLS policies, a `product-media` storage bucket, seed categories/brands/warehouses, and sample products & inventory.
4. Create your first admin:
   1. Sign up via `/account/register` (email + password).
   2. In Supabase, open `profiles` table and set your row's `role` column to `admin`.
   3. Sign in at `/admin/login`.

RLS is enabled on every table; catalog reads are public, writes are `admin`/`staff` only, and each customer only sees their own orders/addresses. The `service_role` key is only used from server actions (`/api/*`) to bypass RLS for payments and webhooks.

---

## 4. Payments (Paystack — Ghana)

1. Grab test keys from the Paystack dashboard.
2. Add `PAYSTACK_SECRET_KEY` (and optional `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`) to your env.
3. In the Paystack dashboard set the webhook URL to:
   ```
   https://YOUR-DOMAIN/api/paystack/webhook
   ```
   The route verifies the HMAC-SHA512 signature using your secret key.
4. Test flow:
   - Add products to the cart → `/checkout` → submit → redirected to Paystack.
   - On completion Paystack redirects back to `/checkout/success?reference=…` and the server verifies the transaction (belt-and-braces alongside the webhook).

Flutterwave hooks are stubbed in `.env.example` — swap `lib/paystack.ts` for a Flutterwave equivalent if preferred.

---

## 5. Deploying to Vercel

1. Push to a Git repo and import into Vercel.
2. Add every env var from `.env.example` to Vercel (Project → Settings → Environment Variables).
3. In `NEXT_PUBLIC_SITE_URL`, use your production URL (e.g. `https://shop.fairdealgh.com`).
4. Redeploy.
5. Update the Paystack webhook URL to the production domain.

---

## 6. Design system

- **Colours:** Deep emerald (`brand-600 #0F5132`), warm gold (`gold-400 #C9A34E`), soft rose (`rose-200 #F4A9A8`), cream (`#FAF7F2`), ink (`#0F172A`).
- **Fonts:** Playfair Display (headlines) + Inter (body) via `next/font`.
- **Motion:** subtle only; `prefers-reduced-motion` respected globally in `globals.css`.
- **Accessibility:** semantic HTML, keyboard-focusable controls, aria labels on icon-only buttons, WCAG AA colour contrast.

Swap the palette in `tailwind.config.ts` when the client's brand guidelines are finalised.

---

## 7. Project structure

```
src/
├── app/
│   ├── (public storefront) page.tsx, shop/, product/[slug]/, cart/, checkout/, wholesale/
│   ├── account/   → login, register, dashboard, orders, profile
│   ├── admin/     → login, dashboard, products, orders, customers, inventory, warehouses, shipments, reports
│   └── api/       → checkout, paystack webhook
├── components/    → site chrome, shop, cart, admin, ui primitives
├── lib/           → supabase clients, cart store, paystack, format, constants, types
└── middleware.ts  → refreshes Supabase session, gates /account & /admin
supabase/schema.sql
```

---

## 8. Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint (Next.js core web vitals) |
| `npm run typecheck` | `tsc --noEmit` |

---

## 9. Roadmap ideas

- Reviews UI + moderation
- Coupon UI at checkout (schema is already in place)
- Multi-variant products with images per variant
- Push notifications for shipment status
- Ghana-post-code + Google Maps address autocomplete
- Server-side generated invoices (PDF)
- Wholesale-only pricing tier resolved from `profiles.wholesale`

---

Built with care for Ghanaian retailers and shoppers. 🇬🇭
