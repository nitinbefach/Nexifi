import { getAdminCustomers } from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const { customers } = await getAdminCustomers();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
      <p className="mt-2 text-sm text-gray-500">
        {customers.length} unique customer{customers.length !== 1 ? "s" : ""} from
        guest checkout orders.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Orders</th>
                <th className="px-6 py-3">Total Spent</th>
                <th className="px-6 py-3">First Order</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No customers yet. Orders will appear here once placed.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.guest_email} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {customer.guest_name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {customer.guest_email}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {customer.guest_phone}
                    </td>
                    <td className="px-6 py-3 text-gray-900">
                      {customer.order_count}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {formatINR(customer.total_spent)}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(customer.first_order).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
