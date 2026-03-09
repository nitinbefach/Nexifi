import { z } from "zod";

export const returnRequestSchema = z.object({
  order_item_id: z.string().uuid("Select an item to return"),
  reason: z.enum(
    [
      "defective",
      "wrong_item",
      "not_as_described",
      "size_issue",
      "changed_mind",
      "other",
    ],
    { message: "Please select a reason" }
  ),
  description: z.string().min(10, "Please describe the issue (min 10 characters)"),
  images: z.array(z.string().url()).optional(),
});

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
