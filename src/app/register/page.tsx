"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Link from "next/link";

interface RegisterFormValues {
  email: string;
}

export default function RegisterPage() {
  console.log("DEBUG GOOGLE ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>();

  // 1. Standard Email Registration (Sends Verification Link)
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.post("/auth/register", { email: data.email });
      setMessage({
        type: "success",
        text: "Berhasil! Silakan cek email Anda untuk tautan verifikasi."
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Gagal mendaftar. Email mungkin sudah terdaftar."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Google Social Registration (Auto-verifies and logs in)
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      // Save user to Zustand and redirect to home
      setUser(res.data.data.user);
      router.push("/");
    } catch (error) {
      console.error("Google registration failed", error);
      setMessage({ type: "error", text: "Gagal mendaftar dengan Google." });
    }
  };

  return (
    // 👇 THIS IS THE MISSING WRAPPER 👇
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <main className="min-h-screen bg-[#f3f4f5] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Daftar Akun Baru</h1>
            <p className="text-sm text-gray-500 mt-2">Mulai belanja kebutuhan harianmu dengan mudah.</p>
          </div>

          {message.text && (
            <div className={`p-3 mb-6 text-sm rounded-md font-medium text-center ${message.type === "success" ? "bg-[#59cfb7]/20 text-[#00997a]" : "bg-red-50 text-red-600"}`}>
              {message.text}
            </div>
          )}

          {/* Email Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: { value: /^\S+@\S+$/i, message: "Format email tidak valid" }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#59cfb7] transition-all"
                placeholder="contoh@email.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || message.type === "success"}
              className="w-full py-3 text-white font-bold bg-[#00997a] rounded-lg hover:bg-[#007a61] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Daftar dengan Email"}
            </button>
          </form>

          {/* The "Or" Divider */}
          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Atau daftar dengan
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google Registration Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage({ type: "error", text: "Google login dibatalkan" })}
              theme="outline"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-[#00997a] hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>
    </GoogleOAuthProvider>
  );
}