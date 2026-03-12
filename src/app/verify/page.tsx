// src/app/verify/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema, VerifyFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormValues) => {
    if (!token || !email) return setErrorMsg("Link verifikasi tidak valid.");
    try {
      setErrorMsg("");
      await api.post("/auth/verify", { email, token, password: data.password });
      router.push("/login?verified=true");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Verifikasi gagal");
    }
  };

  return (
    <div className="w-full p-8 space-y-6 bg-white rounded-xl shadow-sm border border-[#f3f5f7]">
      <h1 className="text-2xl font-bold text-center text-[#1a1a1a]">Buat Password</h1>
      <p className="text-sm text-center text-[#8e8e8e]">Memverifikasi: <span className="text-[#1a1a1a] font-medium">{email}</span></p>
      
      {errorMsg && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md font-medium">{errorMsg}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a]">Password Baru</label>
          <input type="password" {...register("password")} className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#59cfb7] outline-none text-[#1a1a1a]" />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a1a]">Konfirmasi Password</label>
          <input type="password" {...register("confirmPassword")} className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#59cfb7] outline-none text-[#1a1a1a]" />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#00997a]/90 transition-colors disabled:opacity-50">
          {isSubmitting ? "Menyimpan..." : "Simpan & Masuk"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#f3f5f7]">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-[#8e8e8e]">Memuat data...</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </main>
  );
}