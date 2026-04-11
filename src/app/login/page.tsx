// src/app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import Link from "next/link";

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
      // Adjusted to /signin for current backend compatibility
      const res = await api.post("/auth/signin", data);

      const userData = res.data.data.user;
      setUser(userData); // Save to Zustand

      // Role-based redirection
      if (userData.role === "SUPER_ADMIN" || userData.role === "STORE_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/"); // Standard USER goes to homepage
      }
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="w-full p-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-900">Masuk ke Grosur</h1>

      {isVerified && (
        <div className="p-3 text-sm text-[#00997a] bg-[#00997a]/10 rounded-md font-medium text-center">
          Akun berhasil diverifikasi! Silakan masuk.
        </div>
      )}

      {serverError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium text-center border border-red-100">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            {...register("email")}
            className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
            placeholder="nama@email.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-[#00997a] hover:underline">Lupa password?</Link>
          </div>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#007a61] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Atau</span>
        </div>
      </div>

      <p className="text-sm text-center text-gray-500">
        Belum punya akun? <Link href="/register" className="text-[#00997a] font-bold hover:underline">Daftar di sini</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-gray-500">Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
