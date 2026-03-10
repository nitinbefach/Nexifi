import { getNotificationLog } from "@/lib/supabase/admin-queries";
import NotificationsClient from "./notifications-client";

export default async function AdminNotificationsPage() {
  const { notifications } = await getNotificationLog();

  return <NotificationsClient initialNotifications={notifications} />;
}
