import { z } from "zod";

export const ImportProductSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  sku: z.string().optional(),
  baseDescription: z.string().optional(),
  category: z.string().default("Uncategorized"),
  sourceUrl: z.string().url().optional(),
  // Các trường mở rộng cho Excel
  dimensions: z.string().optional(),
  material: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  carModels: z.string().optional(),
  carDetail: z.string().optional(),
  partNumbers: z.string().optional(),
  video: z.string().optional(),
  shopeeLink: z.string().optional(),
  lazadaLink: z.string().optional(),
  tiktokLink: z.string().optional(),
});

export type ImportProductDto = z.infer<typeof ImportProductSchema>;

export const BulkImportProductSchema = z.array(ImportProductSchema);
export type BulkImportProductDto = z.infer<typeof BulkImportProductSchema>;

export const JobStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
