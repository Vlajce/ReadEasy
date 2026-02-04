import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const positionSchema = z
  .object({
    startOffset: z.number().int().min(0),
    endOffset: z.number().int().min(0),
  })
  .refine((p) => p.endOffset >= p.startOffset, {
    message: "endOffset must be greater than or equal to startOffset",
  });

export const createVocabularySchema = z.object({
  word: z
    .string()
    .min(2)
    .max(100)
    .transform((val) => val.trim().toLowerCase()),
  meaning: z
    .string()
    .min(2)
    .max(500)
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  bookId: z.string().regex(objectIdRegex),
  context: z.string().min(2).max(500).optional(),
  position: positionSchema.optional(),
  language: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => !s || /^[a-z]{2}$/.test(s), {
      message: "Language must be ISO 639-1 code (e.g., 'en', 'fr')",
    }),
  status: z.enum(["new", "learning", "mastered"]).optional().default("new"),
});

export const updateVocabularySchema = z.object({
  meaning: z
    .string()
    .min(2)
    .max(500)
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  context: z.string().min(2).max(500).optional(),
  status: z.enum(["new", "learning", "mastered"]).optional(),
  language: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => !s || /^[a-z]{2}$/.test(s), {
      message: "Language must be ISO 639-1 code (e.g., 'en', 'fr')",
    })
    .optional(),
});

export const findVocabularyQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .default(1)
    .refine((v) => v > 0),
  limit: z.coerce
    .number()
    .int()
    .default(20)
    .refine((v) => v > 0 && v <= 100),
  search: z.string().trim().min(1).max(200).optional(),
  bookId: z.string().regex(objectIdRegex).optional(),
  status: z.enum(["new", "learning", "mastered"]).optional(),
  language: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => !s || /^[a-z]{2}$/.test(s), {
      message: "Language must be ISO 639-1 code (e.g., 'en', 'fr')",
    })
    .optional(),
});

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
export type FindVocabularyQueryInput = z.infer<
  typeof findVocabularyQuerySchema
>;
