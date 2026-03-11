// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";
import Link from "next/link";

export default function RegisterPage() {
  const [serverMessage, setServerMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerMessage({ type: "", text: "" });
      await api.post("/register", data);
      setServerMessage({
        type: "success",
        text: "Success! Please check your email for the verification link.",
      });
    } catch (error: any) {
      setServerMessage({
        type: "error",
        text: error.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Create an Account</h1>
        
        {serverMessage.text && (
          <div className={`p-3 text-sm rounded ${serverMessage.type === "error" ? "text-red-500 bg-red-100" : "text-green-700 bg-green-100"}`}>
            {serverMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <input
              {...register("email")}
              className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Sending Link..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </main>
  );
}