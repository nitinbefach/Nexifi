-- ================================================================
-- NEXIFI Seed Data
-- Run this AFTER the migration (001_create_tables.sql)
-- ================================================================

-- ================================================================
-- CATEGORIES (8 categories)
-- ================================================================
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, sort_order) VALUES
  (gen_random_uuid(), 'Dash Cam', 'dash-cam', 'Car dash cameras for safety and recording', NULL, true, 1),
  (gen_random_uuid(), 'Smart Watch', 'smart-watch', 'Feature-packed smartwatches for everyday use', NULL, true, 2),
  (gen_random_uuid(), 'Trimmer', 'trimmer', 'Grooming trimmers for men and women', NULL, true, 3),
  (gen_random_uuid(), 'Earphones', 'earphones', 'Wired and wireless earphones for music lovers', NULL, true, 4),
  (gen_random_uuid(), 'Video Games', 'video-games', 'Gaming consoles, controllers and accessories', NULL, true, 5),
  (gen_random_uuid(), 'Toys', 'toys', 'Fun toys and games for all ages', NULL, true, 6),
  (gen_random_uuid(), 'Home Appliances', 'home-appliances', 'Smart home gadgets and appliances', NULL, true, 7),
  (gen_random_uuid(), 'Speakers', 'speakers', 'Portable and home speakers with great sound', NULL, true, 8);

-- ================================================================
-- SAMPLE PRODUCTS (10 products)
-- Using avyuktamobile CDN images for development
-- ================================================================

-- Get category IDs for foreign keys
DO $$
DECLARE
  cat_dashcam UUID;
  cat_smartwatch UUID;
  cat_trimmer UUID;
  cat_earphones UUID;
  cat_videogames UUID;
  cat_toys UUID;
  cat_homeappliances UUID;
  cat_speakers UUID;
  prod_id UUID;
