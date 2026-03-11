import Link from "next/link";
import { getAdminOrders } from "@/lib/supabase/admin-queries";
import { formatINR, cn } from "@/lib/utils";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import LinkButton from "@/components/admin/LinkButton";
import AnimatedPage from "@/components/admin/AnimatedPage";
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
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {total} order{total !== 1 ? "s" : ""}
          {status ? ` with status "${status}"` : ""}.
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s || "all"}
            href={`/admin/orders${s ? `?status=${s}` : ""}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-all",
              status === s
                ? "bg-nexifi-orange text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="admin-table-row">
                    <TableCell className="whitespace-nowrap font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:text-nexifi-orange hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <p className="hover:text-nexifi-orange">
                          {order.guest_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.guest_email}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatINR(order.total_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.payment_method === "cod" ? "COD" : "Online"}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-nexifi-orange hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
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
                    href={`/admin/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
                    size="xs"
                  >
                    Previous
                  </LinkButton>
                )}
                {page < totalPages && (
                  <LinkButton
                    href={`/admin/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
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
