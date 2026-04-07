// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError("");
      // Adjusted to /signup for current backend compatibility
      await api.post("/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 2000);
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Registrasi gagal");
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-[#00997a]/10 text-[#00997a] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h1>
          <p className="text-gray-500">Akun Anda telah dibuat. Mengalihkan ke halaman masuk...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900">Daftar Akun Grosur</h1>

        {serverError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium text-center border border-red-100">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              {...register("name")}
              className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
              placeholder="Masukkan nama lengkap"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

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
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
              placeholder="Minimal 6 karakter"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
              placeholder="Ulangi password"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#007a61] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Sudah punya akun? <Link href="/login" className="text-[#00997a] font-bold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </main>
  );
}
