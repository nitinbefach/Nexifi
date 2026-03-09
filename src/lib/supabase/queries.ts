import { createClient } from "./server";
import type { Product, ProductImage, ProductVariant, Category } from "@/types/product";
import type { Product as CardProduct } from "@/components/storefront/ProductCard";

// ============================================================
// HELPERS
// ============================================================

/** Convert a DB product (with images) to the shape ProductCard expects */
export function toCardProduct(
  p: Product & { images?: ProductImage[] }
): CardProduct {
  const primaryImage = p.images?.find((img) => img.is_primary) ?? p.images?.[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: primaryImage?.image_url ?? "",
    originalPrice: p.original_price,
    sellingPrice: p.selling_price,
    avgRating: p.avg_rating,
    reviewCount: p.review_count,
  };
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

// ============================================================
// PRODUCTS
// ============================================================

export interface GetProductsOptions {
  categorySlug?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface GetProductsResult {
  products: (Product & { images: ProductImage[] })[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(
  options: GetProductsOptions = {}
): Promise<GetProductsResult> {
  const {
    categorySlug,
    search,
    sort = "newest",
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
  } = options;

  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*, images:product_images(*)", { count: "exact" })
    .eq("is_active", true);

  // Filter by category
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  // Full-text search
  if (search) {
    query = query.textSearch("name", search, { type: "websearch" });
  }

  // Price range
  if (minPrice !== undefined) {
    query = query.gte("selling_price", minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.lte("selling_price", maxPrice);
  }

  // Sorting
  switch (sort) {
    case "price-asc":
      query = query.order("selling_price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("selling_price", { ascending: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "best-selling":
      query = query.order("review_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("getProducts error:", error.message);
    return { products: [], total: 0, page, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    products: (data as (Product & { images: ProductImage[] })[]) ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(
  slug: string
): Promise<(Product & { images: ProductImage[]; variants: ProductVariant[]; category: Category | null }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Product & { images: ProductImage[]; variants: ProductVariant[]; category: Category | null };
}

export async function getFeaturedProducts(
  limit = 4
): Promise<(Product & { images: ProductImage[] })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProducts error:", error.message);
    return [];
  }
  return (data as (Product & { images: ProductImage[] })[]) ?? [];
}

export async function getTrendingProducts(
  limit = 4
): Promise<(Product & { images: ProductImage[] })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .eq("is_trending", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getTrendingProducts error:", error.message);
    return [];
  }
  return (data as (Product & { images: ProductImage[] })[]) ?? [];
}

// ============================================================
// BANNERS
// ============================================================

export interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export async function getBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getBanners error:", error.message);
    return [];
  }
  return data ?? [];
}

// ============================================================
// SEARCH
// ============================================================

export async function searchProducts(
  query: string,
  sort = "newest",
  limit = 20
): Promise<(Product & { images: ProductImage[] })[]> {
  const supabase = await createClient();

  // Use ilike for simple search (more forgiving than full-text for partial matches)
  let q = supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_active", true)
    .ilike("name", `%${query}%`);

  switch (sort) {
    case "price-asc":
      q = q.order("selling_price", { ascending: true });
      break;
    case "price-desc":
      q = q.order("selling_price", { ascending: false });
      break;
    case "rating":
      q = q.order("avg_rating", { ascending: false });
      break;
    case "best-selling":
      q = q.order("review_count", { ascending: false });
      break;
    case "newest":
    default:
      q = q.order("created_at", { ascending: false });
  }

  const { data, error } = await q.limit(limit);

  if (error) {
    console.error("searchProducts error:", error.message);
    return [];
  }
  return (data as (Product & { images: ProductImage[] })[]) ?? [];
}
