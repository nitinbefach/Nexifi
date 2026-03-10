import { getAdminReviews } from "@/lib/supabase/admin-queries";
import ReviewsClient from "./reviews-client";

export default async function AdminReviewsPage() {
  const { reviews } = await getAdminReviews();

  return <ReviewsClient initialReviews={reviews} />;
}
