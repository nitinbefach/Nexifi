import { z } from "zod";

export const createOrderSchema = z.object({
  address_id: z.string().uuid("Please select a delivery address"),
  payment_method: z.enum(["online", "cod"], {
    message: "Please select a payment method",
  }),
  coupon_code: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
