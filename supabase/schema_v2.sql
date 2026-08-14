-- =============================================================
-- Fair Deal Logistics Gh — Schema v2 (additive migration)
-- Run AFTER schema.sql. Safe to re-run.
-- Adds: product attributes, wishlists, newsletter, settings,
-- activity logs, coupon/shipping columns on orders, shipment
-- numbers, review rating triggers, abandoned-cart recovery.
-- =============================================================

-- -----------------------------------------------------------------
-- 1. Product attributes (fragrance notes, ingredients, features…)
-- -----------------------------------------------------------------
alter table public.products
  add column if not exists attributes jsonb not null default '{}'::jsonb;

-- -----------------------------------------------------------------
-- 2. Orders: shipping method, payment method, coupon, recovery
-- -----------------------------------------------------------------
alter table public.orders
  add column if not exists shipping_method text not null default 'standard',
  add column if not exists payment_method text,
  add column if not exists coupon_code text,
  add column if not exists recovery_emails_sent int not null default 0,
  add column if not exists last_recovery_at timestamptz;

-- -----------------------------------------------------------------
-- 3. Shipments: human-friendly shipment number
-- -----------------------------------------------------------------
alter table public.shipments
  add column if not exists shipment_number text unique;

create or replace function public.set_shipment_number()
returns trigger language plpgsql as $$
begin
  if new.shipment_number is null or new.shipment_number = '' then
    new.shipment_number :=
      'SHP-' || to_char(now(), 'YYMMDD') || '-' ||
      lpad((floor(random()*10000))::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists set_shipment_number_trg on public.shipments;
create trigger set_shipment_number_trg
  before insert on public.shipments
  for each row execute function public.set_shipment_number();

-- -----------------------------------------------------------------
-- 4. Wishlists
-- -----------------------------------------------------------------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlists enable row level security;

drop policy if exists wishlists_owner on public.wishlists;
create policy wishlists_owner on public.wishlists
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------
-- 5. Newsletter subscribers
-- -----------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Public may subscribe (insert); only admins may read the list.
drop policy if exists newsletter_public_insert on public.newsletter_subscribers;
create policy newsletter_public_insert on public.newsletter_subscribers
  for insert with check (true);

drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select using (public.current_role_name() = 'admin');

-- -----------------------------------------------------------------
-- 6. Store settings (single row, admin managed)
-- -----------------------------------------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.settings (id, data) values (1, jsonb_build_object(
  'company_name', 'Fair Deal Logistics Gh',
  'support_email', 'hello@fairdealgh.com',
  'support_phone', '+233 30 000 0000',
  'address', 'Accra, Ghana',
  'currency', 'GHS',
  'tax_rate_percent', 0,
  'free_shipping_threshold', 500
)) on conflict (id) do nothing;

alter table public.settings enable row level security;

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select using (true);

drop policy if exists settings_admin_write on public.settings;
create policy settings_admin_write on public.settings
  for update using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');

-- -----------------------------------------------------------------
-- 7. Activity logs (staff audit trail)
-- -----------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists activity_staff_all on public.activity_logs;
create policy activity_staff_all on public.activity_logs
  for all using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

-- -----------------------------------------------------------------
-- 8. Keep product rating_avg / rating_count in sync with reviews
-- -----------------------------------------------------------------
create or replace function public.refresh_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set
    rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews r where r.product_id = pid), 0),
    rating_count = coalesce((select count(*) from public.reviews r where r.product_id = pid), 0)
  where p.id = pid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_rating_ins on public.reviews;
create trigger refresh_rating_ins after insert on public.reviews
  for each row execute function public.refresh_product_rating();

drop trigger if exists refresh_rating_del on public.reviews;
create trigger refresh_rating_del after delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- -----------------------------------------------------------------
-- 9. Seed: sample attributes + a demo coupon
-- -----------------------------------------------------------------
update public.products set attributes = jsonb_build_object(
  'fragrance_notes', 'Top: bergamot, saffron · Heart: Turkish rose, oud · Base: amber, musk',
  'features', jsonb_build_array('Long-lasting 8–12h wear', 'Unisex composition', '100ml flacon')
) where slug = 'golden-oud-100ml' and attributes = '{}'::jsonb;

update public.products set attributes = jsonb_build_object(
  'ingredients', 'Aqua, Glycerin, Butyrospermum Parkii (Shea) Butter, Cocos Nucifera Oil, Tocopherol',
  'features', jsonb_build_array('Raw Ghanaian shea butter', '24h hydration', 'Paraben-free')
) where slug = 'shea-glow-body-lotion' and attributes = '{}'::jsonb;

insert into public.coupons (code, description, percent_off, min_subtotal, is_active)
values ('WELCOME10', '10% off your first order', 10, 0, true)
on conflict (code) do nothing;

-- -----------------------------------------------------------------
-- 10. Wholesale / B2B profile fields
-- -----------------------------------------------------------------
alter table public.profiles
  add column if not exists business_name text,
  add column if not exists tax_id text,
  add column if not exists customer_type text not null default 'retail';

alter table public.orders
  add column if not exists order_type text not null default 'retail',
  add column if not exists payment_terms text,
  add column if not exists business_name text,
  add column if not exists tax_id text;

-- -----------------------------------------------------------------
-- 11. Wholesale applications
-- -----------------------------------------------------------------
create table if not exists public.wholesale_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  business_name text not null,
  contact_name text not null,
  email citext not null,
  phone text not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.wholesale_applications enable row level security;

drop policy if exists wholesale_app_insert on public.wholesale_applications;
create policy wholesale_app_insert on public.wholesale_applications
  for insert with check (true);

drop policy if exists wholesale_app_staff on public.wholesale_applications;
create policy wholesale_app_staff on public.wholesale_applications
  for all using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

-- -----------------------------------------------------------------
-- 12. Notification log (email + WhatsApp)
-- -----------------------------------------------------------------
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  template text not null,
  recipient text not null,
  order_id uuid references public.orders(id) on delete set null,
  status text not null default 'queued',
  payload jsonb,
  error text,
  created_at timestamptz not null default now()
);

alter table public.notification_log enable row level security;

drop policy if exists notification_staff on public.notification_log;
create policy notification_staff on public.notification_log
  for all using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

-- =============================================================
-- End of schema v2
-- =============================================================
