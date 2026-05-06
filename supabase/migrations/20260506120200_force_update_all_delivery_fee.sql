-- Force update all orders: set delivery_fee to -100 for every row
begin;
update public.orders
  set delivery_fee = -100;
commit;
