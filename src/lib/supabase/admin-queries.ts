import { supabaseAdmin } from "./admin";

// ============================================================
// STORE SETTINGS
// ============================================================

export type StoreSettingsValue = string | number | Record<string, string>;

export interface StoreSettingsMap {
  [key: string]: StoreSettingsValue;
}

export async function getStoreSettingsMap(): Promise<StoreSettingsMap> {
  const { data, error } = await supabaseAdmin
    .from("store_settings")
    .select("key, value");

  if (error || !data) return {};

  const map: StoreSettingsMap = {};
  for (const row of data) {
    map[row.key] = row.value;
  }
  return map;
}

export async function updateStoreSettings(
  settings: { key: string; value: unknown }[]
) {
  const errors: string[] = [];

  for (const { key, value } of settings) {
    const { error } = await supabaseAdmin
      .from("store_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) errors.push(`${key}: ${error.message}`);
  }

  return { error: errors.length > 0 ? errors.join("; ") : null };
}

const LOW_STOCK_THRESHOLD = 5;

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboardStats() {
  const [ordersRes, pendingRes, revenueRes, lowStockRes, recentOrdersRes] =
    await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabaseAdmin.rpc("get_total_revenue"),
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true })
        .lt("stock_quantity", LOW_STOCK_THRESHOLD)
        .eq("is_active", true),
      supabaseAdmin
        .from("orders")
        .select("id, order_number, guest_name, total_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    totalOrders: ordersRes.count ?? 0,
    pendingOrders: pendingRes.count ?? 0,
    totalRevenue: revenueRes.data ?? 0,
    lowStockProducts: lowStockRes.count ?? 0,
    recentOrders: recentOrdersRes.data ?? [],
  };
}

// ============================================================
// DASHBOARD CHARTS
// ============================================================

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function getDailyRevenue(days = 7): Promise<DailyRevenuePoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("total_amount, created_at")
    .gte("created_at", startDate.toISOString())
    .neq("status", "cancelled");

  if (error || !data) return [];

  // Aggregate by date
  const map = new Map<string, { revenue: number; orders: number }>();

  // Pre-fill all dates
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    map.set(key, { revenue: 0, orders: 0 });
  }

  for (const row of data) {
    const key = row.created_at.split("T")[0];
    const existing = map.get(key);
    if (existing) {
      existing.revenue += Number(row.total_amount);
      existing.orders += 1;
    }
  }

  return Array.from(map.entries()).map(([date, val]) => ({
    date,
    revenue: Math.round(val.revenue),
    orders: val.orders,
  }));
}

export interface OrderStatusCount {
  status: string;
  count: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#6366f1",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export async function getOrderStatusCounts(): Promise<OrderStatusCount[]> {
  const statuses = Object.keys(STATUS_COLORS);

  const results = await Promise.all(
    statuses.map((status) =>
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", status)
    )
  );

  return statuses
    .map((status, i) => ({
      status,
      count: results[i].count ?? 0,
      color: STATUS_COLORS[status],
    }))
    .filter((s) => s.count > 0);
}

// ============================================================
// PRODUCTS
// ============================================================

export async function getAllProductsForDropdown() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, name, category_id")
    .order("name", { ascending: true });

  return { products: data ?? [], error };
}

export async function getAdminProducts(
  page = 1,
  search = "",
  limit = 20
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from("products")
    .select("*, category:categories(id, name), images:product_images(id, image_url, is_primary)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count, error } = await query;
  return { products: data ?? [], total: count ?? 0, error };
}

export async function getAdminProductById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, category:categories(id, name), images:product_images(*), variants:product_variants(*)")
    .eq("id", id)
    .single();

  return { product: data, error };
}

export async function createProduct(productData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(productData)
    .select("id, slug")
    .single();

  return { product: data, error };
}

export async function updateProduct(id: string, productData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, slug")
    .single();

  return { product: data, error };
}

export interface BulkInsertResult {
  success: number;
  failed: number;
  errors: { row: number; messages: string[] }[];
  createdIds: string[];
}

export async function createProductsBatch(
  rows: {
    row: number;
    product: Record<string, unknown>;
    images: string[];
  }[]
): Promise<BulkInsertResult> {
  const result: BulkInsertResult = {
    success: 0,
    failed: 0,
    errors: [],
    createdIds: [],
  };

  for (const { row, product, images } of rows) {
    const { product: created, error } = await createProduct(product);

    if (error || !created) {
      result.failed++;
      result.errors.push({
        row,
        messages: [error?.message || "Unknown insert error"],
      });
      continue;
    }

    result.success++;
    result.createdIds.push(created.id);

    // Insert product images
    const validImages = images.filter((url) => url && url.trim() !== "");
    if (validImages.length > 0) {
      await supabaseAdmin.from("product_images").insert(
        validImages.map((url, i) => ({
          product_id: created.id,
          image_url: url.trim(),
          is_primary: i === 0,
          sort_order: i,
        }))
      );
    }
  }

  return result;
}

export async function deleteProduct(id: string) {
  // Delete images and variants first (cascade should handle this, but be safe)
  await supabaseAdmin.from("product_images").delete().eq("product_id", id);
  await supabaseAdmin.from("product_variants").delete().eq("product_id", id);
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  return { error };
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getAdminCategories() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!data) return { categories: [], error };

  // Get product counts per category
  const { data: counts } = await supabaseAdmin
    .from("products")
    .select("category_id")
    .eq("is_active", true);

  const countMap: Record<string, number> = {};
  counts?.forEach((p) => {
    if (p.category_id) {
      countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
    }
  });

  const categoriesWithCounts = data.map((cat) => ({
    ...cat,
    product_count: countMap[cat.id] || 0,
  }));

  return { categories: categoriesWithCounts, error };
}

