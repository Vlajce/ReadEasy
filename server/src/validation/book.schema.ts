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
        "Relativna putanja koja se završava na .txt, bez '..'"
      ),
    coverImagePath: z
      .string()
      .trim()
      .regex(
        /^(?!.*\.\.)(?![/\\])(?:[\w-]+(?:[/\\][\w-]+)*)\.(png|jpg|jpeg)$/i,
        "Relativna putanja do slike (.png/.jpg/.jpeg), bez '..'"
      )
      .optional(),
    wordCount: z.number().int().min(0).optional(),
    isPublicDomain: z.boolean().default(true),
    ownerId: z.string().regex(objectIdRegex, "Nevalidan ownerId").optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isPublicDomain && !data.ownerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownerId"],
        message: "ownerId je obavezan kada je isPublicDomain = false",
      });
    }
  });

export const gutendexBookSchema = z.object({
  id: z.number(),
  title: z.string(),
  authors: z.array(z.object({ name: z.string() })).optional(),
  languages: z.array(z.string()),
  formats: z.record(z.string(), z.string()),
});

export type GutendexBook = z.infer<typeof gutendexBookSchema>;
export type BookInput = z.infer<typeof bookSchema>;
