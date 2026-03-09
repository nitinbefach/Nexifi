import { z } from "zod";

export const addressSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode (6 digits)"),
  is_default: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
