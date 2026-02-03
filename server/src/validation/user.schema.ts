import { z } from "zod";

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(25, "Username cannot exceed 25 characters")
      .trim()
      .optional(),
    email: z
      .string()
      .email("Invalid email format")
      .lowercase()
      .trim()
      .optional(),
  })
  .refine((data) => data.username || data.email, {
    message:
      "At least one field (username or email) must be provided for update",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
