-- ================================================================
-- Atomic order creation transaction
-- Replaces 4 separate DB calls with a single function
-- ================================================================

CREATE OR REPLACE FUNCTION create_order_transaction(
  p_order_data JSONB,
  p_items JSONB,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_rows_affected INT;
BEGIN
  -- 1. Insert order
  INSERT INTO public.orders (
    user_id, status, subtotal, discount_amount, shipping_charge,
    gst_amount, total_amount, coupon_code, payment_method,
    payment_status, cod_charge, guest_name, guest_email,
    guest_phone, shipping_address, notes
  )
  VALUES (
    NULL,
    'pending',
    (p_order_data->>'subtotal')::NUMERIC,
    (p_order_data->>'discount_amount')::NUMERIC,
    (p_order_data->>'shipping_charge')::NUMERIC,
    (p_order_data->>'gst_amount')::NUMERIC,
    (p_order_data->>'total_amount')::NUMERIC,
    p_order_data->>'coupon_code',
    p_order_data->>'payment_method',
    CASE WHEN p_order_data->>'payment_method' = 'cod' THEN 'cod_pending' ELSE 'pending' END,
    (p_order_data->>'cod_charge')::NUMERIC,
    p_order_data->>'guest_name',
    p_order_data->>'guest_email',
    p_order_data->>'guest_phone',
    (p_order_data->'shipping_address')::JSONB,
    p_order_data->>'notes'
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- 2. Insert order items
  INSERT INTO public.order_items (
    order_id, product_id, variant_id, product_name,
    product_image, quantity, unit_price, total_price
  )
  SELECT
    v_order_id,
    (item->>'product_id')::UUID,
    CASE
      WHEN item->>'variant_id' IS NULL OR item->>'variant_id' = '' THEN NULL
      ELSE (item->>'variant_id')::UUID
    END,
    item->>'product_name',
    item->>'product_image',
    (item->>'quantity')::INT,
    (item->>'unit_price')::NUMERIC,
    (item->>'total_price')::NUMERIC
  FROM jsonb_array_elements(p_items) AS item;

  -- 3. Decrement stock for each item (with guard)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE public.products
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT,
        updated_at = NOW()
    WHERE id = (v_item->>'product_id')::UUID
      AND stock_quantity >= (v_item->>'quantity')::INT;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

    IF v_rows_affected = 0 THEN
      RAISE EXCEPTION 'Insufficient stock for product: %', v_item->>'product_name';
    END IF;
  END LOOP;

  -- 4. Increment coupon usage if applicable
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE code = UPPER(p_coupon_code);
  END IF;

  RETURN jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
END;
$$;
