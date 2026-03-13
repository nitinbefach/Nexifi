import { getAdminProducts } from "@/lib/supabase/admin-queries";
import { Plus, Upload } from "lucide-react";
import LinkButton from "@/components/admin/LinkButton";
import AnimatedPage from "@/components/admin/AnimatedPage";
import { Input } from "@/components/ui/input";
import ProductsTableClient from "./ProductsTableClient";

interface SearchParams {
  page?: string;
  search?: string;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const search = sp.search || "";
  const limit = 20;

  const { products, total } = await getAdminProducts(page, search, limit);
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

      {/* Search */}
      <form method="GET">
        <Input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="max-w-sm"
        />
      </form>

      {/* Product Table with multi-select */}
      <ProductsTableClient
        products={products}
        page={page}
        totalPages={totalPages}
        search={search}
      />
    </AnimatedPage>
  );
}
