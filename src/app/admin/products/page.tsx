import Link from "next/link";
import { getAdminProducts } from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";

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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-2 text-sm text-gray-500">
            {total} product{total !== 1 ? "s" : ""} in your catalog.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/bulk-upload"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bulk Upload
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-md bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark"
          >
            Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <form className="mt-4" method="GET">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="w-full max-w-sm rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
        />
      </form>

      {/* Product Table */}
      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    {search ? "No products match your search." : "No products yet."}
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const primaryImage = product.images?.find(
                    (img: { is_primary: boolean }) => img.is_primary
                  );
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <img
                              src={primaryImage.image_url}
                              alt={product.name}
                              className="size-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                              IMG
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="font-medium text-gray-900 hover:text-nexifi-orange hover:underline"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-gray-500">{product.sku || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-6 py-3">
                        <div>
                          <span className="font-medium">
                            {formatINR(product.selling_price)}
                          </span>
                          {product.original_price > product.selling_price && (
                            <span className="ml-1.5 text-xs text-gray-400 line-through">
                              {formatINR(product.original_price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={
                            product.stock_quantity < 5
                              ? "font-medium text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm font-medium text-nexifi-orange hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ""}`}
                  className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ""}`}
                  className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
