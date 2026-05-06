-- Update existing orders: set delivery_fee to -100 where it's NULL
begin;
update public.orders
  set delivery_fee = -100
  where delivery_fee is null;
commit;
