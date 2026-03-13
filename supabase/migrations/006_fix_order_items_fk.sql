-- Fix: order_items.product_id and variant_id missing ON DELETE behavior
-- This was blocking product deletion when order history exists.
-- Using SET NULL so order history is preserved (product_name, product_image,
-- unit_price are stored directly on order_items as denormalized columns).

ALTER TABLE public.order_items
  DROP CONSTRAINT order_items_product_id_fkey,
  ADD CONSTRAINT order_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.order_items
  DROP CONSTRAINT order_items_variant_id_fkey,
  ADD CONSTRAINT order_items_variant_id_fkey
    FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;
