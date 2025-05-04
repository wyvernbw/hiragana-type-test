import { z } from "zod";

export const passwordSchema = z.string().min(8).max(255).trim();

export const signupSchema = z.object({
  username: z
    .string()
    .min(4, {
      message: "Username must be at least 4 characters long",
    })
    .max(32, {
      message: "Username cannot be longer than 32 characters",
    })
    .trim(),
  email: z.string().email().trim(),
  password: passwordSchema,
});

export type SignupParams = z.infer<typeof signupSchema>;