BEGIN
  SELECT id INTO cat_dashcam FROM public.categories WHERE slug = 'dash-cam';
  SELECT id INTO cat_smartwatch FROM public.categories WHERE slug = 'smart-watch';
  SELECT id INTO cat_trimmer FROM public.categories WHERE slug = 'trimmer';
  SELECT id INTO cat_earphones FROM public.categories WHERE slug = 'earphones';
  SELECT id INTO cat_videogames FROM public.categories WHERE slug = 'video-games';
  SELECT id INTO cat_toys FROM public.categories WHERE slug = 'toys';
  SELECT id INTO cat_homeappliances FROM public.categories WHERE slug = 'home-appliances';
  SELECT id INTO cat_speakers FROM public.categories WHERE slug = 'speakers';

  -- Product 1: Dash Cam
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, '4K Dual Dash Cam with Night Vision', '4k-dual-dash-cam-night-vision',
    'High-resolution 4K front and 1080P rear dash cam with superior night vision, G-sensor, and loop recording. 170° wide angle lens with parking monitor.',
    5999, 2499, cat_dashcam, 50, 'NEXIFI-DC-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Dash+Cam', '4K Dual Dash Cam', true, 1);

  -- Product 2: Smart Watch
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'NEXIFI Pro Smart Watch with AMOLED Display', 'nexifi-pro-smart-watch-amoled',
    'Premium smartwatch with 1.96" AMOLED display, heart rate monitor, SpO2, 100+ sports modes, IP68 waterproof. 7-day battery life.',
    4999, 1999, cat_smartwatch, 100, 'NEXIFI-SW-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Smart+Watch', 'NEXIFI Pro Smart Watch', true, 1);

  -- Product 3: Trimmer
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'Professional Hair & Beard Trimmer', 'professional-hair-beard-trimmer',
    'All-in-one grooming kit with titanium blades, 20 length settings, 120 min runtime. USB-C charging, travel lock, waterproof IPX6.',
    2999, 1299, cat_trimmer, 75, 'NEXIFI-TR-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Trimmer', 'Professional Hair Trimmer', true, 1);

  -- Product 4: Wireless Earbuds
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'True Wireless Earbuds with ANC', 'true-wireless-earbuds-anc',
    'Active Noise Cancelling earbuds with 13mm drivers, 40dB ANC, transparency mode, 30hr total battery. IPX5 sweatproof.',
    3999, 1499, cat_earphones, 120, 'NEXIFI-EB-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Earbuds', 'True Wireless Earbuds', true, 1);

  -- Product 5: Gaming Controller
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'Wireless Gaming Controller for Mobile & PC', 'wireless-gaming-controller-mobile-pc',
    'Ergonomic wireless gamepad with hall effect triggers, turbo button, 6-axis gyroscope. Compatible with Android, iOS, PC, Switch.',
    2499, 999, cat_videogames, 60, 'NEXIFI-GC-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Controller', 'Wireless Gaming Controller', true, 1);

  -- Product 6: RC Car
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'High Speed RC Racing Car 1:16', 'high-speed-rc-racing-car-116',
    '2.4GHz remote control car with 40km/h top speed, 4WD all terrain, rechargeable battery. Great gift for kids and adults.',
    3499, 1799, cat_toys, 40, 'NEXIFI-TOY-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=RC+Car', 'RC Racing Car', true, 1);

  -- Product 7: Air Purifier
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'Smart Air Purifier with HEPA Filter', 'smart-air-purifier-hepa',
    'Room air purifier with H13 HEPA filter, covers 400 sq ft. App control, auto mode, sleep mode, air quality indicator.',
    7999, 3999, cat_homeappliances, 30, 'NEXIFI-AP-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Air+Purifier', 'Smart Air Purifier', true, 1);

  -- Product 8: Bluetooth Speaker
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'Portable Bluetooth Speaker 40W', 'portable-bluetooth-speaker-40w',
    '40W stereo sound with deep bass, IPX7 waterproof, 24hr playtime. TWS pairing, USB-C, built-in mic for calls.',
    4999, 2299, cat_speakers, 55, 'NEXIFI-SP-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Speaker', 'Portable Bluetooth Speaker', true, 1);

  -- Product 9: Neckband Earphones
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'Wireless Neckband with 60hr Battery', 'wireless-neckband-60hr-battery',
    'Lightweight neckband with 60-hour playback, fast charge (10 min = 20 hrs), dual EQ modes, magnetic earbuds, IPX5.',
    1999, 699, cat_earphones, 200, 'NEXIFI-NB-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Neckband', 'Wireless Neckband', true, 1);

  -- Product 10: Smart Watch (Budget)
  prod_id := gen_random_uuid();
  INSERT INTO public.products (id, name, slug, description, original_price, selling_price, category_id, stock_quantity, sku, is_active)
  VALUES (prod_id, 'Fitness Smart Band with SpO2', 'fitness-smart-band-spo2',
    'Affordable fitness tracker with SpO2, heart rate, sleep tracking, 14 sports modes. 1.47" color display, 10-day battery, IP68.',
    1999, 799, cat_smartwatch, 150, 'NEXIFI-SB-001', true);
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
  VALUES (prod_id, 'https://placehold.co/800x800/1a1a2e/F26B1D?text=Smart+Band', 'Fitness Smart Band', true, 1);

END $$;

-- ================================================================
-- BANNERS (3 hero banners)
-- ================================================================
INSERT INTO public.banners (title, image_url, mobile_image_url, link_url, is_active, sort_order) VALUES
  ('Premium Accessory Days', '/banners/banner-1-desktop.png', '/banners/banner-1.png', '/products', true, 1),
  ('Dominate the Game', '/banners/banner-2-desktop.png', '/banners/banner-2.png', '/products', true, 2),
  ('Power Up Your Life', '/banners/banner-3-desktop.png', '/banners/banner-3.png', '/products', true, 3);

-- ================================================================
-- STORE SETTINGS (update values already seeded by migration)
-- ================================================================
INSERT INTO public.store_settings (key, value) VALUES
  ('support_email', '"support@nexifi.in"'),
  ('support_phone', '"+91-9876543210"'),
  ('currency', '"INR"'),
  ('cod_max_amount', '5000')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ================================================================
-- NOTE: Admin user setup
-- 1. Create user via Supabase Auth dashboard (email/password)
-- 2. Then run: UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';
-- ================================================================
