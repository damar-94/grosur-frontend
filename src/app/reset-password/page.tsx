"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axiosInstance";
import { toast } from "sonner";
import { FiLock, FiEye, FiEyeOff, FiLoader, FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Kata sandi tidak cocok");
    }

    if (!token || !email) {
      return toast.error("Link tidak valid atau data tidak lengkap");
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        email,
        password,
      });


      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Kata sandi berhasil diatur ulang!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengatur ulang kata sandi");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-[#59cfb7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-[#00997a] w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Selesai!</h2>
          <p className="text-gray-500 mb-8">
            Kata sandi Anda telah berhasil diperbarui. Silakan login kembali dengan kata sandi baru Anda.
          </p>
          <Link 
            href="/login" 
            className="block w-full py-3 bg-[#00997a] text-white font-black rounded-xl hover:bg-[#007a61] transition-all shadow-lg shadow-[#00997a]/20"
          >
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Link Tidak Valid</h2>
          <p className="text-gray-500 mb-8">
            Link pengaturan ulang kata sandi tidak valid atau telah kadaluarsa. Silakan ajukan permintaan baru.
          </p>
          <Link 
            href="/forgot-password" 
            className="block w-full py-3 bg-[#00997a] text-white font-black rounded-xl hover:bg-[#007a61] transition-all"
          >
            Minta Link Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Atur Ulang Sandi</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Masukkan kata sandi baru Anda di bawah ini. Pastikan kata sandi Anda kuat dan mudah diingat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#59cfb7]/20 focus:border-[#00997a] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#59cfb7]/20 focus:border-[#00997a] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 bg-[#00997a] text-white font-black rounded-xl shadow-lg shadow-[#00997a]/20 hover:bg-[#007a61] hover:scale-[1.02] transition-all flex items-center justify-center gap-2",
              isLoading && "opacity-80 cursor-not-allowed"
            )}
          >
            {isLoading ? <FiLoader className="animate-spin" /> : "Simpan Kata Sandi Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
