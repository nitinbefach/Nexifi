import { getAdminCategories } from "@/lib/supabase/admin-queries";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const { categories } = await getAdminCategories();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>
      <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
      <p className="mt-2 text-sm text-gray-500">
        Fill in the details below to add a new product to your catalog.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
