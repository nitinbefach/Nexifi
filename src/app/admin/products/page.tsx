import Link from "next/link";
import { getAdminProducts } from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";
import { Plus, Upload } from "lucide-react";
import LinkButton from "@/components/admin/LinkButton";
import AnimatedPage from "@/components/admin/AnimatedPage";
import ProductDeleteButton from "@/components/admin/ProductDeleteButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      {/* Product Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {search ? "No products match your search." : "No products yet."}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const primaryImage = product.images?.find(
                    (img: { is_primary: boolean }) => img.is_primary
                  );
                  const stockLevel =
                    product.stock_quantity < 5
                      ? "low"
                      : product.stock_quantity < 15
                        ? "medium"
                        : "good";

                  return (
                    <TableRow key={product.id} className="admin-table-row">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <div className="img-hover-zoom rounded-md">
                              <img
                                src={primaryImage.image_url}
                                alt={product.name}
                                className="size-10 rounded-md object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                              IMG
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="font-medium hover:text-nexifi-orange hover:underline"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {product.sku || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatINR(product.selling_price)}
                        </span>
                        {product.original_price > product.selling_price && (
                          <span className="ml-1.5 text-xs text-muted-foreground line-through">
                            {formatINR(product.original_price)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            stockLevel === "low"
                              ? "font-semibold text-destructive"
                              : stockLevel === "medium"
                                ? "font-medium text-amber-500"
                                : "text-muted-foreground"
                          }
                        >
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.is_active ? "default" : "secondary"}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-sm font-medium text-nexifi-orange hover:underline"
                          >
                            Edit
                          </Link>
                          <ProductDeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <LinkButton
                    href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ""}`}
                    size="xs"
                  >
                    Previous
                  </LinkButton>
                )}
                {page < totalPages && (
                  <LinkButton
                    href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ""}`}
                    size="xs"
                  >
                    Next
                  </LinkButton>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
