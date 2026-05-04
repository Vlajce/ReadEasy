import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

// ─── Request Schemas ────────────────────────────────────────────────

export const generateExercisesQuerySchema = z.object({
  language: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => /^[a-z]{2}$/.test(s), {
      message: "Language must be ISO 639-1 code (e.g., 'en', 'fr')",
    }),
  count: z.coerce
    .number()
    .int()
    .refine((v) => [5, 10, 20].includes(v), {
      message: "Count must be 5, 10, or 20",
    })
    .default(10),
  types: z
    .string()
    .trim()
    .transform((s) =>
      s
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(
          z.enum([
            "fill_blank",
            "multiple_choice_translation",
            "multiple_choice_fill_blank",
          ]),
        )
        .min(1, { message: "At least one exercise type must be selected" }),
    ),
  mode: z
    .enum(["smart_mix", "new_only", "learning_only", "all"])
    .default("smart_mix"),
});

export const submitExercisesSchema = z.object({
  results: z
    .array(
      z.object({
        entryId: z
          .string()
          .regex(objectIdRegex, { message: "Invalid entryId" }),
        correct: z.boolean(),
      }),
    )
    .min(1)
    .max(20),
});

// ─── AI Response Schema ─────────────────────────────────────────────

const fillBlankExerciseSchema = z.object({
  index: z.number().int().min(0),
  type: z.literal("fill_blank"),
  sentence: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const multipleChoiceTranslationSchema = z.object({
  index: z.number().int().min(0),
  type: z.literal("multiple_choice_translation"),
  word: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).length(4),
  answer: z.string().trim().min(1),
});

const multipleChoiceFillBlankSchema = z.object({
  index: z.number().int().min(0),
  type: z.literal("multiple_choice_fill_blank"),
  sentence: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).length(4),
  answer: z.string().trim().min(1),
});

export const aiExerciseItemSchema = z.discriminatedUnion("type", [
  fillBlankExerciseSchema,
  multipleChoiceTranslationSchema,
  multipleChoiceFillBlankSchema,
]);

export const aiExerciseResponseSchema = z.object({
  exercises: z.array(aiExerciseItemSchema).min(1),
});

// ─── Client Response Schema (šta vraćamo frontendu) ─────────────────

const clientFillBlankSchema = z.object({
  entryId: z.string(),
  type: z.literal("fill_blank"),
  sentence: z.string(),
  answer: z.string(),
});

const clientMultipleChoiceTranslationSchema = z.object({
  entryId: z.string(),
  type: z.literal("multiple_choice_translation"),
  word: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});

const clientMultipleChoiceFillBlankSchema = z.object({
  entryId: z.string(),
  type: z.literal("multiple_choice_fill_blank"),
  sentence: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});

export const clientExerciseSchema = z.discriminatedUnion("type", [
  clientFillBlankSchema,
  clientMultipleChoiceTranslationSchema,
  clientMultipleChoiceFillBlankSchema,
]);

// ─── Types ──────────────────────────────────────────────────────────

export type GenerateExercisesQueryInput = z.infer<
  typeof generateExercisesQuerySchema
>;
export type SubmitExercisesInput = z.infer<typeof submitExercisesSchema>;
export type AiExerciseItem = z.infer<typeof aiExerciseItemSchema>;
export type AiExerciseResponse = z.infer<typeof aiExerciseResponseSchema>;
export type ClientExercise = z.infer<typeof clientExerciseSchema>;
