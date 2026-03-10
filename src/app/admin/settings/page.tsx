import { getStoreSettingsMap } from "@/lib/supabase/admin-queries";
import SettingsClient from "./settings-client";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettingsMap();

  return <SettingsClient initialSettings={settings} />;
}
