// src/app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/store/useAppStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAppStore((state) => state.setUser);
  const [serverError, setServerError] = useState("");
  
  const isVerified = searchParams.get("verified") === "true";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError("");
      const res = await api.post("/login", data);
      setUser(res.data.data); // Save user to Zustand store
      router.push("/"); // Redirect to homepage
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Login to Grocery</h1>
      
      {isVerified && (
        <div className="p-3 text-sm text-green-700 bg-green-100 rounded">
          Account verified successfully! You can now log in.
        </div>
      )}

      {serverError && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            {...register("email")}
            className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2 mt-1 border rounded focus:ring focus:ring-blue-200"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Suspense fallback={<div>Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}