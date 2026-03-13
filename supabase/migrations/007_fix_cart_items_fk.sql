-- Fix: cart_items.variant_id missing ON DELETE behavior
-- This blocks product_variants deletion when cart references exist.
-- Using SET NULL since clearing the variant reference is safe for cart items.

ALTER TABLE public.cart_items
  DROP CONSTRAINT cart_items_variant_id_fkey,
  ADD CONSTRAINT cart_items_variant_id_fkey
    FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;
