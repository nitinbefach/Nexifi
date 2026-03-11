import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static pages
  const staticPages = [
    "",
    "/products",
    "/about",
    "/contact",
    "/track-order",
    "/shipping-policy",
    "/return-policy",
    "/privacy-policy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic: active products
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const productPages = (products ?? []).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic: active categories
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("slug, updated_at")
    .eq("is_active", true);

  const categoryPages = (categories ?? []).map((c) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