export async function createCategory(categoryData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert(categoryData)
    .select()
    .single();

  return { category: data, error };
}

export async function updateCategory(id: string, categoryData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(categoryData)
    .eq("id", id)
    .select()
    .single();

  return { category: data, error };
}

export async function deleteCategory(id: string) {
  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================
// ORDERS
// ============================================================

export async function getAdminOrders(
  page = 1,
  status = "",
  limit = 20
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;
  return { orders: data ?? [], total: count ?? 0, error };
}

export async function getAdminOrderById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .single();

  return { order: data, error };
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { order: data, error };
}

// ============================================================
// CUSTOMERS (derived from guest checkout orders)
// ============================================================

export interface GuestCustomer {
  guest_email: string;
  guest_name: string;
  guest_phone: string;
  order_count: number;
  total_spent: number;
  first_order: string;
}

export async function getAdminCustomers() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("guest_name, guest_email, guest_phone, total_amount, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return { customers: [], error };

  // Aggregate by email
  const map = new Map<string, GuestCustomer>();

  for (const order of data) {
    const email = order.guest_email || "unknown";
    const existing = map.get(email);

    if (existing) {
      existing.order_count += 1;
      existing.total_spent += Number(order.total_amount);
      if (order.created_at < existing.first_order) {
        existing.first_order = order.created_at;
      }
    } else {
      map.set(email, {
        guest_email: email,
        guest_name: order.guest_name || "—",
        guest_phone: order.guest_phone || "—",
        order_count: 1,
        total_spent: Number(order.total_amount),
        first_order: order.created_at,
      });
    }
  }

  const customers = Array.from(map.values()).sort(
    (a, b) => b.total_spent - a.total_spent
  );

  return { customers, error: null };
}

// ============================================================
// COUPONS
// ============================================================

export async function getAdminCoupons() {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return { coupons: data ?? [], error };
}

export async function createCoupon(couponData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .insert(couponData)
    .select()
    .single();

  return { coupon: data, error };
}

export async function updateCoupon(id: string, updateData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return { coupon: data, error };
}

export async function deleteCoupon(id: string) {
  const { error } = await supabaseAdmin
    .from("coupons")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================
// BANNERS
// ============================================================

export async function getAdminBanners() {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  return { banners: data ?? [], error };
}

export async function createBanner(bannerData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .insert(bannerData)
    .select()
    .single();

  return { banner: data, error };
}

export async function updateBanner(id: string, updateData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return { banner: data, error };
}

export async function deleteBanner(id: string) {
  const { error } = await supabaseAdmin
    .from("banners")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================
// REVIEWS
// ============================================================

export async function getAdminReviews() {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false });

  return { reviews: data ?? [], error };
}

export async function updateReviewStatus(id: string, isApproved: boolean) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ is_approved: isApproved })
    .eq("id", id)
    .select()
    .single();

  return { review: data, error };
}

export async function deleteReview(id: string) {
  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================
// RETURN REQUESTS
// ============================================================

export async function getAdminReturns(status = "") {
  let query = supabaseAdmin
    .from("return_requests")
    .select("*, order:orders(order_number, guest_name, guest_email)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  return { returns: data ?? [], error };
}

export async function getAdminReturnById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("return_requests")
    .select("*, order:orders(order_number, guest_name, guest_email, guest_phone, shipping_address, items:order_items(*))")
    .eq("id", id)
    .single();

  return { returnRequest: data, error };
}

export async function updateReturnStatus(
  id: string,
  updateData: { status?: string; admin_notes?: string; refund_amount?: number }
) {
  const { data, error } = await supabaseAdmin
    .from("return_requests")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { returnRequest: data, error };
}

export async function deleteReturn(id: string) {
  const { error } = await supabaseAdmin
    .from("return_requests")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================
// SHIPMENTS
// ============================================================

export async function getAdminShipments() {
  const { data, error } = await supabaseAdmin
    .from("shipments")
    .select("*, order:orders(order_number, guest_name, status)")
    .order("created_at", { ascending: false });

  return { shipments: data ?? [], error };
}

export async function getShipmentByOrderId(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from("shipments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  return { shipment: data, error };
}

export async function createShipment(shipmentData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("shipments")
    .insert(shipmentData)
    .select()
    .single();

  return { shipment: data, error };
}

export async function updateShipment(id: string, updateData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("shipments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return { shipment: data, error };
}

export async function deleteShipment(id: string) {
  const { error } = await supabaseAdmin
    .from("shipments")
    .delete()
    .eq("id", id);

  return { error };
}

// ============================================================
// INVOICES
// ============================================================

export async function getAdminInvoices() {
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("*, order:orders(order_number, guest_name)")
    .order("created_at", { ascending: false });

  return { invoices: data ?? [], error };
}

export async function getInvoiceByOrderId(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  return { invoice: data, error };
}

export async function createInvoice(invoiceData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .insert(invoiceData)
    .select()
    .single();

  return { invoice: data, error };
}

// ============================================================
// NOTIFICATION LOG
// ============================================================

export async function getNotificationLog(channel = "") {
  let query = supabaseAdmin
    .from("notification_log")
    .select("*, order:orders(order_number)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (channel) {
    query = query.eq("channel", channel);
  }

  const { data, error } = await query;
  return { notifications: data ?? [], error };
}

export async function createNotificationEntry(entry: {
  order_id: string;
  channel: "email" | "sms" | "whatsapp";
  type: string;
  status: "pending" | "sent" | "failed";
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabaseAdmin
    .from("notification_log")
    .insert(entry)
    .select()
    .single();

  return { notification: data, error };
}
