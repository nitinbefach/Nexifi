"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  amount: number;
  created_at: string;
  order: { order_number: string; guest_name: string } | null;
}

interface Props {
  initialInvoices: Invoice[];
}

export default function InvoicesClient({ initialInvoices }: Props) {
  const [invoices] = useState(initialInvoices);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="mt-1 text-sm text-gray-500">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} — download or view generated invoices.
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <FileText className="mx-auto size-10 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-400">
                      No invoices yet. Invoices are generated when you download one from an order.
                    </p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className="font-mono font-medium text-gray-900">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-nexifi-orange">
                        {inv.order?.order_number || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {inv.order?.guest_name || "—"}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {formatINR(inv.amount)}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={`/api/invoices/generate/${inv.order_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-nexifi-orange px-3 py-1 text-xs font-medium text-nexifi-orange hover:bg-orange-50"
                      >
                        <Download className="size-3.5" /> Download
                      </a>
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
