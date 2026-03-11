import { z } from "zod";
import { addressSchema } from "./address.schema";

// Guest checkout order — no auth required
export const createOrderSchema = z.object({
  // Guest info
  guest_name: z.string().min(2, "Name is required"),
  guest_email: z.string().email("Invalid email address"),
  guest_phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),

  // Shipping address (inline, not address_id)
  shipping_address: addressSchema.omit({ is_default: true }),

  // Payment
  payment_method: z.enum(["online", "cod"], {
    message: "Please select a payment method",
  }),

  // Cart items
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        name: z.string(),
        image: z.string(),
        price: z.number().positive(),
        originalPrice: z.number().positive(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Cart is empty"),

  // Optional
  coupon_code: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
