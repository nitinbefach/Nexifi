-- Dashboard helper: get total revenue from all orders
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(total_amount), 0) FROM public.orders;
$$ LANGUAGE sql SECURITY DEFINER;
