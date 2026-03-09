import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static pages
  const staticPages = [
    "",
    "/products",
    "/about",
    "/contact",
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

  // TODO: Add dynamic product and category pages from Supabase
  // const { data: products } = await supabase.from("products").select("slug, updated_at").eq("is_active", true);
  // const productPages = products?.map(...)

  return [...staticPages];
}
