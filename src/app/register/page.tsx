// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import Link from "next/link";
import AuthHeader from "@/components/auth/AuthHeader";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  // GROS-98: State for referral code input
  const [referralCode, setReferralCode] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // 1. Standard Email Registration
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError("");
      // Adjusted to /signup for current backend compatibility
      // GROS-97: Sending email and referral code to backend
      await api.post("/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
        referredBy: referralCode // Added referral code
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 2000);
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Registrasi gagal");
    }
  };

  // 2. Google Social Registration
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
        referredBy: referralCode // GROS-97: Pass referral code to Google flow too
      });

      setUser(res.data.data.user);
      router.push("/");
    } catch (error) {
      console.error("Google registration failed", error);
      setServerError("Gagal mendaftar dengan Google.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AuthHeader title="Daftar" />
        <main className="flex-grow flex items-center justify-center p-4">
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
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AuthHeader title="Daftar" />
        <main className="flex-grow flex items-center justify-center p-4">
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

              {/* GROS-98: Referral Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Kode Referral (Opsional)</label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
                  placeholder="CONTOH: ANDRE123"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#007a61] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Atau daftar dengan</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setServerError("Google login dibatalkan")}
                theme="outline"
                size="large"
                width="100%"
              />
            </div>

            <p className="text-sm text-center text-gray-500">
              Sudah punya akun? <Link href="/login" className="text-[#00997a] font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}
