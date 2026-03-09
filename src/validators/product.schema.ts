import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    description: z.string().optional(),
    short_description: z.string().optional(),
    category_id: z.string().uuid("Select a category"),
    original_price: z.number().positive("Price must be greater than 0"),
    selling_price: z.number().positive("Price must be greater than 0"),
    sku: z.string().optional(),
    stock_quantity: z.number().int().min(0, "Stock cannot be negative"),
    tags: z.array(z.string()).optional(),
    is_featured: z.boolean().optional(),
    is_trending: z.boolean().optional(),
  })
  .refine((data) => data.selling_price <= data.original_price, {
    message: "Selling price must be less than or equal to original price",
    path: ["selling_price"],
  });

export type ProductInput = z.infer<typeof productSchema>;
