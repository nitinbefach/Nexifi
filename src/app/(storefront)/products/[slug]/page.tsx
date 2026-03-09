import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, toCardProduct } from "@/lib/supabase/queries";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found | NEXIFI" };

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  return {
    title: `${product.name} | NEXIFI`,
    description: product.description || `Buy ${product.name} at NEXIFI — Next is Now`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: primaryImage ? [{ url: primaryImage.image_url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  // Fetch related products from same category
  const relatedRaw = product.category?.slug
    ? await getProducts({ categorySlug: product.category.slug, limit: 5 })
    : { products: [] };
  const relatedProducts = relatedRaw.products
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map(toCardProduct);

  return (
    <ProductDetailClient
      slug={slug}
      relatedProducts={relatedProducts}
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        originalPrice: product.original_price,
        sellingPrice: product.selling_price,
        avgRating: product.avg_rating,
        reviewCount: product.review_count,
        stockQuantity: product.stock_quantity,
        images: product.images?.sort((a, b) => a.sort_order - b.sort_order) ?? [],
        variants: product.variants ?? [],
        category: product.category,
      }}
    />
  );
}
