import { getAdminBanners } from "@/lib/supabase/admin-queries";
import BannersClient from "./banners-client";

export default async function AdminBannersPage() {
  const { banners } = await getAdminBanners();

  return <BannersClient initialBanners={banners} />;
}
