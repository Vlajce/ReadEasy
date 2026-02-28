import { z } from "zod";

export const addVocabularyFormSchema = z.object({
  meaning: z
    .string()
    .max(500, "Translation must be at most 500 characters")
    .optional()
    .transform((v) => v?.trim() || undefined)
    .pipe(
      z.string().min(2, "Translation must be at least 2 characters").optional(),
    ),
  context: z
    .string()
    .max(500, "Note must be at most 500 characters")
    .optional()
    .transform((v) => v?.trim() || undefined)
    .pipe(z.string().min(2, "Note must be at least 2 characters").optional()),
});

export const vocabularySearchSchema = z.object({
  page: z.coerce.number().int().default(1).refine((v) => v > 0),
  limit: z.coerce
    .number()
    .int()
    .default(24)
    .refine((v) => v > 0 && v <= 100),
  search: z.string().trim().max(200).optional(),
  language: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => /^[a-z]{2}$/.test(s), {
      message: "Language must be ISO 639-1 code",
    })
    .optional(),
});

export type AddVocabularyFormInput = z.infer<typeof addVocabularyFormSchema>;
export type VocabularySearchParams = z.infer<typeof vocabularySearchSchema>;