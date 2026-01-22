import { z } from "zod";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const bookSchema = z
  .object({
    title: z.string().min(1).max(255).trim(),
    author: z.string().min(1).max(100).trim(),
    language: z
      .string()
      .trim()
      .transform((s) => s.toLowerCase())
      .refine((s) => /^[a-z]{2}$/.test(s), {
        message: "language mora biti ISO 639-1 (npr. 'en', 'sr')",
      }),
    description: z.string().max(2000).optional(),
    filepath: z
      .string()
      .trim()
      .regex(
        /^(?!.*\.\.)(?![/\\])(?:[\w-]+(?:[/\\][\w-]+)*)\.txt$/i,
        "Relativna putanja koja se završava na .txt, bez '..'",
      ),
    coverImagePath: z
      .string()
      .trim()
      .regex(
        /^(?!.*\.\.)(?![/\\])(?:[\w-]+(?:[/\\][\w-]+)*)\.(png|jpg|jpeg)$/i,
        "Relativna putanja do slike (.png/.jpg/.jpeg), bez '..'",
      )
      .optional(),
    wordCount: z.number().int().min(0).optional(),

    visibility: z.enum(["public", "private"]).default("public"),
    ownerId: z.string().regex(objectIdRegex, "Nevalidan ownerId").optional(),

    subjects: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.visibility === "private" && !data.ownerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownerId"],
        message: "ownerId je obavezan kada je visibility = 'private'",
      });
    }
  });

export const gutendexBookSchema = z.object({
  id: z.number(),
  title: z.string(),
  authors: z.array(z.object({ name: z.string() })).optional(),
  languages: z.array(z.string()),
  formats: z.record(z.string(), z.string()),
  summaries: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
});

export const findBooksQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .default(1)
    .refine((v) => v > 0, { message: "Page must be a positive integer" }),

  limit: z.coerce
    .number()
    .int()
    .default(20)
    .refine((v) => v > 0 && v <= 100, {
      message: "Limit must be between 1 and 100",
    }),

  search: z.string().trim().min(1).max(100).optional(),

  language: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .refine((s) => !s || /^[a-z]{2}$/.test(s), {
      message: "Language must be ISO 639-1 (e.g., 'en', 'fr')",
    })
    .optional(),

  sortBy: z.enum(["wordCount"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GutendexBook = z.infer<typeof gutendexBookSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type FindBooksQuery = z.infer<typeof findBooksQuerySchema>;
