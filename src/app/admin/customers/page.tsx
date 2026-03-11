import { getAdminCustomers } from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";
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

export default async function AdminCustomersPage() {
  const { customers } = await getAdminCustomers();

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          {customers.length} unique customer
          {customers.length !== 1 ? "s" : ""} from guest checkout orders.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>First Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No customers yet. Orders will appear here once placed.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.guest_email} className="admin-table-row">
                    <TableCell className="font-medium">
                      {customer.guest_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.guest_email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.guest_phone}
                    </TableCell>
                    <TableCell>{customer.order_count}</TableCell>
                    <TableCell className="font-medium">
                      {formatINR(customer.total_spent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(customer.first_order).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
