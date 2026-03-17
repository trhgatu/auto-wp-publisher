import { z } from "zod";

export const ImportProductSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  sku: z.string().optional(),
  baseDescription: z.string().min(10, "Mô tả gốc quá ngắn"),
  category: z.string().default("Uncategorized"),
  sourceUrl: z.string().url().optional(),
});

export type ImportProductDto = z.infer<typeof ImportProductSchema>;

export enum JobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
