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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerMessage({ type: "", text: "" });
      await api.post("/auth/register", data);
      setServerMessage({
        type: "success",
        text: "Sukses! Silakan cek email Anda untuk link verifikasi.",
      });
    } catch (error: any) {
      setServerMessage({
        type: "error",
        text: error.response?.data?.message || "Registrasi gagal",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#f3f5f7]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm border border-[#f3f5f7]">
        <h1 className="text-2xl font-bold text-center text-[#1a1a1a]">Daftar Akun</h1>
        
        {serverMessage.text && (
          <div className={`p-3 text-sm rounded-md font-medium ${serverMessage.type === "error" ? "text-red-600 bg-red-50" : "text-[#00997a] bg-[#59cfb7]/20"}`}>
            {serverMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a]">Alamat Email</label>
            <input
              {...register("email")}
              className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#59cfb7] outline-none text-[#1a1a1a] placeholder-[#8e8e8e]"
              placeholder="nama@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#00997a]/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Mengirim Link..." : "Daftar"}
          </button>
        </form>

        <p className="text-sm text-center text-[#8e8e8e]">
          Sudah punya akun? <Link href="/login" className="text-[#00997a] font-bold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </main>
  );
}