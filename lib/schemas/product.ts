import { z } from "zod"

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  image_url: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  active: z.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative").nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type Product = z.infer<typeof productSchema>
