import { z } from "zod";

export const bookSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.number().int().min(1).max(100).catch(20),
  search: z.string().trim().min(1).max(100).optional(),
  language: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z]{2}$/)
    .optional(),
  sortBy: z.enum(["wordCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type BookSearchParams = z.infer<typeof bookSearchSchema>;
