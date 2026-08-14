-- =============================================================
-- Fair Deal Logistics Gh — Postgres schema (Supabase)
-- Enterprise e-commerce + logistics
-- Idempotent: safe to re-run on a fresh Supabase project.
-- =============================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -----------------------------------------------------------------
-- 0. Enums
-- -----------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','paid','processing','packed','shipped','delivered','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','authorized','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shipment_status as enum ('created','picked_up','in_transit','out_for_delivery','delivered','failed','returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_movement_reason as enum ('purchase','sale','return','adjustment','transfer_in','transfer_out','damaged');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------
-- 1. Profiles (extends auth.users)
-- -----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  wholesale boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------
-- 2. Addresses
-- -----------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  region text not null,
  country text not null default 'Ghana',
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses(user_id);

-- -----------------------------------------------------------------
-- 3. Catalog: categories, brands, products, variants, media
-- -----------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  base_price numeric(12,2) not null check (base_price >= 0),
  wholesale_price numeric(12,2) check (wholesale_price is null or wholesale_price >= 0),
  currency text not null default 'GHS',
  tags text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_brand_idx on public.products(brand_id);
create index if not exists products_active_featured_idx on public.products(is_active, is_featured);
create index if not exists products_name_trgm on public.products using gin (name gin_trgm_ops);

-- Enable trigram search (guarded)
create extension if not exists pg_trgm;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  name text not null,                 -- e.g. "100ml", "Rose"
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  barcode text,
  weight_grams int,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists variants_product_idx on public.product_variants(product_id);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  position int not null default 0
);

create index if not exists media_product_idx on public.product_media(product_id);

-- -----------------------------------------------------------------
-- 4. Reviews
-- -----------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews(product_id);

-- -----------------------------------------------------------------
-- 5. Warehouses & inventory
-- -----------------------------------------------------------------
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  address text,
  city text,
  region text,
  country text not null default 'Ghana',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  reorder_level int not null default 10,
  updated_at timestamptz not null default now(),
  unique (variant_id, warehouse_id)
);

create index if not exists inventory_variant_idx on public.inventory(variant_id);
create index if not exists inventory_warehouse_idx on public.inventory(warehouse_id);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  delta int not null,                 -- positive or negative
  reason stock_movement_reason not null,
  reference text,                     -- e.g. order id, transfer id
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists movements_variant_idx on public.stock_movements(variant_id);
create index if not exists movements_warehouse_idx on public.stock_movements(warehouse_id);

-- -----------------------------------------------------------------
-- 6. Orders
-- -----------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  guest_email citext,
  guest_name text,
  guest_phone text,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  payment_provider text,
  payment_reference text,
  currency text not null default 'GHS',
  subtotal numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name_snapshot text not null,
  sku_snapshot text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- Auto-generate friendly order number: FDL-YYMMDD-XXXX
create or replace function public.set_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number :=
      'FDL-' || to_char(now(), 'YYMMDD') || '-' ||
      lpad((floor(random()*10000))::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists set_order_number_trg on public.orders;
create trigger set_order_number_trg
  before insert on public.orders
  for each row execute function public.set_order_number();

-- -----------------------------------------------------------------
-- 7. Shipments
-- -----------------------------------------------------------------
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  tracking_number text unique,
  carrier text,
  status shipment_status not null default 'created',
  driver_name text,
  driver_phone text,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_order_idx on public.shipments(order_id);
create index if not exists shipments_status_idx on public.shipments(status);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status shipment_status not null,
  location text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists shipment_events_shipment_idx on public.shipment_events(shipment_id);

-- -----------------------------------------------------------------
-- 8. Coupons (optional, simple)
-- -----------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  percent_off int check (percent_off between 1 and 100),
  amount_off numeric(12,2),
  min_subtotal numeric(12,2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true
);

-- -----------------------------------------------------------------
-- 9. Reporting views
-- -----------------------------------------------------------------
create or replace view public.v_low_stock as
  select
    i.id,
    p.name as product_name,
    pv.name as variant_name,
    pv.sku,
    w.name as warehouse_name,
    i.quantity,
    i.reorder_level
  from public.inventory i
  join public.product_variants pv on pv.id = i.variant_id
  join public.products p on p.id = pv.product_id
  join public.warehouses w on w.id = i.warehouse_id
  where i.quantity <= i.reorder_level;

create or replace view public.v_sales_by_day as
  select
    date_trunc('day', placed_at)::date as day,
    count(*) as orders,
    sum(total) as revenue
  from public.orders
  where status in ('paid','processing','packed','shipped','delivered')
    and placed_at is not null
  group by 1
  order by 1;

create or replace view public.v_top_products as
  select
    p.id,
    p.name,
    sum(oi.quantity) as units_sold,
    sum(oi.line_total) as revenue
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.products p on p.id = oi.product_id
  where o.status in ('paid','processing','packed','shipped','delivered')
  group by p.id, p.name
  order by revenue desc nulls last;

-- -----------------------------------------------------------------
-- 10. Helper: current user role
-- -----------------------------------------------------------------
create or replace function public.current_role_name()
returns user_role language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'customer'::user_role);
$$;

