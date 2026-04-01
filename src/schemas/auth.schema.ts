// src/schemas/auth.schema.ts
import { z } from "zod";

// 1. Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// 2. Register Schema (Email only, per US-1.1.1)
export const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

// 3. Verify / Set Password Schema (with password match validation)
export const verifySchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type VerifyFormValues = z.infer<typeof verifySchema>;