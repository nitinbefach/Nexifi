-- ================================================================
-- NEXIFI E-Commerce Store — Complete Database Schema
-- 20 Tables + Indexes + Triggers + Functions + RLS Policies
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- TABLE 1: PROFILES (extends Supabase auth.users)
-- ================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- TABLE 2: CATEGORIES
-- ================================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 3: PRODUCTS
-- ================================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES public.categories(id),
  original_price NUMERIC(10,2) NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  discount_percent INT GENERATED ALWAYS AS (
    CASE WHEN original_price > 0
      THEN ROUND(((original_price - selling_price) / original_price) * 100)
      ELSE 0
    END
  ) STORED,
  sku TEXT UNIQUE,
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  avg_rating NUMERIC(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_search ON public.products
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;

-- ================================================================
-- TABLE 4: PRODUCT IMAGES
-- ================================================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- ================================================================
-- TABLE 5: PRODUCT VARIANTS
-- ================================================================
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  variant_value TEXT NOT NULL,
  price_adjustment NUMERIC(10,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  sku TEXT
);

-- ================================================================
-- TABLE 6: ADDRESSES
-- ================================================================
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 7: CART ITEMS
-- ================================================================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- ================================================================
-- TABLE 8: WISHLISTS
-- ================================================================
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ================================================================
-- TABLE 9: ORDERS
-- ================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending','confirmed','processing','shipped',
    'out_for_delivery','delivered','cancelled','returned'
  )),
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  shipping_charge NUMERIC(10,2) DEFAULT 0,
  gst_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  payment_method TEXT DEFAULT 'online' CHECK (
    payment_method IN ('online', 'cod')
  ),
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending','paid','failed','refunded','cod_pending','cod_collected')
  ),
  cod_charge NUMERIC(10,2) DEFAULT 0,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  -- Guest checkout fields (no customer auth required)
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate order number
CREATE SEQUENCE order_number_seq START 1;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
    LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ================================================================
-- TABLE 10: ORDER ITEMS
-- ================================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- ================================================================
-- TABLE 11: REVIEWS
-- ================================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id)
);

-- Auto-update product avg_rating when reviews change
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products SET
    avg_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews
                  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true),
    review_count = (SELECT COUNT(*) FROM public.reviews
                    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ================================================================
-- TABLE 12: COUPONS
-- ================================================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 13: BANNERS (hero slider)
-- ================================================================
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 14: BULK UPLOADS (track Excel import jobs)
-- ================================================================
CREATE TABLE public.bulk_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  total_rows INT NOT NULL,
  success_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (
    status IN ('processing', 'completed', 'failed')
  ),
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 15: INVOICES (GST tax invoices)
-- ================================================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  gstin TEXT,
  customer_gstin TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  cgst_amount NUMERIC(10,2) DEFAULT 0,
  sgst_amount NUMERIC(10,2) DEFAULT 0,
  igst_amount NUMERIC(10,2) DEFAULT 0,
  total_tax NUMERIC(10,2) DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE invoice_number_seq START 1;

-- ================================================================
-- TABLE 16: RETURN REQUESTS
-- ================================================================
CREATE TABLE public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  user_id UUID REFERENCES auth.users(id),
  order_item_id UUID REFERENCES public.order_items(id),
  reason TEXT NOT NULL CHECK (reason IN (
    'defective','wrong_item','not_as_described',
    'size_issue','changed_mind','other'
  )),
  description TEXT,
  images TEXT[],
  status TEXT DEFAULT 'requested' CHECK (status IN (
    'requested','approved','rejected',
    'pickup_scheduled','received','refunded'
  )),
  admin_notes TEXT,
  refund_amount NUMERIC(10,2),
  razorpay_refund_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 17: SHIPMENTS (Shiprocket integration)
-- ================================================================
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  awb_number TEXT,
  courier_name TEXT,
  tracking_url TEXT,
  label_url TEXT,
  estimated_delivery DATE,
  weight_kg NUMERIC(5,2),
  status TEXT DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 18: SERVICEABLE PINCODES (delivery check cache)
-- ================================================================
CREATE TABLE public.serviceable_pincodes (
  pincode TEXT PRIMARY KEY,
  city TEXT,
  state TEXT,
  cod_available BOOLEAN DEFAULT true,
  prepaid_available BOOLEAN DEFAULT true,
  estimated_days INT,
  last_checked TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 19: NOTIFICATION LOG
-- ================================================================
CREATE TABLE public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES public.orders(id),
  channel TEXT CHECK (channel IN ('email', 'sms', 'whatsapp')),
  type TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 20: STORE SETTINGS (configurable store-wide settings)
-- ================================================================
CREATE TABLE public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.store_settings (key, value) VALUES
  ('store_name', '"NEXIFI"'),
  ('store_tagline', '"Next is Now"'),
  ('store_gstin', '"27XXXXX1234X1Z5"'),
  ('store_address', '{"line1":"Shop No 1","city":"Mumbai","state":"Maharashtra","pincode":"400001"}'),
  ('cod_charge', '49'),
  ('free_shipping_threshold', '499'),
  ('gst_percent', '18'),
  ('return_window_days', '7'),
  ('low_stock_threshold', '5'),
  ('whatsapp_number', '"91XXXXXXXXXX"'),
  ('social_links', '{"instagram":"","facebook":"","twitter":""}');

-- ================================================================
-- ROW LEVEL SECURITY (all tables)
-- ================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serviceable_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PUBLIC READ POLICIES (no login needed)
-- ================================================================
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view product variants" ON public.product_variants
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can view active banners" ON public.banners
  FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can check pincodes" ON public.serviceable_pincodes
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read store settings" ON public.store_settings
  FOR SELECT USING (true);

-- ================================================================
-- AUTHENTICATED USER POLICIES (own data only)
-- ================================================================
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wishlist" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );
CREATE POLICY "Users submit reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own returns" ON public.return_requests
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );
CREATE POLICY "Users view own shipments" ON public.shipments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );
CREATE POLICY "Users view own notifications" ON public.notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- ================================================================
-- ADMIN POLICIES (full access on all tables)
-- ================================================================
CREATE POLICY "Admin full products" ON public.products FOR ALL USING (is_admin());
CREATE POLICY "Admin full categories" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "Admin full orders" ON public.orders FOR ALL USING (is_admin());
CREATE POLICY "Admin full order_items" ON public.order_items FOR ALL USING (is_admin());
CREATE POLICY "Admin full reviews" ON public.reviews FOR ALL USING (is_admin());
CREATE POLICY "Admin full coupons" ON public.coupons FOR ALL USING (is_admin());
CREATE POLICY "Admin full banners" ON public.banners FOR ALL USING (is_admin());
CREATE POLICY "Admin full images" ON public.product_images FOR ALL USING (is_admin());
CREATE POLICY "Admin full variants" ON public.product_variants FOR ALL USING (is_admin());
CREATE POLICY "Admin full bulk_uploads" ON public.bulk_uploads FOR ALL USING (is_admin());
CREATE POLICY "Admin full invoices" ON public.invoices FOR ALL USING (is_admin());
CREATE POLICY "Admin full returns" ON public.return_requests FOR ALL USING (is_admin());
CREATE POLICY "Admin full shipments" ON public.shipments FOR ALL USING (is_admin());
CREATE POLICY "Admin full pincodes" ON public.serviceable_pincodes FOR ALL USING (is_admin());
CREATE POLICY "Admin full notifications" ON public.notification_log FOR ALL USING (is_admin());
CREATE POLICY "Admin full settings" ON public.store_settings FOR ALL USING (is_admin());
