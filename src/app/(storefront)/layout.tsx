import { getCategories } from "@/lib/supabase/queries";
import StorefrontShell from "@/components/storefront/StorefrontShell";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  const navCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <StorefrontShell categories={navCategories}>
      {children}
    </StorefrontShell>
  );
}