-- -----------------------------------------------------------------
-- 11. Row Level Security
-- -----------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.addresses        enable row level security;
alter table public.categories       enable row level security;
alter table public.brands           enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_media    enable row level security;
alter table public.reviews          enable row level security;
alter table public.warehouses       enable row level security;
alter table public.inventory        enable row level security;
alter table public.stock_movements  enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.shipments        enable row level security;
alter table public.shipment_events  enable row level security;
alter table public.coupons          enable row level security;

-- Profiles: users see/update their own row; admins see all
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id or public.current_role_name() = 'admin');

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id or public.current_role_name() = 'admin');

-- Addresses: owner-only, admin read
drop policy if exists addresses_owner on public.addresses;
create policy addresses_owner on public.addresses
  for all using (auth.uid() = user_id or public.current_role_name() = 'admin')
  with check (auth.uid() = user_id or public.current_role_name() = 'admin');

-- Catalog: public read; write admin only
drop policy if exists catalog_public_read_categories on public.categories;
create policy catalog_public_read_categories on public.categories for select using (true);
drop policy if exists catalog_admin_write_categories on public.categories;
create policy catalog_admin_write_categories on public.categories for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists catalog_public_read_brands on public.brands;
create policy catalog_public_read_brands on public.brands for select using (true);
drop policy if exists catalog_admin_write_brands on public.brands;
create policy catalog_admin_write_brands on public.brands for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists catalog_public_read_products on public.products;
create policy catalog_public_read_products on public.products for select using (is_active = true or public.current_role_name() in ('admin','staff'));
drop policy if exists catalog_admin_write_products on public.products;
create policy catalog_admin_write_products on public.products for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists catalog_public_read_variants on public.product_variants;
create policy catalog_public_read_variants on public.product_variants for select using (true);
drop policy if exists catalog_admin_write_variants on public.product_variants;
create policy catalog_admin_write_variants on public.product_variants for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists catalog_public_read_media on public.product_media;
create policy catalog_public_read_media on public.product_media for select using (true);
drop policy if exists catalog_admin_write_media on public.product_media;
create policy catalog_admin_write_media on public.product_media for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

-- Reviews: public read; users insert/update their own; admin manage
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select using (true);
drop policy if exists reviews_self_write on public.reviews;
create policy reviews_self_write on public.reviews for insert
  with check (auth.uid() = user_id);
drop policy if exists reviews_self_update on public.reviews;
create policy reviews_self_update on public.reviews for update
  using (auth.uid() = user_id or public.current_role_name() = 'admin');

-- Warehouses / inventory / movements: staff+admin only
drop policy if exists warehouses_staff on public.warehouses;
create policy warehouses_staff on public.warehouses for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists inventory_staff on public.inventory;
create policy inventory_staff on public.inventory for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists movements_staff on public.stock_movements;
create policy movements_staff on public.stock_movements for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

-- Orders: owner sees own; admin/staff see all; guest orders only accessible via service role
drop policy if exists orders_owner on public.orders;
create policy orders_owner on public.orders for select
  using (auth.uid() = user_id or public.current_role_name() in ('admin','staff'));
drop policy if exists orders_staff_write on public.orders;
create policy orders_staff_write on public.orders for update
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists order_items_scope on public.order_items;
create policy order_items_scope on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.current_role_name() in ('admin','staff'))
    )
  );

-- Shipments: owner (via order) and staff can see
drop policy if exists shipments_scope on public.shipments;
create policy shipments_scope on public.shipments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.current_role_name() in ('admin','staff'))
    )
  );
drop policy if exists shipments_staff_write on public.shipments;
create policy shipments_staff_write on public.shipments for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

drop policy if exists shipment_events_scope on public.shipment_events;
create policy shipment_events_scope on public.shipment_events for select
  using (
    exists (
      select 1 from public.shipments s
      join public.orders o on o.id = s.order_id
      where s.id = shipment_id
        and (o.user_id = auth.uid() or public.current_role_name() in ('admin','staff'))
    )
  );
drop policy if exists shipment_events_staff_write on public.shipment_events;
create policy shipment_events_staff_write on public.shipment_events for all
  using (public.current_role_name() in ('admin','staff'))
  with check (public.current_role_name() in ('admin','staff'));

-- Coupons: public can validate active ones (select), admin writes
drop policy if exists coupons_public_read on public.coupons;
create policy coupons_public_read on public.coupons for select using (is_active = true);
drop policy if exists coupons_admin_write on public.coupons;
create policy coupons_admin_write on public.coupons for all
  using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');

