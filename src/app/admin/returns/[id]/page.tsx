import { getAdminReturnById } from "@/lib/supabase/admin-queries";
import { notFound } from "next/navigation";
import ReturnDetailClient from "./return-detail-client";

export default async function AdminReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { returnRequest, error } = await getAdminReturnById(id);

  if (error || !returnRequest) {
    notFound();
  }

  return <ReturnDetailClient returnRequest={returnRequest} />;
}
