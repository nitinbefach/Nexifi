import { z } from "zod";

export const bulkProductRowSchema = z.object({
  name: z.string().min(3, "Product name required (min 3 chars)"),
  category: z.string().min(1, "Category is required"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  original_price: z.coerce.number().positive("Original price must be positive"),
  selling_price: z.coerce.number().positive("Selling price must be positive"),
  sku: z.string().optional(),
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  tags: z.string().optional(),
  image_url_1: z.string().url().optional().or(z.literal("")),
  image_url_2: z.string().url().optional().or(z.literal("")),
  image_url_3: z.string().url().optional().or(z.literal("")),
  featured: z.string().optional(),
  trending: z.string().optional(),
});

export type BulkProductRow = z.infer<typeof bulkProductRowSchema>;
