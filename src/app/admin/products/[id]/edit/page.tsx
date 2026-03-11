import { getAdminProductById, getAdminCategories } from "@/lib/supabase/admin-queries";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ product }, { categories }] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Update details for &ldquo;{product.name}&rdquo;.
      </p>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
