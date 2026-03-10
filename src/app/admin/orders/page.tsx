import Link from "next/link";
import { getAdminOrders } from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

const STATUSES = ["", "pending", "confirmed", "shipped", "delivered", "cancelled"];

interface SearchParams {
  page?: string;
  status?: string;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const status = sp.status || "";
  const limit = 20;

  const { orders, total } = await getAdminOrders(page, status, limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
      <p className="mt-2 text-sm text-gray-500">
        {total} order{total !== 1 ? "s" : ""}{status ? ` with status "${status}"` : ""}.
      </p>

      {/* Status Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s || "all"}
            href={`/admin/orders${s ? `?status=${s}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              status === s
                ? "bg-nexifi-orange text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:text-nexifi-orange hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <p className="text-gray-900 hover:text-nexifi-orange">{order.guest_name}</p>
                        <p className="text-xs text-gray-500">{order.guest_email}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {formatINR(order.total_amount)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {order.payment_method === "cod" ? "COD" : "Online"}
                    </td>
                    <td className="px-6 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-nexifi-orange hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
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
                  href={`/admin/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
                  className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
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
