import { getAdminCategories, getAllProductsForDropdown } from "@/lib/supabase/admin-queries";
import CategoriesClient from "./categories-client";

export default async function AdminCategoriesPage() {
  const [{ categories }, { products }] = await Promise.all([
    getAdminCategories(),
    getAllProductsForDropdown(),
  ]);

  return <CategoriesClient initialCategories={categories} allProducts={products} />;
}
