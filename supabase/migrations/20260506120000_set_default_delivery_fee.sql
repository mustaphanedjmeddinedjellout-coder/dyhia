-- Set default delivery_fee to -100 for new orders
alter table public.orders
  alter column delivery_fee set default -100;
