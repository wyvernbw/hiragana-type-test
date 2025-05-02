import { z } from "zod";

export const passwordSchema = z.string().min(8).max(255).trim();

export const signupSchema = z.object({
  username: z.string().min(4).max(32).trim(),
  email: z.string().email().trim(),
  password: passwordSchema,
});

export type SignupParams = z.infer<typeof signupSchema>;
