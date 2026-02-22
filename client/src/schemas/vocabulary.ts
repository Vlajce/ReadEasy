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

export type AddVocabularyFormInput = z.infer<typeof addVocabularyFormSchema>;
