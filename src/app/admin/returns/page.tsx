import { getAdminReturns } from "@/lib/supabase/admin-queries";
import ReturnsClient from "./returns-client";

export default async function AdminReturnsPage() {
  const { returns } = await getAdminReturns();

  return <ReturnsClient initialReturns={returns} />;
}
