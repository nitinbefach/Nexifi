import { getAdminShipments } from "@/lib/supabase/admin-queries";
import ShippingClient from "./shipping-client";

export default async function AdminShippingPage() {
  const { shipments } = await getAdminShipments();

  return <ShippingClient initialShipments={shipments} />;
}
