// src/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Infer the TypeScript type directly from the schema
export type LoginFormValues = z.infer<typeof loginSchema>;