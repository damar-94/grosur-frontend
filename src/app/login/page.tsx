// src/app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/store/useAppStore";
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
      const res = await api.post("/auth/login", data);
      setUser(res.data.data);
      router.push("/");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="w-full p-8 space-y-6 bg-white rounded-xl shadow-sm border border-[#f3f5f7]">
      <h1 className="text-2xl font-bold text-center text-[#1a1a1a]">Masuk ke Akun</h1>
      
      {isVerified && (
        <div className="p-3 text-sm text-[#00997a] bg-[#59cfb7]/20 rounded-md font-medium">
          Akun berhasil diverifikasi! Silakan masuk.
        </div>
      )}

      {serverError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a]">Email</label>
          <input
            {...register("email")}
            className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#59cfb7] outline-none text-[#1a1a1a] placeholder-[#8e8e8e]"
            placeholder="nama@email.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a1a]">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#59cfb7] outline-none text-[#1a1a1a] placeholder-[#8e8e8e]"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#00997a]/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </form>
      
      <p className="text-sm text-center text-[#8e8e8e]">
        Belum punya akun? <Link href="/register" className="text-[#00997a] font-bold hover:underline">Daftar di sini</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#f3f5f7]">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-[#8e8e8e]">Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}