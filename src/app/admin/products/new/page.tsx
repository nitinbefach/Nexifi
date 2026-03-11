import { getAdminCategories } from "@/lib/supabase/admin-queries";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const { categories } = await getAdminCategories();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill in the details below to add a new product to your catalog.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
