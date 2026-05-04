create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  wilaya text not null,
  baladiya text,
  delivery_type text not null,
  color text not null,
  price integer not null,
  status text not null default 'new',
  created_at timestamptz default now(),
  wilaya_id integer,
  commune_id integer,
  stopdesk_id integer,
  stopdesk_name text,
  address text,
  delivery_fee integer,
  total_price integer,
  yalidine_parcel_id text,
  yalidine_tracking text,
  yalidine_last_error text,
  yalidine_created_at timestamptz
);

create index if not exists orders_yalidine_parcel_id_idx on public.orders (yalidine_parcel_id);

alter table public.orders enable row level security;

drop policy if exists public_insert_orders on public.orders;
create policy public_insert_orders
  on public.orders
  for insert
  with check (true);
