export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  product?: {
    name: string;
    slug: string;
    selling_price: number;
    original_price: number;
    stock_quantity: number;
    images: { image_url: string; is_primary: boolean }[];
  };
}
