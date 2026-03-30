"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/axiosInstance";
import Link from "next/link";

interface VerifyFormValues {
  password: string;
  confirmPassword: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract email and token from the URL parameters
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VerifyFormValues>();
  const password = watch("password");

  const onSubmit = async (data: VerifyFormValues) => {
    if (!email || !token) {
      setMessage({ type: "error", text: "Link verifikasi tidak valid. Pastikan Anda mengklik link dari email Anda." });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Calls the verifyHandler we wrote in auth.controller.ts
      await api.post("/auth/verify", {
        email,
        token,
        password: data.password,
      });

      setMessage({
        type: "success",
        text: "Akun berhasil diverifikasi! Mengalihkan ke halaman login..."
      });

      // Redirect to login after 2 seconds so they can see the success message
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Verifikasi gagal. Token mungkin kadaluarsa."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-100">
        <h2 className="text-lg font-bold text-red-600 mb-2">Link Tidak Valid</h2>
        <p className="text-sm text-gray-500 mb-4">Parameter email atau token hilang dari URL.</p>
        <Link href="/register" className="text-[#00997a] font-bold hover:underline">Kembali ke Pendaftaran</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Verifikasi Akun</h1>
        <p className="text-sm text-gray-500 mt-2">
          Halo <strong>{email}</strong>,<br /> Silakan buat password untuk akun Anda.
        </p>
      </div>

      {message.text && (
        <div className={`p-3 mb-6 text-sm rounded-md font-medium text-center ${message.type === "success" ? "bg-[#59cfb7]/20 text-[#00997a]" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
          <input
            type="password"
            {...register("password", {
              required: "Password wajib diisi",
              minLength: { value: 6, message: "Password minimal 6 karakter" }
            })}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#59cfb7] transition-all"
            placeholder="Masukkan password"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Konfirmasi password wajib diisi",
              validate: (value) => value === password || "Password tidak cocok"
            })}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#59cfb7] transition-all"
            placeholder="Ulangi password"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || message.type === "success"}
          className="w-full py-3 mt-4 text-white font-bold bg-[#00997a] rounded-lg hover:bg-[#007a61] transition-colors disabled:opacity-50"
        >
          {isLoading ? "Memproses..." : "Verifikasi & Simpan Password"}
        </button>
      </form>
    </div>
  );
}

// Main page component wrapped in Suspense for Next.js useSearchParams
export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f5] flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="text-gray-500 font-medium">Memuat data...</div>}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}