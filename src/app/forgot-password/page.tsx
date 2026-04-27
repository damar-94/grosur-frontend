"use client";

import { useState } from "react";
import { api } from "@/lib/axiosInstance";
import { toast } from "sonner";
import Link from "next/link";
import { FiMail, FiArrowLeft, FiCheckCircle, FiLoader } from "react-icons/fi";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setIsSent(true);
        toast.success("Email pemulihan telah dikirim!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim email pemulihan");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-[#59cfb7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-[#00997a] w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Cek Email Anda</h2>
          <p className="text-gray-500 mb-8">
            Instruksi pemulihan kata sandi telah dikirim ke <span className="font-bold text-gray-900">{email}</span>. Silakan periksa kotak masuk atau folder spam Anda.
          </p>
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="block w-full py-3 bg-[#00997a] text-white font-black rounded-xl hover:bg-[#007a61] transition-all shadow-lg shadow-[#00997a]/20"
            >
              Kembali ke Login
            </Link>
            <button 
              onClick={() => setIsSent(false)}
              className="text-sm font-bold text-gray-400 hover:text-[#00997a] transition-colors"
            >
              Tidak menerima email? Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#00997a] transition-colors mb-8 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Login
        </Link>

        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Lupa Kata Sandi?</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Jangan khawatir, hal ini biasa terjadi. Masukkan alamat email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#59cfb7]/20 focus:border-[#00997a] outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 bg-[#00997a] text-white font-black rounded-xl shadow-lg shadow-[#00997a]/20 hover:bg-[#007a61] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2",
              isLoading && "opacity-80 cursor-not-allowed hover:scale-100"
            )}
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin" /> Mengirim...
              </>
            ) : (
              "Kirim Link Pemulihan"
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Butuh bantuan lebih lanjut? <Link href="/support" className="text-[#00997a] font-bold hover:underline">Hubungi kami</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