-- -----------------------------------------------------------------
-- 12. Storage bucket (run once)
-- -----------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('product-media','product-media', true)
  on conflict (id) do nothing;

-- -----------------------------------------------------------------
-- 13. Seed data (safe if re-run)
-- -----------------------------------------------------------------
insert into public.categories (slug, name, description, position) values
  ('perfumes','Perfumes','Long-lasting fragrances for every occasion.', 1),
  ('body-sprays','Body Sprays','Fresh, everyday scents.', 2),
  ('cosmetics','Cosmetics','Foundations, lipsticks, mascaras and more.', 3),
  ('body-essentials','Body Essentials','Lotions, oils, soaps and skincare.', 4)
  on conflict (slug) do nothing;

insert into public.brands (slug, name) values
  ('fair-deal','Fair Deal'),
  ('golden-scent','Golden Scent'),
  ('accra-glow','Accra Glow')
  on conflict (slug) do nothing;

insert into public.warehouses (code, name, city, region) values
  ('ACC-01','Accra Central Warehouse','Accra','Greater Accra'),
  ('KMA-01','Kumasi Depot','Kumasi','Ashanti')
  on conflict (code) do nothing;

-- Sample products
with c as (select id, slug from public.categories),
     b as (select id, slug from public.brands)
insert into public.products (slug, name, description, category_id, brand_id, base_price, wholesale_price, is_active, is_featured, tags)
select * from (values
  ('golden-oud-100ml','Golden Oud Eau de Parfum','A warm, luxurious oud fragrance with hints of amber and rose. Long-lasting on the skin.',
     (select id from c where slug='perfumes'), (select id from b where slug='golden-scent'), 320.00, 260.00, true, true,
     array['perfume','oud','unisex']),
  ('ocean-breeze-body-spray','Ocean Breeze Body Spray','Fresh aquatic body spray, perfect for daily wear.',
     (select id from c where slug='body-sprays'), (select id from b where slug='fair-deal'), 55.00, 42.00, true, true,
     array['body-spray','fresh']),
  ('velvet-matte-lipstick','Velvet Matte Lipstick','Highly pigmented matte lipstick that lasts up to 8 hours.',
     (select id from c where slug='cosmetics'), (select id from b where slug='accra-glow'), 45.00, 35.00, true, true,
     array['lipstick','matte']),
  ('shea-glow-body-lotion','Shea Glow Body Lotion 400ml','Deeply moisturising lotion with Ghanaian shea butter.',
     (select id from c where slug='body-essentials'), (select id from b where slug='fair-deal'), 65.00, 50.00, true, true,
     array['lotion','shea']),
  ('midnight-rose-edp','Midnight Rose EDP','Elegant floral rose composition with musky base.',
     (select id from c where slug='perfumes'), (select id from b where slug='golden-scent'), 285.00, 230.00, true, false,
     array['perfume','floral']),
  ('citrus-splash-body-spray','Citrus Splash Body Spray','Zesty citrus body spray for a bright morning lift.',
     (select id from c where slug='body-sprays'), (select id from b where slug='fair-deal'), 48.00, 38.00, true, false,
     array['body-spray','citrus'])
) as v(slug, name, description, category_id, brand_id, base_price, wholesale_price, is_active, is_featured, tags)
on conflict (slug) do nothing;

-- Default variants (one per product) if not present
insert into public.product_variants (product_id, sku, name, price, is_default)
select p.id, upper(replace(p.slug,'-','_')) || '-DEF', 'Standard', p.base_price, true
from public.products p
where not exists (select 1 from public.product_variants v where v.product_id = p.id);

-- Sample media (public unsplash placeholders; replace with Supabase storage URLs)
insert into public.product_media (product_id, url, alt, position)
select p.id,
  case p.slug
    when 'golden-oud-100ml'         then 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop'
    when 'ocean-breeze-body-spray'  then 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&auto=format&fit=crop'
    when 'velvet-matte-lipstick'    then 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&auto=format&fit=crop'
    when 'shea-glow-body-lotion'    then 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&auto=format&fit=crop'
    when 'midnight-rose-edp'        then 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&auto=format&fit=crop'
    when 'citrus-splash-body-spray' then 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1200&auto=format&fit=crop'
  end,
  p.name, 0
from public.products p
where not exists (select 1 from public.product_media m where m.product_id = p.id);

-- Seed inventory in Accra warehouse
insert into public.inventory (variant_id, warehouse_id, quantity, reorder_level)
select v.id, w.id, 120, 15
from public.product_variants v
cross join public.warehouses w
where w.code = 'ACC-01'
on conflict (variant_id, warehouse_id) do nothing;

-- =============================================================
-- End of schema
-- =============================================================
