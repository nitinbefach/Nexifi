-- Migration 002: Replace Razorpay with PhonePe Business
-- Run this in Supabase SQL Editor

-- Rename Razorpay columns to PhonePe
ALTER TABLE public.orders RENAME COLUMN razorpay_order_id TO phonepe_transaction_id;
ALTER TABLE public.orders RENAME COLUMN razorpay_payment_id TO phonepe_payment_id;
ALTER TABLE public.orders DROP COLUMN IF EXISTS razorpay_signature;

-- RPC function: decrement product stock atomically
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id AND stock_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function: increment coupon usage atomically
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = p_coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
