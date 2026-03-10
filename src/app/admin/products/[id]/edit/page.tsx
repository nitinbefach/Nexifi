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
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>
      <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
      <p className="mt-2 text-sm text-gray-500">
        Update details for &ldquo;{product.name}&rdquo;.
      </p>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
