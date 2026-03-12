import { Plus, Upload } from "lucide-react";
import { getAdminProducts, getAdminCategories } from "@/lib/supabase/admin-queries";
import LinkButton from "@/components/admin/LinkButton";
import AnimatedPage from "@/components/admin/AnimatedPage";
import ProductsTable from "./products-table";

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  category?: string;
  stock?: string;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const search = sp.search || "";
  const status = (sp.status === "active" || sp.status === "archived") ? sp.status : undefined;
  const category = sp.category || undefined;
  const stock = sp.stock === "low" ? "low" as const : undefined;
  const limit = 20;

  const [{ products, total }, { categories }] = await Promise.all([
    getAdminProducts(page, search, limit, { status, category_id: category, stock }),
    getAdminCategories(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {total} product{total !== 1 ? "s" : ""} in your catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/admin/products/bulk-upload" className="gap-1.5">
            <Upload className="size-3.5" />
            Bulk Upload
          </LinkButton>
          <LinkButton href="/admin/products/new" variant="default" className="gap-1.5">
            <Plus className="size-3.5" />
            Add Product
          </LinkButton>
        </div>
      </div>

      <ProductsTable
        products={products}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        page={page}
        totalPages={totalPages}
        total={total}
        search={search}
        filterStatus={status}
        filterCategory={category}
        filterStock={stock}
      />
    </AnimatedPage>
  );
}
