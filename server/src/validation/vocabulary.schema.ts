import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const createVocabularySchema = z.object({
  word: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => val.trim().toLowerCase()),
  baseForm: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => val.trim().toLowerCase()),
  translation: z.string().min(1).max(500),
  targetLanguage: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => /^[a-z]{2}$/.test(s), {
      message: "Target language must be ISO 639-1 code (e.g., 'en', 'fr')",
    }),
  language: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => /^[a-z]{2}$/.test(s), {
      message: "Language must be ISO 639-1 code (e.g., 'en', 'fr')",
    }),
  partOfSpeech: z
    .string()
    .min(1)
    .max(50)
    .transform((val) => val.trim().toLowerCase()),
  bookId: z.string().regex(objectIdRegex),
  contexts: z.array(z.string().trim().min(1)).min(1),
  status: z.enum(["new", "learning", "mastered"]).default("new"),
  highlightColor: z
    .enum(["yellow", "green", "blue", "pink", "purple"])
    .default("yellow"),
});

export const updateVocabularySchema = z.object({
  baseForm: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => val.trim().toLowerCase())
    .optional(),
  translation: z
    .string()
    .min(1)
    .max(500)
    .transform((val) => val.trim())
    .optional(),
  targetLanguage: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => /^[a-z]{2}$/.test(s), {
      message: "Target language must be ISO 639-1 code (e.g., 'en', 'fr')",
    })
    .optional(),
  partOfSpeech: z
    .string()
    .min(1)
    .max(50)
    .transform((val) => val.trim().toLowerCase())
    .optional(),
  contexts: z.array(z.string().trim().min(1)).min(1).optional(),
  status: z.enum(["new", "learning", "mastered"]).optional(),
  highlightColor: z
    .enum(["yellow", "green", "blue", "pink", "purple"])
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

// Stats Validation Schemas
export const activityStatsQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .default(30)
    .refine((v) => v === 7 || v === 30, {
      message: "Days must be either 7 or 30",
    }),
});

// Translation & AI Integration Schemas
export const translationRequestSchema = z.object({
  word: z.string().trim().min(1).max(40),
  sentence: z.string().trim().min(1).max(1000),
  bookId: z.string().regex(objectIdRegex),
});

export const aiTranslationResponseSchema = z.object({
  translation: z.string().trim().min(1),
  baseForm: z.string().trim().min(1),
  partOfSpeech: z.string().trim().min(1).default("unknown"),
});

export const saveVocabularySchema = z.object({
  bookId: z.string().regex(objectIdRegex),
  sentence: z.string().trim().min(1).max(500),
  word: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .transform((val) => val.toLowerCase()),
  baseForm: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .transform((val) => val.toLowerCase()),
  translation: z.string().trim().min(1).max(500),
  partOfSpeech: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((val) => val.toLowerCase()),
  highlightColor: z
    .enum(["yellow", "green", "blue", "pink", "purple"])
    .optional(),
});

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
export type FindVocabularyQueryInput = z.infer<
  typeof findVocabularyQuerySchema
>;
export type ActivityStatsQueryInput = z.infer<typeof activityStatsQuerySchema>;
export type AiTranslationResponse = z.infer<typeof aiTranslationResponseSchema>;
export type TranslationRequestInput = z.infer<typeof translationRequestSchema>;
export type SaveVocabularyInput = z.infer<typeof saveVocabularySchema>;
