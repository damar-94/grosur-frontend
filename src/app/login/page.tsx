"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/schemas/auth.schema";
import { api } from "@/lib/axiosInstance";
import { useAppStore } from "@/stores/useAppStore";
import Link from "next/link";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAppStore((state) => state.setUser);
  const [serverError, setServerError] = useState("");

  const isVerified = searchParams.get("verified") === "true";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Standard Email/Password Login
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

  // Google Social Login Flow
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setServerError("");
      // Send the Google token to our backend API we wrote earlier
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      // Based on our auth.controller.ts, user data is inside res.data.data.user
      const userData = res.data.data.user;
      setUser(userData);

      if (userData.role === "SUPER_ADMIN") router.push("/admin/dashboard");
      else if (userData.role === "STORE_ADMIN") router.push("/store-admin/dashboard");
      else router.push("/");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Google Login gagal");
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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

          </div>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2.5 mt-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#00997a] focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-[#00997a] hover:underline">
            Lupa Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 text-white font-bold bg-[#00997a] rounded-md hover:bg-[#007a61] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      {/* --- GOOGLE LOGIN --- */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-[#8e8e8e]">Atau masuk dengan</span>
        </div>
      </div>

      <div className="flex justify-center">
        {googleClientId ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setServerError("Gagal terhubung dengan Google")}
          />
        ) : (
          <button
            type="button"
            className="flex items-center justify-center w-fit px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-all"
            onClick={() => setServerError("GSI Client ID belum dikonfigurasi. Silakan hubungi pengembang.")}
          >
            <img 
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
              alt="Google Logo" 
              className="w-5 h-5 mr-3"
            />
            <span className="text-sm font-medium text-gray-700">Masuk dengan Google</span>
          </button>
        )}
      </div>

      <p className="text-sm text-center text-[#8e8e8e]">
        Belum punya akun? <Link href="/register" className="text-[#00997a] font-bold hover:underline">Daftar di sini</Link>
      </p>
    </div>
  );
}

import AuthHeader from "@/components/auth/AuthHeader";

export default function LoginPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AuthHeader title="Log In" />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="text-center text-gray-500">Memuat...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );

  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}
