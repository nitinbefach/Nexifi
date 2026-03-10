import { supabaseAdmin } from "./admin";

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
