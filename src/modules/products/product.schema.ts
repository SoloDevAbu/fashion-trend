import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(1).max(500),
  source: z.enum(["myntra", "ajio", "pinterest"]),
  imageUrl: z.string().url(),
  localImagePath: z.string().optional(),
  productUrl: z.string().url(),
  price: z.string().optional(),
  currency: z.string().default("INR"),
});

export const productQuerySchema = z.object({
  source: z.enum(["myntra", "ajio", "pinterest"]).optional(),
  isAnalyzed: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
