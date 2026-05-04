-- Add fields needed to store Yalidine geo + shipment info.
-- Run this in Supabase SQL editor.

alter table public.orders
  add column if not exists wilaya_id integer,
  add column if not exists commune_id integer,
  add column if not exists stopdesk_id integer,
  add column if not exists stopdesk_name text,
  add column if not exists address text,
  add column if not exists delivery_fee integer,
  add column if not exists total_price integer,
  add column if not exists yalidine_parcel_id text,
  add column if not exists yalidine_tracking text,
  add column if not exists yalidine_last_error text,
  add column if not exists yalidine_created_at timestamptz;

-- Optional: index for tracking lookups
create index if not exists orders_yalidine_parcel_id_idx on public.orders (yalidine_parcel_id);
