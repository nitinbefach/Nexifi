import { getAdminCoupons } from "@/lib/supabase/admin-queries";
import CouponsClient from "./coupons-client";

export default async function AdminCouponsPage() {
  const { coupons } = await getAdminCoupons();

  return <CouponsClient initialCoupons={coupons} />;
}
