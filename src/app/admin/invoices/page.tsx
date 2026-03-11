import { getAdminInvoices } from "@/lib/supabase/admin-queries";
import InvoicesClient from "./invoices-client";

export default async function AdminInvoicesPage() {
  const { invoices } = await getAdminInvoices();

  return <InvoicesClient initialInvoices={invoices} />;
}
